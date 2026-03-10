# Contributing to Vivid

Thank you for your interest in contributing to **Vivid**! 🎉  
We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Commit Message Format](#commit-message-format)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

---

## 📜 Code of Conduct

By participating in this project, you agree to follow our community standards:

- Be respectful and inclusive to all contributors.
- No harassment, hate speech, or discrimination of any kind.
- Keep discussions constructive and on-topic.
- Assume good intent from others.

Violations can be reported to the maintainers via Discord or GitHub.

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/vividorg/agent.git
   cd agent
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a `.env` file** based on `.env.example` and fill in your values.
5. **Run the bot** in development mode:
   ```bash
   npm run dev
   ```

---

## 🛠️ How to Contribute

### Fixing a Bug

1. Check [existing issues](https://github.com/vividorg/agent/issues) to see if it's already reported.
2. If not, open a new issue describing the bug before working on a fix.
3. Create a branch: `git checkout -b fix/your-bug-name`
4. Make your changes, test them, and submit a PR.

### Adding a Feature

1. Open a [feature request issue](https://github.com/vividorg/agent/issues/new) first to discuss it.
2. Wait for approval from a maintainer before spending time building it.
3. Create a branch: `git checkout -b feat/your-feature-name`
4. Build, test, and submit a PR.

### Improving Documentation

Documentation PRs are always welcome — no issue needed for small fixes like typos or clarifications.

---

## ✅ Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Describe **what** you changed and **why** in the PR description.
- Link any related issues using `Closes #issue_number`.
- Make sure your code runs without errors before submitting.
- Be responsive to review feedback — maintainers may request changes.

## 📝 Pull Request Title Format

PR titles must follow the same format as commit messages since we use **squash merging** — the PR title becomes the commit on `main`.

📄 **Full specification:** [commit_format.md](https://github.com/vividorg/agent/blob/main/commit_format.md)

**Quick examples:**
```
feat: add summarize tool
fix: resolve workspace crash on startup
docs: update getting started guide
```

> Your PR title is what lands on `main` — make it clean and descriptive.

---

## 💬 Commit Message Format

We follow a structured commit format to keep the history clean and readable.

📄 **Full specification:** [commit_format.md](https://github.com/vividorg/agent/blob/main/commit_format.md)

**Quick example:**
```
feat: add summarize tool
fix: resolve summarize tool bug
```

> Before committing, please read the full format guide linked above.

---

## 🐛 Reporting Bugs

Found a bug? You can report it in two ways:

- 👉 [Open a GitHub issue](https://github.com/vividorg/agent/issues/new) — for tracked, detailed reports.
- 💬 [Post in Discord](https://discord.gg/your-invite) — for quick reports or if you're unsure if it's actually a bug.

When reporting, please include:

- A clear description of the issue.
- Steps to reproduce it.
- Expected vs actual behaviour.
- Your Node.js version and OS.
- Any relevant error logs or screenshots.

---

## 💡 Suggesting Features

Have an idea? We'd love to hear it!

- 💬 [Share it on Discord](https://discord.gg/your-invite) — great for early-stage ideas and discussion.
- 👉 [Open a GitHub issue](https://github.com/vividorg/agent/issues/new) with the `enhancement` label — for more fleshed-out proposals.

Describe the problem it solves and how you'd expect it to work.

---

## 🤝 Community

Join the community — whether you want to contribute, get help, share ideas, or just hang out:

| Platform | Use it for |
|----------|------------|
| 💬 [Discord](https://discord.gg/your-invite) | Ideas, bug reports, support, general chat |
| 🐛 [GitHub Issues](https://github.com/vividorg/agent/issues) | Tracked bugs and feature requests |

We're glad to have you here — happy contributing! 🚀
