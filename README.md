# Vivid Agent

[![Discord](https://img.shields.io/discord/1234567890?label=Discord&logo=discord)](https://discord.gg/invite)
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
- **Chat with us on [Discord](https://discord.gg/invite) \(preparing\)** – real‑time discussions, support, and ideas.  
- **Report issues** or suggest features via [GitHub Issues](https://github.com/vividorg/agent/issues).  
- **Contribute** – check the [contributing guide](CONTRIBUTING.md) and look for [good first issues](https://github.com/vividorg/agent/labels/good%20first%20issue).

## 🚦 Quick Start
```bash
git clone https://github.com/vividorg/agent.git
cd agent
npm install
npm run dev