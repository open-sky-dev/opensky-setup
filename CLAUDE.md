# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based CLI tool called `@opensky/setup` that helps configure SvelteKit projects after initial scaffolding. It's a post-scaffold configuration tool that runs after `bunx sv create` to automatically set up common configurations and dependencies.

## Development Commands

### Primary Package (packages/setup/)
```bash
# Install dependencies
bun install

# Build the CLI tool
bun run build

# Run locally during development
bun run dev

# Test the CLI (after building)
node dist/cli.js
```

### Root Package
```bash
# Install dependencies
bun install

# Run the basic entry point
bun run index.ts
```

## Architecture

### Core Structure
- **Monorepo layout** with main package in `packages/setup/`
- **Modular architecture** where each feature is a separate module implementing `SetupModule` interface
- **Interactive CLI** built with `@clack/prompts` for multiselect options
- **AST-based editing** using `ts-morph` for JavaScript/TypeScript config files
- **Precise JSON editing** with `edit-json-file` for non-destructive modifications

### Key Components

#### Module System
Each feature is implemented as a `SetupModule` in `src/modules/`:
- `prettier.ts` - Configures Prettier settings
- `bits-ui.ts` - Installs bits-ui component library  
- `gitignore.ts` - Adds gitignore rules
- `sveltekit.ts` - Sets up project structure and aliases
- `inter-font.ts` - Installs and configures Inter font

#### Utility Functions
Located in `src/utils/`:
- `logger.ts` - Centralized logging with semantic functions
- `svelte-config.ts` - AST-based svelte.config.js editing
- `directories.ts` - Directory/file management
- `dependencies.ts` - Package installation via bun
- `gitignore.ts` - Gitignore manipulation utilities
- `json.ts` - JSON file editing helpers
- `files.ts` - File system operations

#### CLI Flow
1. Interactive prompts for feature selection
2. Sequential module execution
3. Automatic Prettier formatting at the end
4. Comprehensive logging with progress indicators

### Technology Stack
- **Runtime**: Bun (primary) with Node.js compatibility
- **Language**: TypeScript with strict configuration
- **CLI**: @clack/prompts for interactive interface
- **File Editing**: ts-morph for JS/TS, edit-json-file for JSON
- **Process Management**: execa for shell commands
- **File System**: fs-extra for enhanced operations

## Development Patterns

### Adding New Modules
1. Create new file in `src/modules/` implementing `SetupModule` interface
2. Add module to `availableModules` object in `src/cli.ts`
3. Add option to multiselect prompt in CLI
4. Export from `src/index.ts` if needed

### Non-Destructive Editing
- Always check file existence before creating
- Merge with existing configurations, don't replace
- Preserve comments and formatting
- Use AST manipulation for complex file edits

### Logging Standards
Use semantic logging functions from `src/utils/logger.ts`:
- `log.moduleTitle()` for module headers
- `log.success()` for completed actions
- `log.detail()` for secondary information
- `logGroup.summary()` for complex status reporting

## Key Files

### Configuration Files
- `packages/setup/package.json` - Main package configuration with build scripts
- `packages/setup/tsconfig.json` - TypeScript configuration
- `packages/setup/src/types.ts` - Core TypeScript interfaces

### Documentation
- `packages/setup/README.md` - User-facing documentation
- `packages/setup/TODO.md` - Feature roadmap and planned features
- `packages/setup/CLAUDE_CHANGELOG.md` - Detailed development history and architecture decisions

## Testing

Currently uses manual testing workflow:
1. Build with `bun run build`
2. Test locally with `bun run dev`
3. Use `bun link` for testing in separate SvelteKit projects

## Build and Distribution

- Compiles TypeScript to single bundled file in `dist/`
- Binary entry point: `dist/cli.js`
- Build target: Node.js with ESM format
- Distribution files: `dist/` and `templates/`