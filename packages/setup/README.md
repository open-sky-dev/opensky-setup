# @opensky/setup

A post-scaffold configuration tool for SvelteKit projects. Run this after `bunx sv create` to automatically set up your project with common configurations and dependencies.

## Installation

```bash
npm install -g @opensky/setup
# or
bun add -g @opensky/setup
# or
bunx @opensky/setup
```

## Usage

After creating a new SvelteKit project:

```bash
bunx sv create my-project
cd my-project
bunx @opensky/setup
```

This will launch an interactive CLI that lets you select which features to set up:

- **Prettier**: Configure Prettier with custom settings (semi: false)
- **bits-ui**: Install the bits-ui component library

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run dev

# Test the CLI
node src/cli.ts
```

## Features

### Current Modules

- **Prettier Module**: Updates `.prettierrc` with `semi: false`
- **bits-ui Module**: Installs `bits-ui` as a dependency

### Adding New Modules

Create a new module in `src/modules/` that implements the `SetupModule` interface:

```typescript
export const myModule: SetupModule = {
  name: 'my-feature',
  description: 'Description of what this does',
  dependencies: ['some-package'],      // optional
  devDependencies: ['dev-package'],    // optional
  
  async install() {
    // Implementation here
  }
};
```

Then add it to the available modules in `src/cli.ts`.

## Architecture

- **Modular Design**: Each feature is a separate module
- **JSON Editing**: Uses `edit-json-file` for precise modifications
- **Interactive CLI**: Built with `@clack/prompts`
- **Dependency Management**: Automatically installs packages via bun

This project was created using Bun. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.