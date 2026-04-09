import fetch from "node-fetch";
import { AIEngine } from "./AIEngine";
import { Action } from "./types";
import fsPromises from 'fs/promises';
import path from "path";
import { encoding_for_model } from "tiktoken";
import { ToolsManager } from "../tools/ToolsManager";
import { Logger } from "../utils/Logger";

interface NvidiaEngineOptions {
    apiKey: string;
    model?: string;
    toolsManager: ToolsManager;
}

const MODEL_MAX_TOKENS: Record<string, number> = {
    "moonshotai/kimi-k2.5": 262144,
};

const skills: 
{
    name: string;
    description: string;
    operations: { name: string; description: string; params?: Record<string, string> }[];
}[] = [];

export class NvidiaEngine extends AIEngine {
    private apiKey: string;
    private model: string;
    private maxContextTokens: number;
    private toolsManager: ToolsManager;

    constructor(options: NvidiaEngineOptions, logger: Logger) {
        super(logger);
        this.apiKey = options.apiKey;
        this.model = options.model || "moonshotai/kimi-k2.5";
        this.maxContextTokens = MODEL_MAX_TOKENS[this.model];
        this.toolsManager = options.toolsManager;
    }

    private async countTokens(messages: { role: string; content: string }[]): Promise<number> {
        try {
            const enc = encoding_for_model("gpt-4");
            let total = 0;
            for (const msg of messages) {
                total += enc.encode(msg.role).length;
                total += enc.encode(msg.content).length;
                total += 3;
            }
            enc.free();
            return total;
        } catch (e) {
            await this.logger.warn("tiktoken not available, using character‑based estimate");
            return messages.reduce((sum, msg) => sum + Math.ceil((msg.role.length + msg.content.length) / 4), 0);
        }
    }

    async decide(shortTerm: object, longTerm: string, input: string, inputSys: string): Promise<Action> {
        const instructionsContent = await fsPromises.readFile(path.join(__dirname + "/instructions.txt"), "utf-8");

        const toolsMessage = this.toolsManager.getToolsDescription();

        let skillsMessage = "No skills are available to you.";
        if (skills.length > 0) {
            skillsMessage = "Available skills:\n" + skills.map(s => {
                const ops = s.operations.map(op => {
                    const params = op.params ? `Params: ${JSON.stringify(op.params)}` : "";
                    return `    - ${op.name}: ${op.description} ${params}`.trim();
                }).join("\n");
                return `- ${s.name}: ${s.description}\n${ops}`;
            }).join("\n");
        }

        const messages = [
            { role: "system", content: instructionsContent },
            { role: "system", content: `Long-term memory:\n${longTerm}` },
            { role: "system", content: `Short-term memory:\n${JSON.stringify(shortTerm, null, 2)}` },
            { role: "system", content: toolsMessage },
            { role: "system", content: skillsMessage }
        ];

        if (input != "") {
            messages.push({ role: "user", content: input });
        } else if (inputSys) {
            messages.push({ role: "system", content: inputSys });
        }

        await this.logger.data(messages);

        const inputTokens = await this.countTokens(messages);
        const SAFETY_MARGIN = 100;
        let maxTokens = this.maxContextTokens - inputTokens - SAFETY_MARGIN;
        maxTokens = Math.max(100, maxTokens);

        await this.logger.info("Number of usable tokens " + maxTokens)

        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                max_tokens: maxTokens,
                temperature: 1,
                top_p: 1.0,
                stream: false
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API returned ${res.status}: ${errText}`);
        }

        const raw = await res.json();
        const data = raw as {
            choices?: { message?: { content?: string } }[];
        };

        let rawContent = data.choices?.[0]?.message?.content ?? "";
        
        // Robust balanced JSON extraction
        const extractFirstJson = (str: string) => {
            const start = str.indexOf('{');
            if (start === -1) return str;
            let depth = 0;
            let insideString = false;
            let escaped = false;
            for (let i = start; i < str.length; i++) {
                const char = str[i];
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (char === '\\') {
                    escaped = true;
                    continue;
                }
                if (char === '"') {
                    insideString = !insideString;
                    continue;
                }
                if (!insideString) {
                    if (char === '{') depth++;
                    else if (char === '}') {
                        depth--;
                        if (depth === 0) return str.substring(start, i + 1);
                    }
                }
            }
            return str.substring(start);
        };

        rawContent = extractFirstJson(rawContent).trim();

        await this.logger.data("--------------------------")
        await this.logger.data("FULL DATA:", JSON.stringify(raw, null, 2));
        await this.logger.data("--------------------------")

        let action: Action;
        try {
            if (!rawContent || rawContent.trim() === "") {
                throw new Error("AI returned empty content");
            }
            action = JSON.parse(rawContent);
            if (!action.type || !("content" in action)) {
                throw new Error("Missing type/content fields");
            }
        } catch (err) {
            await this.logger.error("Failed to parse AI output as JSON:", err, "Raw:", rawContent);
            throw new Error(`AI returned invalid JSON: ${(err as Error).message}`);
        }

        await this.logger.res("AI Decision", action);
        return action;
    }
}