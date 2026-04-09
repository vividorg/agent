import { Tool } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default class FileTool implements Tool {
    name = 'exec';
    description = 'Execute Linux commands on the host system (use with caution)';
    operations = [
        {
            name: 'run',
            description: 'Run a shell command and return its output',
            params: { command: 'string' }
        }
    ];

    private blockList: { pattern: string, suggestion?: string }[] = [
        { pattern: ":(){ :|:& };:" },
        { pattern: "shutdown" },
        { pattern: "reboot" },
        { pattern: "poweroff" },
        { pattern: "/dev/sd" },
        { pattern: "dd if=", suggestion: "Use 'fallocate -l' or 'truncate -s' to create predictably sized files instead." },
        { pattern: "format" },
        { pattern: "mkfs" },
        { pattern: "diskpart" },
        { pattern: "rm -rf", suggestion: "Consider using the FileTool's delete operation for safe file/folder removal." },
        { pattern: "del /f" },
        { pattern: "rmdir /s" }
    ];

    private getBlockReason(command: string): string | null {
        const lowerCmd = command.toLowerCase();

        for (const block of this.blockList) {
            if (lowerCmd.includes(block.pattern.toLowerCase())) {
                let msg = `The command is blocked for security reasons (matched pattern: '${block.pattern}').`;
                if (block.suggestion) {
                    msg += `\nSuggestion: ${block.suggestion}`;
                }
                return msg;
            }
        }

        return null;
    }

    public async execute(operation: any, params: any, rootPath: string): Promise<any> {
        if (operation !== "run")  {
            return `Unknown operation: ${operation}`;
        }

        const command = params?.command;
        if (!command || typeof command !== 'string') {
            return 'Error: parameter "command" must be a string.';
        }

        const blockReason = this.getBlockReason(command);
        if (blockReason) return blockReason;

        try {
            const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
            let result = '';

            if (stdout) result += `STDOUT:\n${stdout}`;
            if (stderr) result += `\nSTDERR:\n${stderr}`;
            if (!stdout && !stderr) result = 'Command executed successfully (no output).';

            return result.trim();
        } catch (e: any) {
            let eMsg = `Command failed with code ${e.code}`;

            if (e.stdout) eMsg += `\nSTDOUT:\n${e.stdout}`;
            if (e.stderr) eMsg += `\nSTDERR:\n${e.stderr}`;
            if (e.signal) eMsg += `\nTerminated by signal: ${e.signal}`;
            if (e.message && !e.stdout && !e.stderr) eMsg += `\n${e.message}`;

            return eMsg;
        }
    }
}