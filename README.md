# @opensky/setup

Post-scaffold configuration tool for SvelteKit projects. Automates common setup tasks after running `bunx sv create`.

## Usage

```bash
# After running sv create to start a project
bunx @opensky/setup
```

Interactive CLI lets you select which features to configure:

- **SvelteKit** - Project structure, hooks, error page
- **Prettier** - Code formatting configuration  
- **Bits UI** - Component library installation
- **Gitignore** - Essential ignore rules
- **Tailwind** - Theme structure and CSS organization
- **Drizzle** - Database setup with schema organization
- **Meta** - SEO setup with sveltekit-meta
- **Resend** - Email service with React Email
- **Utils** - Utility functions (clsx, tailwind-merge)
- **Environment** - PUBLIC_* variables setup

## Features

- **Non-destructive** - Preserves existing files and configurations
- **Template-based** - Uses actual files instead of code generation
- **Modular** - Select only the features you need
- **TypeScript-first** - All generated code is TypeScript
- **Production-ready** - Follows SvelteKit best practices

## What it does

- Creates project directories and moves files to proper locations
- Installs required dependencies automatically
- Configures svelte.config.js with aliases and settings
- Sets up environment files with proper variables
- Copies utility functions and templates
- Runs Prettier formatting when complete

## Requirements

- SvelteKit project (created with `bunx sv create`)
- Bun or npm/yarn/pnpm
- Git repository (recommended)

## Examples

```bash
# Select all features
bunx @opensky/setup
# Press 'a' to select all

# Select specific features
bunx @opensky/setup
# Use arrow keys and space to select
```

The tool preserves existing configurations and only adds what's missing, making it safe to run multiple times.
