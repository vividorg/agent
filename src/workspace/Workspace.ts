import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { Logger } from '../utils/Logger';

export class Workspace {
    wpDir: string;
    private dirs: string[];
    private files: string[];
    private logger: Logger | null = null;

    constructor(wpDir: string) {
        this.wpDir = wpDir;

        this.dirs = [
            this.wpDir,
            this.wp("memory"),
        ]

        this.files = [
            this.wp("TEST.md"),
            this.wp("memory", "MEMORY.md")
        ]
    }

    public wp(...names: string[]) {
        return path.join(this.wpDir, ...names);
    }

    public getLogger(): Logger {
        if (!this.logger) {
            throw new Error('Logger not initialized. Call init() first.');
        }
        return this.logger;
    }

    private async rwxToConstants(flag: number): Promise<number> {
        let _constants = fs.constants.F_OK;
    
        if (flag & 4) _constants |= fs.constants.R_OK;
        if (flag & 2) _constants |= fs.constants.W_OK;
        if (flag & 1) _constants |= fs.constants.X_OK;
    
        return _constants;
    }

    private async checkIfExists(path: string, rwx: number): Promise<boolean> {
        try {
            await fsPromises.access(path, await this.rwxToConstants(rwx));
            return true;
        } catch {
            return false;
        }
    }

    async init() {
        const logdir = path.join(this.wpDir, "../logs");
        const logFile = path.join(logdir, "app.log");

        await fsPromises.mkdir(logdir, { recursive: true })

        this.logger = new Logger(logFile, true);
        await this.logger.info('Workspace initialized');

        await Promise.all(
            this.dirs.map(async dir => {
                const exists = await this.checkIfExists(dir, 0);
                if (!exists) {
                    await this.logger!.info("Creating dir", dir)
                    await fsPromises.mkdir(dir, { recursive: true })
                }
            })
        )

        await Promise.all(
            this.files.map(async file => {
                const exists = await this.checkIfExists(file, 0);
                if (!exists) {
                    await this.logger!.info("Creating file", file)
                    await fsPromises.writeFile(file, '# Luma workspace');
                }
            })
        )
    }
}