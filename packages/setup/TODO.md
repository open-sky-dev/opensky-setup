# @opensky/setup - Feature Roadmap

## ✅ Completed Features

### Core Infrastructure
- [x] **CLI Framework** - Interactive prompts with clack
- [x] **Modular Architecture** - Easy to add/remove features
- [x] **JSON Editing** - Precise modifications using edit-json-file
- [x] **Dependency Management** - Automatic package installation via bun
- [x] **Build System** - TypeScript compilation and linking

### Current Modules
- [x] **Prettier Configuration** - Sets `semi: false` in `.prettierrc`
- [x] **bits-ui Installation** - Installs bits-ui component library
- [X] gitignore rules
- [X] sveltekit project setup
  - src/hooks folder with hooks.ts, hooks.server.ts, and hooks.client.ts
  - lib/attachments
  - lib/components
  - svelte alias': $utils -> src/lib/utils $ui -> src/lib/components
- [X] **inter font** - use inter on site
  - use bun to install @fontsource-variable/inter
  - import on root layout

## 🚧 Planned Features

- [ ] when adding packages, unless it is needed to configure, just add to package.json and then we run a bun install at end to install all packages at once

- [ ] drizzle setup
  - lib/server/db/schema for schema files (drizzle)
  - setup dev/prod setup for sqlite and for postgres

- [ ] setup resend emails and react email
  - lib/server/email
  
### Auth
- [ ] **@opensky/auth** - my own auth package
  - not sure what this will look like yet

### UI
- [ ] **Tailwind CSS** - configure how i like tailwind to work
  - create src/lib/theme directory to hold all our tailwind stuff
  - add $tailwind alias to svelte config alias': $tailwind: 'src/lib/theme/app.css'
  - move app.css to src/lib/theme/
  - create files in src/lib/theme/ base utils styles
  - import those files into app.css
  - add defaults to base, add utils to utils, add styles to styles from template files
  - use inter for default font stack above all the normal stack

- [ ] **other fonts** - give a list of good fontsource fonts
  - would be best if this were a separate screen in CLI to select from list.
  
- [ ] **@opensky/ui** - my own component package
  - in development so waiting here also, but should eventually just be a bun install

### Database
- [ ] **Turso (LibSQL)**
  - setup a local dev db
  - add reset script to /db
  - setup directories for db (migrations out dir, seed script dir)
- [ ] **Neon (PostgreSQL)** 
  - not sure what kind of setup it required
- [ ] **upstash redis**: not sure what this would look like
- [ ] **upstash queue**: not sure what this would look like

### Utilities
- [ ] **seo/meta** install sveltekit-meta package and setup basic/example usage
- [ ] **env files** setup for .env, .env.dev, .env.prod, .env.example
  - maybe look into having a tool that 
- [ ] **Common Utility Functions** - Frequently used helpers

### Deployment & DevOps
- [ ] **Vercel Configuration** - Deploy settings
  - vercel.json template
  - Environment variable setup
- [ ] **Docker Setup** - Containerization
  - Dockerfile template
  - docker-compose for development

## 🔧 Technical Improvements

### Code Quality
- [ ] **TypeScript Strict Mode** - Enhanced type safety
- [ ] **Unit Tests** - Test core functionality
- [ ] **Integration Tests** - Test full workflows
- [ ] **Error Handling** - Better error messages and recovery

### User Experience
- [ ] **Configuration Validation** - Check SvelteKit project
- [ ] **Conflict Detection** - Warn about existing configs
- [ ] **Rollback Support** - Undo changes if something fails
- [ ] **Progress Indicators** - Better feedback during installation
- [ ] **Dry Run Mode** - Preview changes without applying

### Performance
- [ ] **Parallel Installation** - Install multiple packages simultaneously
- [ ] **Caching** - Cache downloaded templates/configs
- [ ] **Selective Updates** - Only modify what's needed

## 📝 Documentation
- [ ] **Module Documentation** - Detailed docs for each module
- [ ] **Video Tutorials** - Setup walkthroughs
- [ ] **Blog Posts** - Feature announcements
- [ ] **Contributing Guide** - How to add new modules

---

*This roadmap is living document. Features may be added, removed, or reprioritized based on user feedback and usage patterns.*
