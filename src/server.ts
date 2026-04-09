import { createServer, IncomingMessage, ServerResponse } from "http";
import { createRuntime, EngineName } from "./runtime";

async function readRequestBody(req: IncomingMessage): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

function writeJson(res: ServerResponse, statusCode: number, body: unknown): void {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
}

export async function runService(port: number, engineName: EngineName, verbosity: number = 0): Promise<void> {
    const runtime = await createRuntime(engineName, verbosity);

    const server = createServer(async (req, res) => {
        try {
            if (req.method === "GET" && req.url === "/health") {
                writeJson(res, 200, { ok: true });
                return;
            }

            if (req.method === "POST" && req.url === "/prompt") {
                const rawBody = await readRequestBody(req);
                const body = rawBody ? JSON.parse(rawBody) : {};
                const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
                if (!prompt) {
                    writeJson(res, 400, { error: "Missing required field: prompt" });
                    return;
                }

                const response = await runtime.runPrompt(prompt);
                writeJson(res, 200, { response });
                return;
            }

            writeJson(res, 404, { error: "Not found" });
        } catch (error: any) {
            writeJson(res, 500, { error: error?.message || "Internal error" });
        }
    });

    await new Promise<void>((resolve) => {
        server.listen(port, "0.0.0.0", () => resolve());
    });

    // Keep process alive as a long-running service.
    console.log(`Vivid service listening on http://0.0.0.0:${port}`);
}
