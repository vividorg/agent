import fetch from "node-fetch";
import { AIEngine } from "./AIEngine";
import { Action } from "./types";
import fsPromises from "fs/promises";
import path from "path";
import { encoding_for_model } from "tiktoken";
import { ToolsManager } from "../tools/ToolsManager";
import { Logger } from "../utils/Logger";

interface LlamaEngineOptions {
    baseUrl: string;
    model?: string;
    maxContextTokens?: number;
    toolsManager: ToolsManager;
}

const MODEL_MAX_TOKENS: Record<string, number> = {
    "local": 4096,
};

const skills: 
{
    name: string;
    description: string;
    operations: { name: string; description: string; params?: Record<string, string> }[];
}[] = [];

export class LlamaEngine extends AIEngine {
    private baseUrl: string;
    private model: string;
    private maxContextTokens: number;
    private toolsManager: ToolsManager;

    constructor(options: LlamaEngineOptions, logger: Logger) {
        super(logger);
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.model = options.model || "local";
        this.maxContextTokens = options.maxContextTokens || MODEL_MAX_TOKENS[this.model] || 4096;
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
        const instructionsContent = await fsPromises.readFile(path.join(__dirname, "instructions.txt"), "utf-8");
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

        let systemContent = [
            instructionsContent,
            `Long-term memory:\n${longTerm}`,
            `Short-term memory:\n${JSON.stringify(shortTerm, null, 2)}`,
            toolsMessage,
            skillsMessage
        ].join("\n\n");

        if (inputSys && input) {
            systemContent += `\n\nSystem Event/Instruction:\n${inputSys}`;
        }

        const messages: any[] = [
            { role: "system", content: systemContent },
        ];

        if (input) {
            messages.push({ role: "user", content: input });
        } else if (inputSys) {
            messages.push({ role: "user", content: `System Event/Instruction:\n${inputSys}` });
        } else {
            messages.push({ role: "user", content: "Continue." });
        }

        await this.logger.data(messages);

        const inputTokens = await this.countTokens(messages);
        const SAFETY_MARGIN = 100;
        let maxTokens = this.maxContextTokens - inputTokens - SAFETY_MARGIN;
        maxTokens = Math.max(100, maxTokens);

        await this.logger.info("Number of usable tokens " + maxTokens)

        const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.model,
                messages,
                max_tokens: maxTokens,
                temperature: 0.2,
                stream: false,
            }),
        });

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`llama.cpp request failed (${res.status}): ${errorBody}`);
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
                throw new Error("Missing type/content fields in JSON response");
            }
            if (!["text", "memory", "tool", "skill"].includes(action.type)) {
                throw new Error(`Invalid action type generated: ${action.type}`);
            }
        } catch (err: any) {
            await this.logger.error("Failed to parse llama.cpp output as JSON:", err.message, "Raw:", rawContent);
            throw new Error(`Invalid JSON format generated: ${err.message}. Raw output: ${rawContent.substring(0, 50)}...`);
        }

        await this.logger.res("AI Decision", action);
        return action;
    }
}
