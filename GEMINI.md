# Gemini Context: fratellino-page

This document provides essential context for the Gemini AI assistant.

## Project Overview

- **Project:** An npm library that wraps fetch api to add typings, quality of life improvements, error handling and interceptors.
- **Objective:** To create a simple but powerful tool for web devs

## Core Technologies

- **Framework:** Vite
- **Language:** TypeScript

## Patterns & Conventions

- SOLID principles must be enforced.
- Simplicity (KISS) is always priority.
- Unit testing should be deterministic and simple, avoid unnecesary mocking and complexity.
  - Tests lives inside `__tests__` folder.
- Utilities and non core code should live on `utils/`
- Core logic lives on `services/`

## Development Workflow

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library
pnpm build

# Lint code
pnpm lint:check

# Format code
pnpm format:check
```

## Commit Guidelines

**Instruction:** All commit messages must be written in English.

**Instruction:** All commits created for this project **must** follow the Conventional Commits specification.

The commit message format is:
`<type>[optional scope]: <description>`

- **`<type>`**: Must be one of the following:
  - `feat`: A new feature for the user.
  - `fix`: A bug fix for the user.
  - `chore`: Maintenance, build process, or tooling changes.
  - `docs`: Documentation changes only.
  - `style`: Code style changes (formatting, etc.).
  - `refactor`: A code change that neither fixes a bug nor adds a feature.
  - `test`: Adding missing tests or correcting existing tests.
- **`[optional scope]`**: A noun describing a section of the codebase (e.g., `auth`, `menu`, `header`).
- **`<description>`**: A short, imperative-tense description of the change.

**Strategy:**

- **Branching:** This project uses Trunk-Based Development. All commits should be made directly to the `main` branch.
- **Commit Grouping:** Commits should be atomic and grouped by domain or feature. When multiple changes are pending, create separate commits for each logical unit of work (e.g., one commit for component refactoring, another for a new feature, another for documentation).

## Release Strategy

This project uses Trunk-Based Development, with all commits going directly to the `main` branch. The release process is automated and triggered by a specific commit message.

### How to Trigger a Release
To create a new release, add the keyword `[release]` to the body of the commit message that finalizes the work for the new version.

**Example:**
```bash
git commit -m "feat: add amazing new feature

This commit finalizes the feature and is ready for release.

[release]"
```
Pushing this commit to `main` will automatically trigger the release workflow, which will publish the new version to NPM and create a GitHub Release.

### Forgetting to Add `[release]`
If you forget to add the keyword to a commit that has already been pushed to `main`, do not amend and force-push. Instead, create a new, empty commit to trigger the release:

```bash
git commit --allow-empty -m "chore: Trigger release [release]"
git push origin main
```
