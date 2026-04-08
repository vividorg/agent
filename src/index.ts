#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import { runService } from "./server";
import { runTui } from "./tui";
import { EngineName } from "./runtime";

dotenv.config({ quiet: true });

async function main() {
    const cli = yargs(hideBin(process.argv))
        .scriptName("vivid")
        .option("mock", {
            type: "boolean",
            default: false,
            describe: "Use mock AI engine instead of NVIDIA API",
        })
        .option("engine", {
            choices: ["nvidia", "llama", "mock"] as const,
            default: (process.env.AI_ENGINE as EngineName) || "nvidia",
            describe: "AI engine to use",
        })
        .command(
            "service",
            "Run vivid as an HTTP service",
            (cmd) =>
                cmd.option("port", {
                    type: "number",
                    default: Number(process.env.PORT || 3100),
                    describe: "Service port",
                }),
            async (argv) => {
                const engineName = (argv.mock ? "mock" : argv.engine) as EngineName;
                await runService(argv.port as number, engineName);
            }
        )
        .command(
            "tui",
            "Send prompt to vivid service (interactive or -m)",
            (cmd) =>
                cmd
                    .option("message", {
                        alias: "m",
                        type: "string",
                        describe: "Single prompt to send",
                    })
                    .option("url", {
                        type: "string",
                        default: process.env.VIVID_SERVICE_URL || "http://127.0.0.1:3100",
                        describe: "Vivid service URL",
                    }),
            async (argv) => {
                await runTui(argv.message as string | undefined, argv.url as string);
            }
        )
        .demandCommand(1)
        .strict()
        .help();

    await cli.parseAsync();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});