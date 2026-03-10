import { Tool } from "./types";
import { Logger } from "../utils/Logger";

export class ToolsManager {
    private tools: Record<string, Tool> = {};
    private rootPath: string;
    private logger: Logger;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.logger = new Logger;
    }

    registerTool(tool: Tool): void {
        this.tools[tool.name] = tool;
    }

    getToolsDescription() {
        const toolList = Object.values(this.tools);
        if (toolList.length === 0) {
            this.logger.warn("No avalaible tools.")
            return "No avalaible tools."
        }

        const lines: string[] = ['Available tools:'];
        for (const tool of toolList) {
            lines.push(`- ${tool.name}: ${tool.description}`);
            for ( const op of tool.operations) {
                const params = op.params ? `Params: ${JSON.stringify(op.params)}` : '';
                lines.push(`|-- ${op.name}: ${op.description} ${params}`.trim());
            }
        }
        this.logger.info(lines.join('\n'))
        return lines.join('\n');
    }

    async executeTool(toolName: string, operation: string, params: any): Promise<any> {
        const tool = this.tools[toolName]
        if (!tool) {
            const avalaible = Object.keys(this.tools).join(", ")
            return `Unknown tool "${toolName}". Avalaible tools: ${avalaible || "none"}`
        }
        return tool.execute(operation, params, this.rootPath);
    }
}