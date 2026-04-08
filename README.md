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

## 🤝 Join the Community
Development happens in the open, and we’d love your help!  
- **Chat with us on [Discord](https://discord.gg/invite)** – real‑time discussions, support, and ideas.  
- **Report issues** or suggest features via [GitHub Issues](https://github.com/vividorg/agent/issues).  
- **Contribute** – check the [contributing guide](CONTRIBUTING.md) and look for [good first issues](https://github.com/vividorg/agent/labels/good%20first%20issue).

## 🚦 Quick Start
```bash
git clone https://github.com/vividorg/agent.git
cd agent
npm install
npm run build
npm run service
```

In another terminal:

```bash
# one-shot prompt
npm run tui -- -m "Hello from CLI"

# interactive prompt window (/exit to quit)
npm run tui
```

## 🧩 CLI Commands

To make the `vivid` command available globally anywhere in your terminal, grant execution rights to the built script and link the package:
```bash
chmod +x dist/index.js
npm link
```

After doing this, you can run the following commands:
- `vivid service` – runs HTTP service for incoming prompts (`POST /prompt`).
- `vivid tui` – opens an interactive CLI prompt window.
- `vivid tui -m "prompt"` – sends one prompt and exits.
- `--mock` – starts service with mock AI engine.
- `--engine nvidia|llama|mock` – choose AI provider.

Default service URL is `http://127.0.0.1:3000`, configurable using `--url` or `VIVID_SERVICE_URL`.

## 🦙 Local AI via llama.cpp
1. Start `llama.cpp` server with OpenAI-compatible endpoint:
```bash
./llama-server -m /path/to/model.gguf --host 0.0.0.0 --port 8080
```
2. Configure Vivid:
```bash
export NVIDIA_API_KEY=nvapi-key
export AI_ENGINE=llama
export LLAMA_BASE_URL=http://127.0.0.1:8080
export LLAMA_MODEL=local
export LLAMA_MAX_TOKENS=4096
```
> 💡 **Tip:** We recommend copying `.env.example` to `.env` and configuring these values there instead of exporting them manually.

3. Run service and send prompt:
```bash
npm run service
npm run tui -- -m "Hi there, what can you do?"
```

## 🐳 Run in Docker
```bash
# build and run service
docker compose up -d --build

# send prompt to the containerized service
vivid tui -m "Hi there, what can you do?"
```

The Docker setup persists agent data in the local `./data/` folder (`VIVID_HOME=/data` in container).

## ⚙️ Run as Service with PM2
```bash
npm run build
npm run pm2:start

# check status
pm2 status

# stop service
npm run pm2:stop
```

Alternatively, if you prefer to use `pm2` directly, you can use the provided `ecosystem.config.cjs` as a starting point:
```bash
pm2 start ecosystem.config.cjs
pm2 stop vivid-agent
pm2 logs vivid-agent
```

For other PM2 commands, refer to [PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

You can customize storage path with `VIVID_HOME` (default: `./.vivid` in current working directory).
