# OpenSky Setup Package

## Overview
This is a post-scaffold configuration tool for SvelteKit projects that automates common setup tasks after running `bunx sv create`.

## Architecture
- **Entry point**: `src/index.ts` - CLI entry point
- **Modules**: `src/modules/` - Each feature is a separate module
- **Templates**: `templates/` - File templates for each module
- **Utils**: `src/utils/` - Shared utility functions

## Key Modules
- `sveltekit.ts` - Project structure, hooks, error page setup
- `drizzle.ts` - Database setup (SQLite/Neon) with schema organization
- `tailwind.ts` - Theme structure and CSS organization
- `resend.ts` - Email service with React Email templates
- `gitignore.ts` - Manages .gitignore entries
- `env.ts` - Environment variable management
- `prettier.ts` - Code formatting configuration
- `bits-ui.ts` - Component library installation
- `seo.ts` - Meta tags and SEO setup
- `utils.ts` - Common utility functions

## Important Patterns
1. **Non-destructive updates**: Always check if files exist before overwriting
2. **Template-based**: Uses `copyTemplateFile()` to copy from templates/
3. **Modular design**: Each module has an `install()` method
4. **Git-aware**: Respects existing git configuration
5. **Database detection**: Auto-detects SQLite vs Neon setup

## Recent Changes
- Added `db/dev.db*` to gitignore for SQLite databases in drizzle module

## Testing Commands
```bash
# Run the CLI locally
bun run src/index.ts

# Build the package
bun run build

# Link for local testing
bun link
```

## Common Tasks
- Adding a new module: Create in `src/modules/`, add templates in `templates/`
- Updating gitignore rules: Use `updateGitignore()` from `src/utils/gitignore.ts`
- Adding env variables: Use `updateEnvFile()` or `createEnvFile()` from `src/utils/env.ts`
- JSON edits: Use `editJson()` for package.json modifications

## Dependencies
- Bun/Node runtime
- SvelteKit project as target
- Uses @clack/prompts for interactive CLI