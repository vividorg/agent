import path from "path";
import { Tool, ToolOperation } from "../types";
import fsPromises from 'fs/promises';

export default class FileTool implements Tool {
    name = "file";
    description = "Read, write and delete files";
    operations: ToolOperation[] = [
        { name: "read", description: "Read file contents", params: { path: "string" } },
        { name: "write", description: "Write content to file", params: { path: "string", content: "string" } },
        { name: "delete", description: "Delete file", params: { path: "string" } }
    ];

    public async execute(operation: any, params: any, rootPath: string): Promise<any> {
        const filePath = params?.path;
        if (!filePath || typeof filePath !== 'string') return 'Error: parameter "path" must be a string.';

        const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const safePath = path.join(rootPath, relativePath);

        if (!safePath.startsWith(rootPath)) {
            return `Error: access outside the allowed directory is not allowed.`;
        }

        try {
            switch (operation) {
                case 'read': {
                    const data = await fsPromises.readFile(safePath, 'utf-8');
                    return `Contents of file ${filePath}:\n${data}`;
                }

                case 'write': {
                    const contentParam = params?.content;
                    if (contentParam === undefined) {
                        return 'Error: "content" parameter is required for writing.';
                    }

                    await fsPromises.mkdir(safePath, { recursive: true });
                    await fsPromises.writeFile(safePath, contentParam, 'utf-8');
                    return `File ${filePath} was successfully written.`;
                }

                case 'delete': {
                    fsPromises.unlink(safePath);
                    return `File ${filePath} was deleted.`;
                }
                default:
                    return `Unknown operation for tool file: ${operation}`;
            }
        } catch (err: any) {
            return `Error while performing operation ${operation} on file ${filePath}: ${err.message}`;
        }
    }
}