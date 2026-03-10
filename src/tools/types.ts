export interface ToolOperation {
    name: string,
    description: string,
    params?: Record<string, string>;
}

export interface Tool {
    name: string,
    description: string,
    operations: ToolOperation[],
    execute(operation: any, params: any, rootPath?: string): Promise<any>;
}