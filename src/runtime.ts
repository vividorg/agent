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

export type AgentRuntime = {
    runPrompt: (prompt: string) => Promise<string>;
};

export type EngineName = "nvidia" | "llama" | "mock";

export async function createRuntime(engineName: EngineName): Promise<AgentRuntime> {
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
