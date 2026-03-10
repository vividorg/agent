import { LongTermMemory } from "./memory/LongTermMemory";
import { ShortTermMemory } from "./memory/ShortTermMemory";
import { MockEngine } from "./AI/Mock";
import { NvidiaEngine } from "./AI/Nvidia";
import { Agent } from "./AgentManager";
import { Workspace } from "./workspace/Workspace";
import { ToolsManager } from "./tools/ToolsManager";
import os from "os";
import path from "path";
import fsPromises from "fs/promises";
import yargs, { help } from 'yargs';

import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const argv = yargs(process.argv.slice(2))
        .option('verbose', {
            type: 'count',
            alias: 'v',
            description: 'Increases the level of logging verbosity'
        })
        .option('help', {
            alias: 'h',
        })
        .option('mock', {
            alias: 'm',
        })
        .parseSync();

    const homeDir = os.homedir();
    const workspacePath = path.join(homeDir, "projects/luma_agent/.luma/workspace");
    const agentPath = path.join(homeDir, "projects/luma_agent/.luma/");

    const ws = new Workspace(workspacePath);
    await ws.init();
    const logger = ws.getLogger();

    await logger.info('Agent starting..');

    const toolsManager = new ToolsManager(agentPath);

    const isDev = __filename.endsWith('.ts');
    const toolsDir = path.join(__dirname, 'tools', 'list');
    const listDir = await fsPromises.readdir(toolsDir)
    logger.debug(listDir)
    const expectedExt = isDev ? '.ts' : '.js';

    for (const file of listDir) {
        if (file.endsWith(expectedExt)) {
            const module = await import(path.join(toolsDir, file));
            const ToolClass = module.default;
            if (ToolClass && typeof ToolClass === 'function') {
                const toolInstance = new ToolClass();
                toolsManager.registerTool(toolInstance);
            }
        }
    }

    const longTerm = new LongTermMemory(ws.wp("memory", "MEMORY.md"));
    const shortTerm = new ShortTermMemory(10);
    const ai = new NvidiaEngine({ apiKey: process.env.NVIDIA_API_KEY!, toolsManager }, logger);
    const ai2 = new MockEngine(logger);

    const agent = new Agent(longTerm, shortTerm, ai, toolsManager, logger);
    const agent2 = new Agent(longTerm, shortTerm, ai2, toolsManager, logger);

    let response;
    if (!argv.mock) {
        response = await agent.receiveInput(`Generate 50 unique brand names for a software development company. The names should be 6 letters long, 2 syllables, sound like real words but not be common English words. They should have a technical, modern feel. Avoid names ending in X or S. Avoid generic terms like core, prime, code. Provide them as a simple list.`);
        return;
    } else {
        response = await agent2.receiveInput(`use test`);
    }
    await logger.info(response);
}

main().catch(console.error);