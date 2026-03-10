export class ShortTermMemory {
    private lastInputs: string[] = [];
    public context: Record<string, any> = {};

    constructor(private maxInputs: number = 10) {}

    appendInput(input: string) {
        this.lastInputs.push(input);
        if (this.lastInputs.length > this.maxInputs) {
            this.lastInputs.shift();
        }
    }

    snapshot() {
        const truncateString = (str: string, maxLen: number = 50) => 
            str.length > maxLen ? str.substring(0, maxLen) + '…' : str;

        const contextCopy = JSON.parse(JSON.stringify(this.context));

        if (contextCopy.toolHistory && Array.isArray(contextCopy.toolHistory)) {
            contextCopy.toolHistory.forEach((entry: any) => {
                if (entry.params && entry.params.content && typeof entry.params.content === 'string') {
                    entry.params.content = truncateString(entry.params.content);
                }
                if (entry.result && typeof entry.result === 'string') {
                    entry.result = truncateString(entry.result);
                }
            });
        }

        if (contextCopy.skillHistory && Array.isArray(contextCopy.skillHistory)) {
            contextCopy.skillHistory.forEach((entry: any) => {
                if (entry.params && entry.params.content && typeof entry.params.content === 'string') {
                    entry.params.content = truncateString(entry.params.content);
                }
                if (entry.result && typeof entry.result === 'string') {
                    entry.result = truncateString(entry.result);
                }
            });
        }

        return {
            lastInputs: [...this.lastInputs],
            context: contextCopy
        };
    }

    clear() {
        this.lastInputs = [];
        this.context = {};
    }
}