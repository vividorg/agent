import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import fetch from "node-fetch";

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

export async function runTui(message: string | undefined, serviceUrl: string): Promise<void> {
    if (message && message.trim()) {
        const response = await sendPrompt(serviceUrl, message);
        console.log(response);
        return;
    }

    const rl = createInterface({ input, output });
    try {
        while (true) {
            const prompt = (await rl.question("prompt> ")).trim();
            if (!prompt) {
                continue;
            }
            if (prompt === "/exit" || prompt === "/quit") {
                break;
            }
            const response = await sendPrompt(serviceUrl, prompt);
            console.log(`\n${response}\n`);
        }
    } finally {
        rl.close();
    }
}
