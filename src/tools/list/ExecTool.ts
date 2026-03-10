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

    private blockList: string[] = [
        ":(){ :|:& };:",
        "shutdown",
        "reboot",
        "poweroff",
        "/dev/sd",
        "dd if=",
        "format",
        "mkfs",
        "diskpart",
        "rm -rf",
        "del /f",
        "rmdir /s"
    ]

    private isBlocked(command: string): boolean {
        command = command.toLowerCase();

        for (const cmd of this.blockList) {
            if (command.includes(cmd.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    public async execute(operation: any, params: any, rootPath: string): Promise<any> {
        if (operation !== "run")  {
            return `Unknown operation: ${operation}`;
        }

        const command = params?.command;
        if (!command || typeof command !== 'string') {
            return 'Error: parameter "command" must be a string.';
        }

        if (this.isBlocked(command)) return `The command ${command} is blocked for security reasons.`;

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