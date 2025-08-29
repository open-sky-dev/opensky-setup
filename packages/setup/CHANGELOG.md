# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-18

### Changed
- **Breaking Change**: Separated Drizzle database configurations into `drizzle.config.ts` (development) and `drizzle-prod.config.ts` (production) files for clearer separation of environments
- Default database commands now use development configuration - production commands require explicit `prod:` prefix
- Refactored `server/db/index.ts` for improved clarity and simplicity
- Updated all environment variable references from `DATABASE_URL` to `DB_URL` for consistency
- **Breaking Change**: Removed `.env.prod` file handling - now only `.env` and `.env.example` are managed
- **Breaking Change**: Replaced PUBLIC_* environment variables with `src/lib/site-config.ts` file containing site.name, site.url, and site.host
- Reorganized environment file structure: NODE_ENV first, then Database section (DB*, DATABASE*, PG*), then Services section
- Removed production-specific drizzle scripts (`prod:db:*`) as production config is no longer maintained

### Added
- Comprehensive Drizzle package scripts:
  - Development (default): `db:gen`, `db:migrate`, `db:push`, `db:studio`, `db:reset`
  - Production (explicit): `prod:db:gen`, `prod:db:migrate`, `prod:db:studio`
- Production config file `drizzle-prod.config.ts` is now automatically copied during setup
- New `site-config.ts` template for site configuration (replaces PUBLIC_* env vars)

### Security
- Dangerous commands (`db:push` and `db:reset`) are intentionally omitted from production scripts to prevent accidental data loss
- Production operations require explicit command prefix for additional safety

## [1.1.0] - Previous releases

See git history for previous changes.