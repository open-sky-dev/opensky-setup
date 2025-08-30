# @opensky/setup - Feature Roadmap

## 🚧 Planned Features

- [ ] upstash redis
- [ ] rate limiting
- [ ] feedback ui components

- [ ] better db setup: improve cli and improved output
- [ ] docker: docker dev container
- [ ] setup testing

- [ ] @opensky/auth auth package
- [ ] @opensky/ui - my own component package
- [ ] runed components?

#### Package Tasks

- [ ] **Unit Tests** - Test core functionality
- [ ] **Error Handling** - Better error messages and recovery
- [ ] **Configuration Validation** - Check SvelteKit project
- [ ] **Conflict Detection** - Warn about existing configs
- [ ] **Rollback Support** - Undo changes if something fails
- [ ] **Dry Run Mode** - Preview changes without applying
- [ ] **Parallel Installation** - Install multiple packages simultaneously
- [ ] when adding packages, unless it is needed to configure, just add to package.json and then we run a single bun install at end to install all packages at once

## ✅ Completed Features

- [X] drizzle config
  - postgres configuration: pg or neon
  - sqlite configuration: plain or with turso
- [X] resend email
  - options for adding templates 
- [X] @opensky/styles package instead of utils
- [X] tabler icons
- [x] fonts selection
- [x] **env files** setup for .env, .env.dev, .env.prod, .env.example
- maybe look into having a tool that
- [x] utils
- [x] error.html template
- [x] setup resend emails and react email
- lib/server/email
- [x] drizzle setup
- lib/server/db/schema for schema files (drizzle)
- setup dev/prod setup for sqlite and for postgres
- [x] **seo/meta** install @opensky/seo package and setup basic/example usage
- [x] **Prettier Configuration** - Sets `semi: false` in `.prettierrc`
- [x] **bits-ui Installation** - Installs bits-ui component library
- [x] gitignore rules
- [x] sveltekit project setup
  - src/hooks folder with hooks.ts, hooks.server.ts, and hooks.client.ts
  - lib/attachments
  - lib/components
  - svelte alias': $utils -> src/lib/utils $ui -> src/lib/components
- [x] **inter font** - use inter on site
  - use bun to install @fontsource-variable/inter
  - import on root layout
- [x] **Tailwind CSS** - configure how i like tailwind to work
- create src/lib/theme directory to hold all our tailwind stuff
- add $tailwind alias to svelte config alias': $tailwind: 'src/lib/theme/app.css'
- move app.css to src/lib/theme/
- create files in src/lib/theme/ base utils styles
- import those files into app.css
- add defaults to base, add utils to utils, add styles to styles from template files
- use inter for default font stack above all the normal stack

- [x] **CLI Framework** - Interactive prompts with clack
- [x] **Modular Architecture** - Easy to add/remove features
- [x] **JSON Editing** - Precise modifications using edit-json-file
- [x] **Dependency Management** - Automatic package installation via bun
- [x] **Build System** - TypeScript compilation and linking

---

_This roadmap is living document. Features may be added, removed, or reprioritized based on user feedback and usage patterns._
