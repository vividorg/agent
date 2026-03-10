import { LongTermMemory } from "./memory/LongTermMemory";
import { ShortTermMemory } from "./memory/ShortTermMemory";
import { AIEngine } from "./AI/AIEngine";
import { Action, ToolInput, SkillInput } from "./AI/types";
import { ToolsManager } from "./tools/ToolsManager";
import { Logger } from "./utils/Logger";

export class Agent {
    constructor(
        public longTerm: LongTermMemory,
        public shortTerm: ShortTermMemory,
        public ai: AIEngine,
        private toolsManager: ToolsManager,
        private logger: Logger
    ) { }

    private async executeTool(content: ToolInput): Promise<any> {
        return this.toolsManager.executeTool(content.tool, content.operation, content.params)
    }

    private async executeSkill(content: SkillInput): Promise<any> {
        return `Skill ${content.skill} operation ${content.operation} executed with params: ${JSON.stringify(content.params)}`;
    }

    async receiveInput(input: string): Promise<string> {
        this.shortTerm.appendInput(input);
        let longMemory = await this.longTerm.read();

        let action: Action = await this.ai.decide(this.shortTerm.snapshot(), longMemory, input);

        let attempts = 0;
        const MAX_ATTEMPTS = 3;

        while (true) {
            try {
                switch (action.type) {
                    case "memory":
                        if (typeof action.content !== 'string') {
                            throw new Error('Memory action content must be a string');
                        }
                        await this.longTerm.append(action.content);
                        this.shortTerm.context.memory = action.content;
                        action = await this.ai.decide(this.shortTerm.snapshot(), longMemory, "", "Respond with type 'text' summarizing what you just did. Never return empty content.");
                        break;

                    case "text":
                        if (typeof action.content !== 'string') {
                            throw new Error('Text action content must be a string');
                        }
                        return action.content;

                    case "tool":
                        if (typeof action.content === 'string' || !('tool' in action.content) || !('operation' in action.content)) {
                            throw new Error('Tool action content must be a ToolInput object with tool and operation');
                        }
                        const toolResultValue = await this.executeTool(action.content);

                        if (!this.shortTerm.context.toolHistory) {
                            this.shortTerm.context.toolHistory = [];
                        }
                        this.shortTerm.context.toolHistory.push({
                            tool: action.content.tool,
                            operation: action.content.operation,
                            params: action.content.params,
                            result: toolResultValue,
                            timestamp: Date.now()
                        });
                        this.shortTerm.context.toolResult = {
                            tool: action.content.tool,
                            operation: action.content.operation,
                            result: toolResultValue
                        };

                        action = await this.ai.decide(this.shortTerm.snapshot(), longMemory, "", "Decide next step after tool execution");
                        break;

                    case "skill":
                        if (typeof action.content === 'string' || !('skill' in action.content) || !('operation' in action.content)) {
                            throw new Error('Skill action content must be a SkillInput object with skill and operation');
                        }
                        const skillResultValue = await this.executeSkill(action.content);

                        if (!this.shortTerm.context.skillHistory) {
                            this.shortTerm.context.skillHistory = [];
                        }
                        this.shortTerm.context.skillHistory.push({
                            skill: action.content.skill,
                            operation: action.content.operation,
                            params: action.content.params,
                            result: skillResultValue,
                            timestamp: Date.now()
                        });
                        this.shortTerm.context.skillResult = {
                            skill: action.content.skill,
                            operation: action.content.operation,
                            result: skillResultValue
                        };

                        action = await this.ai.decide(this.shortTerm.snapshot(), longMemory, "", "Decide next step after skill execution");
                        break;

                    default:
                        throw new Error(`Invalid action type: "${action.type}". Allowed types are: text, memory, tool, skill. Your output was: ${JSON.stringify(action)}`);
                }
            } catch (error: any) {
                attempts++;
                if (attempts >= MAX_ATTEMPTS) {
                    throw new Error(`Agent failed to produce valid action after ${MAX_ATTEMPTS} attempts. Last error: ${error.message}`);
                }

                await this.logger.error(`Action error (attempt ${attempts}/${MAX_ATTEMPTS}):`, error.message);

                action = await this.ai.decide(
                    this.shortTerm.snapshot(),
                    longMemory,
                    "",
                    `The previous action was invalid: ${error.message}. Please provide a valid JSON action with correct type and structure. This is attempt ${attempts} of ${MAX_ATTEMPTS}.`
                );
            }
        }
    }
}