#!/usr/bin/env node
import { createServer, IncomingMessage, ServerResponse } from "http";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { LongTermMemory } from "./memory/LongTermMemory";
import { ShortTermMemory } from "./memory/ShortTermMemory";
import { MockEngine } from "./AI/Mock";
import { NvidiaEngine } from "./AI/Nvidia";
import { LlamaEngine } from "./AI/Llama";
import { Agent } from "./AgentManager";
import { Workspace } from "./workspace/Workspace";
import { ToolsManager } from "./tools/ToolsManager";
import path from "path";
import fsPromises from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

type AgentRuntime = {
    runPrompt: (prompt: string) => Promise<string>;
};

type EngineName = "nvidia" | "llama" | "mock";

async function createRuntime(engineName: EngineName): Promise<AgentRuntime> {
    const vividHome = process.env.VIVID_HOME || path.join(process.cwd(), ".vivid");
    const workspacePath = path.join(vividHome, "workspace");
    const agentPath = vividHome;

    const ws = new Workspace(workspacePath);
    await ws.init();
    const logger = ws.getLogger();
    await logger.info("Agent starting...");

    const toolsManager = new ToolsManager(agentPath);
    const toolsDir = path.join(__dirname, "tools", "list");
    const listDir = await fsPromises.readdir(toolsDir);

    for (const file of listDir) {
        if (!file.endsWith(".js") && !file.endsWith(".ts")) {
            continue;
        }
        const module = await import(path.join(toolsDir, file));
        const ToolClass =
            (typeof module.default === "function" && module.default) ||
            (typeof module.default?.default === "function" && module.default.default);
        if (ToolClass && typeof ToolClass === "function") {
            const toolInstance = new ToolClass();
            toolsManager.registerTool(toolInstance);
        }
    }

    const longTerm = new LongTermMemory(ws.wp("memory", "MEMORY.md"));
    const shortTerm = new ShortTermMemory(10);
    const ai =
        engineName === "mock"
            ? new MockEngine(logger)
            : engineName === "llama"
                ? new LlamaEngine(
                    {
                        baseUrl: process.env.LLAMA_BASE_URL || "http://127.0.0.1:8080",
                        model: process.env.LLAMA_MODEL || "local-model",
                        maxContextTokens: process.env.LLAMA_MAX_TOKENS ? parseInt(process.env.LLAMA_MAX_TOKENS, 10) : undefined,
                        toolsManager,
                    },
                    logger
                )
                : new NvidiaEngine({ apiKey: process.env.NVIDIA_API_KEY!, toolsManager }, logger);
    const agent = new Agent(longTerm, shortTerm, ai, toolsManager, logger);

    return {
        async runPrompt(prompt: string): Promise<string> {
            return agent.receiveInput(prompt);
        },
    };
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

function writeJson(res: ServerResponse, statusCode: number, body: unknown): void {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
}

async function runService(port: number, engineName: EngineName): Promise<void> {
    const runtime = await createRuntime(engineName);

    const server = createServer(async (req, res) => {
        try {
            if (req.method === "GET" && req.url === "/health") {
                writeJson(res, 200, { ok: true });
                return;
            }

            if (req.method === "POST" && req.url === "/prompt") {
                const rawBody = await readRequestBody(req);
                const body = rawBody ? JSON.parse(rawBody) : {};
                const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
                if (!prompt) {
                    writeJson(res, 400, { error: "Missing required field: prompt" });
                    return;
                }

                const response = await runtime.runPrompt(prompt);
                writeJson(res, 200, { response });
                return;
            }

            writeJson(res, 404, { error: "Not found" });
        } catch (error: any) {
            writeJson(res, 500, { error: error?.message || "Internal error" });
        }
    });

    await new Promise<void>((resolve) => {
        server.listen(port, "0.0.0.0", () => resolve());
    });

    // Keep process alive as a long-running service.
    // eslint-disable-next-line no-console
    console.log(`Vivid service listening on http://0.0.0.0:${port}`);
}

async function sendPrompt(serviceUrl: string, prompt: string): Promise<string> {
    const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    const data = (await res.json()) as { response?: string; error?: string };
    if (!res.ok) {
        throw new Error(data.error || `Service request failed (${res.status})`);
    }
    return data.response || "";
}

async function runTui(message: string | undefined, serviceUrl: string): Promise<void> {
    if (message && message.trim()) {
        const response = await sendPrompt(serviceUrl, message);
        // eslint-disable-next-line no-console
        console.log(response);
        return;
    }

    const rl = createInterface({ input, output });
    try {
        while (true) {
            const prompt = (await rl.question("prompt> ")).trim();
            if (!prompt) {
                continue;
            }
            if (prompt === "/exit" || prompt === "/quit") {
                break;
            }
            const response = await sendPrompt(serviceUrl, prompt);
            // eslint-disable-next-line no-console
            console.log(`\n${response}\n`);
        }
    } finally {
        rl.close();
    }
}

async function main() {
    const cli = yargs(hideBin(process.argv))
        .scriptName("vivid")
        .option("mock", {
            type: "boolean",
            default: false,
            describe: "Use mock AI engine instead of NVIDIA API",
        })
        .option("engine", {
            choices: ["nvidia", "llama", "mock"] as const,
            default: (process.env.AI_ENGINE as EngineName) || "nvidia",
            describe: "AI engine to use",
        })
        .command(
            "service",
            "Run vivid as an HTTP service",
            (cmd) =>
                cmd.option("port", {
                    type: "number",
                    default: Number(process.env.PORT || 3000),
                    describe: "Service port",
                }),
            async (argv) => {
                const engineName = (argv.mock ? "mock" : argv.engine) as EngineName;
                await runService(argv.port as number, engineName);
            }
        )
        .command(
            "tui",
            "Send prompt to vivid service (interactive or -m)",
            (cmd) =>
                cmd
                    .option("message", {
                        alias: "m",
                        type: "string",
                        describe: "Single prompt to send",
                    })
                    .option("url", {
                        type: "string",
                        default: process.env.VIVID_SERVICE_URL || "http://127.0.0.1:3000",
                        describe: "Vivid service URL",
                    }),
            async (argv) => {
                await runTui(argv.message as string | undefined, argv.url as string);
            }
        )
        .demandCommand(1)
        .strict()
        .help();

    await cli.parseAsync();
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
});