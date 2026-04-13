# Vivid Agent

[![Discord](https://img.shields.io/discord/1480982120942928056?label=Discord&logo=discord)](https://discord.gg/HtqrZuNhs6)
[![GitHub issues](https://img.shields.io/github/issues/vividorg/agent)](https://github.com/vividorg/agent/issues)
[![License](https://img.shields.io/github/license/vividorg/agent)](LICENSE)

**Vivid Agent** is an extensible, open‑source framework for building autonomous AI agents in TypeScript. It combines persistent memory, tool execution, and a flexible AI engine to create agents that can run tasks with minimal supervision—or respond to user requests on demand.

> 🚧 **Actively developed** – we're looking for contributors to help shape the future of autonomous agents!

## ✨ Features
- **Memory system** – Long‑term (Markdown file) and short‑term (in‑memory context) memories.
- **Tool framework** – Easily add tools (file manipulation, command execution, etc.) with sandboxing.
- **AI engine abstraction** – Use NVIDIA's models, a mock engine for testing, or plug in your own.
- **Workspace isolation** – All files and logs are contained in a dedicated directory.
- **Logging** – Coloured console output + file logs with multiple levels.

## 🎯 Vision
We aim to build a **reliable, self‑hosted agent** that can:
- Run autonomously in the background, performing scheduled tasks.
- Learn from interactions via long‑term memory.
- Be extended with custom tools and skills by the community.

## 🚦 Quick Start

```bash
git clone https://github.com/vividorg/agent.git
cd agent
npm install
npm run build
chmod +x dist/index.js
npm link
```

Start the service and open an interactive session:

```bash
vivid service         # start the agent service
vivid tui             # open interactive prompt (/exit to quit)
```

Or send a one-shot prompt:

```bash
vivid tui -m "Hello, what can you do?"
```

> **Without `npm link`:** use `npm run service` and `npm run tui` instead of `vivid service` / `vivid tui`.

Default service URL is `http://127.0.0.1:3100`, configurable via `--url` or `VIVID_SERVICE_URL`.

## 🧩 CLI Reference

| Command | Description |
|---|---|
| `vivid service` | Start HTTP service for incoming prompts (`POST /prompt`) |
| `vivid tui` | Open interactive CLI prompt window |
| `vivid tui -m "prompt"` | Send one prompt and exit |
| `vivid service --mock` | Start with mock AI engine (no API key needed) |
| `vivid service --engine nvidia\|llama\|mock` | Choose AI provider |

## 🦙 Local AI via llama.cpp

1. Start `llama.cpp` with an OpenAI-compatible endpoint:

```bash
./llama-server -m /path/to/model.gguf --host 0.0.0.0 --port 8080
```

2. Copy `.env.example` to `.env` and configure:

```bash
AI_ENGINE=llama
LLAMA_BASE_URL=http://127.0.0.1:8080
LLAMA_MODEL=local
LLAMA_MAX_TOKENS=4096
NVIDIA_API_KEY=nvapi-key   # not required for llama engine
```

3. Run:

```bash
vivid service
vivid tui -m "Hi there, what can you do?"
```

## 🐳 Docker

```bash
docker compose up -d --build
vivid tui -m "Hi there, what can you do?"
```

Agent data is persisted in `./data/` (`VIVID_HOME=/data` inside the container).

## ⚙️ Run as a Background Service (PM2)

```bash
vivid service &       # simple background start
```

Or with [PM2](https://pm2.io/docs/runtime/guide/installation/) for process management:

```bash
npm run pm2:start
pm2 status
npm run pm2:stop
```

Storage path is configurable via `VIVID_HOME` (default: `./.vivid` in the working directory).

## 🤝 Join the Community

Development happens in the open, and we'd love your help!
- **[Discord](https://discord.gg/HtqrZuNhs6)** – real‑time discussions, support, and ideas.
- **[GitHub Issues](https://github.com/vividorg/agent/issues)** – report bugs or suggest features.
- **[Contributing guide](CONTRIBUTING.md)** – look for [good first issues](https://github.com/vividorg/agent/labels/good%20first%20issue) to get started.