# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-18

### Changed
- **Breaking Change**: Separated Drizzle database configurations into `drizzle.config.ts` (development) and `drizzle-prod.config.ts` (production) files for clearer separation of environments
- Default database commands now use development configuration - production commands require explicit `prod:` prefix
- Refactored `server/db/index.ts` for improved clarity and simplicity
- Updated all environment variable references from `DATABASE_URL` to `DB_URL` for consistency

### Added
- Comprehensive Drizzle package scripts:
  - Development (default): `db:gen`, `db:migrate`, `db:push`, `db:studio`, `db:reset`
  - Production (explicit): `prod:db:gen`, `prod:db:migrate`, `prod:db:studio`
- Production config file `drizzle-prod.config.ts` is now automatically copied during setup

### Security
- Dangerous commands (`db:push` and `db:reset`) are intentionally omitted from production scripts to prevent accidental data loss
- Production operations require explicit command prefix for additional safety

## [1.1.0] - Previous releases

See git history for previous changes.