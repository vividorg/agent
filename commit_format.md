# Commit Message Formatting Rules

This document defines the standard for writing consistent and informative commit messages in this project. Following these rules makes it easier to understand the project history, automate changelog generation, and collaborate effectively.

## General Principles

- Write messages in **English**.
- Use the **imperative mood** (“Add feature” not “Added feature” or “Adds feature”).
- Keep the subject line **short** (50 characters or less).
- Do **not** end the subject line with a period.
- Separate subject from body with a **blank line**.
- Wrap the body at **72 characters**.
- Use the body to explain **what** and **why** (not how).

## Commit Message Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 1. Type

Must be one of the following:

- **feat**: A new feature for the user.
- **fix**: A bug fix.
- **docs**: Documentation only changes.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **test**: Adding missing or correcting existing tests.
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation.
- **revert**: Reverts a previous commit (use with the commit hash in the subject or body).

### 2. Scope (optional)

A scope may be provided to specify the place of the commit change (e.g., component, file, module). It is enclosed in parentheses:

```
feat(parser): add ability to parse arrays
```

### 3. Description

A short, imperative tense description of the change. Start with a lowercase verb and do not use a period at the end.

- ✅ `feat: add user login endpoint`
- ❌ `feat: Added user login endpoint.`

### 4. Body (optional)

Use the body to provide additional context. Explain the motivation for the change and contrast it with previous behavior. Wrap lines at 72 characters.

- Separate paragraphs with blank lines.
- Use bullet points for lists (use `-` or `*`).

### 5. Footer (optional)

The footer is used for two main purposes:

- **Breaking Changes** – Start with `BREAKING CHANGE:` followed by a space or newline. You can also append a `!` after the type/scope to indicate a breaking change.
- **Issue References** – Reference issues or pull requests (e.g., `Closes #123`, `Fixes #456`).

**Example footer:**
```
BREAKING CHANGE: The `userId` parameter is now required.

Closes #89
```

## Detailed Rules

### Subject Line
- Max length: **50 characters**.
- Imperative mood: “Fix bug” not “Fixed bug”.
- No trailing period.
- Capitalize the first letter of the description? Conventional Commits usually recommends **lowercase** for consistency. We’ll use **lowercase** after the type/scope.

### Body
- Use to explain the **why** of the change, not the **how** (the code shows the how).
- Wrap at **72 characters**.
- Can be multiple paragraphs.

### Breaking Changes
- Indicated by adding a `!` after the type/scope, e.g., `feat!`: `feat!: remove deprecated endpoint`.
- Or by including `BREAKING CHANGE:` in the footer.
- The description should explain what breaks and what users need to do.

### Revert Commits
If the commit reverts a previous commit, begin with `revert:` followed by the subject of the reverted commit. In the body, say `This reverts commit <hash>.`.

## Examples

### Good Examples

```
feat(api): add support for rate limiting

Implement token bucket algorithm to limit requests per IP.
The limit is configurable via environment variables.

Closes #42
```

```
fix: handle null pointer in user authentication

Check for null user object before accessing its properties.
This prevented a crash when the database returned no user.

Fixes #123
```

```
docs(readme): update installation instructions

- Add step for setting up environment variables
- Clarify required Node.js version
```

```
refactor: extract email validation to shared utility

Reduces duplication and makes testing easier.
```

```
perf: cache database query results for 5 minutes

Improves response time for frequently accessed data.
```

```
feat!: change authentication token format to JWT

BREAKING CHANGE: All clients must update their token parsing logic.
Old format tokens will be rejected after March 1st.
```

### Bad Examples

```
fixed bug (this commit message is way too long and exceeds fifty characters, plus it uses past tense and ends with a period.)
```

```
Added new feature and fixed some other stuff and updated docs.
```

```
WIP
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
