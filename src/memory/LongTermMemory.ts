import fsPromises from 'fs/promises';

export class LongTermMemory {
    constructor(public path:string) {}

    async read(): Promise<string> {
        return fsPromises.readFile(this.path, "utf-8");
    }

    async write(content:string): Promise<void> {
        await fsPromises.writeFile(this.path, content, "utf-8");
    }

    async append(content:string): Promise<void> {
        await fsPromises.appendFile(this.path, content, "utf-8");
    }
}