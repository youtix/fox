# Contributing to this Project

Thank you for your interest in helping improve this project! The following guidelines will help you get set up and make contributions.

## Getting Started

### Clone the Repository

Use Git to clone the repository and initialize submodules if any:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Install Bun

This project relies on **Bun** to run scripts and manage dependencies. If you don't have Bun installed, follow the instructions in the [official documentation](https://bun.sh/docs/installation).

### Install Dependencies

After installing Bun, install the project dependencies with:

```bash
bun install
```

## Development Workflow

### Running Tests

To run the test suite, use one of the following commands:

```bash
bun run test
# or
bun x vitest
```

### Formatting, Linting and Type Checking

Before committing, ensure that formatting, linting, and type checks all pass:

```bash
bun run format
bun run lint
bun run typecheck
```

## Commit Message Guidelines

This project follows the **Conventional Commits** specification. Example commit types include:

- `feat`: A new feature
- `fix`: A bug fix
- `chore`: Routine changes or maintenance
- `BREAKING CHANGE`: Indicates an incompatible API change

Example messages:

```
feat: add user login endpoint
fix: correct typo in README
chore: update dependencies
feat!: drop support for Node 14 (BREAKING CHANGE)
```

## Creating Pull Requests

1. Create a branch named with the appropriate prefix:
   - `feat/*` for features
   - `fix/*` for bug fixes
   - `chore/*` for maintenance or chores

2. Before opening a pull request, make sure:
   - All tests pass
   - Linting and formatting checks succeed
   - Your commit messages follow Conventional Commits

3. Describe your changes clearly in the pull request body. Mention any relevant issues and provide context for reviewers.

## Release Process

Versioning and changelog generation are automated using **semantic-release**. Contributors do not need to manually bump versions or update the changelog; this happens automatically when changes are merged.

