import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import fetch from "node-fetch";
import chalk from "chalk";
import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

async function sendPrompt(serviceUrl: string, prompt: string): Promise<string> {
    const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    const data = (await res.json()) as { response?: string; error?: string };
    if (!res.ok) {
        throw new Error(data.error || `Service request failed (${res.status})`);
    }
    return data.response || "";
}

export async function runTui(message: string | undefined, serviceUrl: string, verbosity: number = 0): Promise<void> {
    const markedInstance = new Marked();

    markedInstance.use(markedTerminal({
        codespan: chalk.bgGray.white,
        code: chalk.magenta,
        firstHeading: chalk.green.bold.underline,
        heading: chalk.green.bold,
        strong: chalk.bold,
        em: chalk.italic,
        listitem: chalk.white,
        table: chalk.white,
        paragraph: chalk.white,
    }) as any);

    const handlePrompt = async (p: string) => {
        try {
            return await sendPrompt(serviceUrl, p);
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED') {
                throw new Error(`Could not connect to Vivid service at ${serviceUrl}. Is the service running? (npm run service)`);
            }
            throw err;
        }
    };

    const render = (text: string) => {
        return markedInstance.parse(text, { async: false }) as string;
    };

    const promptText = chalk.hex("FFA500")("vivid › ");
    const responsePrefix = chalk.green("response");

    if (message && message.trim()) {
        try {
            const response = await handlePrompt(message);
            console.log(`\n${responsePrefix}${render(response).trimEnd()}\n`);
        } catch (err: any) {
            console.error(chalk.red(err.message));
        }
        return;
    }

    const rl = createInterface({ input, output });
    try {
        while (true) {
            let prompt: string;
            try {
                prompt = (await rl.question(promptText)).trim();
            } catch (err: any) {
                if (err.code === 'ABORT_ERR') {
                    console.log();
                    return;
                }
                throw err;
            }

            if (!prompt) {
                continue;
            }
            if (prompt === "/exit" || prompt === "/quit") {
                break;
            }
            try {
                const response = await handlePrompt(prompt);
                console.log(`\n${responsePrefix}${render(response).trimEnd()}`);
            } catch (err: any) {
                console.error(chalk.red(`\nError: ${err.message}\n`));
            }
        }
    } finally {
        rl.close();
    }
}
