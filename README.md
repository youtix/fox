# Fox

[![Build Status](https://img.shields.io/github/actions/workflow/status/youtix/fox/ci.yml?branch=main)](https://github.com/youtix/fox/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen.svg)](https://github.com/youtix/fox/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Bud Fox](https://github.com/user-attachments/assets/bf70231b-81ad-4c0f-a272-51a63928c1c3)

_The most valuable commodity I know of is information._

-Bud Fox

Fox is a CLI utility that generates YAML configs and spins up parallel workers to back-test Gekko trading strategies. It is written in TypeScript and runs on [Bun](https://bun.sh/).

## Why use this project?

- Quickly generate multiple strategy configurations from a single YAML template
- Run workers in parallel to test many scenarios at once
- Minimal setup thanks to Bun and TypeScript
- Helpful logging for debugging and performance insights

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Gekko Worker](#gekko-worker)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# clone the repository
git clone https://github.com/youtix/fox.git
cd fox

# install dependencies
bun install
```

## Usage

Run the CLI with your desired strategy parameters:

```bash
bun run dev -- --strategy.name DEMA --strategy.period 12,24 --strategy.thresholds.up 25,30
```

This will generate the various configuration files and back-test them in parallel workers.
The `--max-workers` option controls how many workers can run at the same time.
New workers start automatically as soon as a slot is free.

## Gekko Worker

The `src/workers/gekkoWorker.ts` script runs inside a Bun worker. It writes a
temporary configuration file, launches the Gekko executable and reports basic
resource usage once the back test completes. The worker always cleans up the
generated file and terminates when done.

## Available Scripts

- `bun run build` - compile a standalone executable to `dist/fox`
- `bun run dev` - run the CLI in development mode
- `bun run format` - format project files with Prettier
- `bun run format:check` - verify formatting without changing files
- `bun run lint` - lint code and automatically fix issues
- `bun run lint:check` - lint code without fixing
- `bun run test` - run the test suite
- `bun run test:watch` - watch tests for changes
- `bun run test:coverage` - generate a coverage report
- `bun run type:check` - run TypeScript type checking
- `bun run commit:check` - validate commit messages follow Conventional Commits
- `bun run release` - publish a new release using semantic-release

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, commit guidelines, and PR instructions.

## License

This project is licensed under the [MIT](LICENSE) license.
