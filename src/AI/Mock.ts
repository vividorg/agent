import { AIEngine } from "./AIEngine";
import { Action, ToolInput, SkillInput } from "./types";
import { Logger } from "../utils/Logger";

export class MockEngine extends AIEngine {
    constructor(logger: Logger) {
        super(logger);
    }

    async decide(shortTerm: object, longTerm: string, input: string, inputSys: string): Promise<Action> {
        input = input.toLowerCase().trim();
        await this.logger.info(shortTerm)

        if (input.includes("use test")) {
            return {
                type: "tool",
                content: { tool: "test", operation: "run", params: { command: "hello" } }
            };
        }
        
        if (input.includes("use skill")) {
            return {
                type: "skill",
                content: { skill: "demoSkill", operation: "execute", params: { value: 42 } }
            };
        }

        if (input.includes("remember")) {
            return {
                type: "memory",
                content: input.replace("remember", "").trim()
            };
        }

        return {
            type: "text",
            content: `Echo: ${input || "Hello! This is a mock response."}`
        };
    }
}