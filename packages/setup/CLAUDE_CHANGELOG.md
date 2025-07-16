# @opensky/setup - Development Log

This document tracks the evolution, decisions, and learnings from building the SvelteKit setup tool.

## Project Genesis

**Goal:** Create a post-scaffold configuration tool for SvelteKit projects that runs after `bunx sv create` to automatically set up common configurations and dependencies.

**Key Requirements:**
- Non-destructive (never overwrite existing work)
- Modular architecture for easy feature addition
- Interactive CLI with multi-select options
- Precise file editing without breaking existing configs

---

## Major Architecture Decisions

### 1. **Modular Design Pattern** ✅
**Decision:** Each feature as a separate module implementing `SetupModule` interface  
**Rationale:** Easy to add/remove features, clean separation of concerns, maintainable  
**Implementation:**
```typescript
interface SetupModule {
  name: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  install(): Promise<void>;
}
```

### 2. **CLI Framework: @clack/prompts** ✅
**Decision:** Use clack for interactive prompts  
**Rationale:** Beautiful, modern CLI experience with multiselect support  
**Alternative Considered:** inquirer.js (more features but heavier)

### 3. **File Editing Strategy Evolution**

#### Phase 1: Regex-based editing ❌
**Initial Approach:** String manipulation with regex for svelte.config.js  
**Problems:** Fragile, couldn't handle different export patterns, error-prone

#### Phase 2: ts-morph AST manipulation ✅
**Decision:** Switch to ts-morph for JavaScript file editing  
**Rationale:** 
- AST-based = understands JavaScript structure
- Handles various export patterns (`export default {}`, `const config = {}; export default config`)
- Non-destructive, preserves formatting and comments
- More robust than regex

### 4. **Package Management: Bun-first** ✅
**Decision:** Use bun for package installation via execa  
**Rationale:** Target audience uses bun, faster than npm/yarn

### 5. **JSON Editing: edit-json-file** ✅
**Decision:** Use edit-json-file for precise JSON modifications  
**Rationale:** Surgical edits without destroying existing structure  
**Alternative Considered:** Manual JSON.parse/stringify (loses formatting)

---

## Feature Development Timeline

### Core Infrastructure
1. **CLI Framework** - clack prompts with multiselect
2. **Build System** - TypeScript compilation with bun
3. **Module System** - Plugin-like architecture

### Initial Modules

#### Prettier Configuration ✅
**Scope:** Simple `.prettierrc` modification (semi: false)  
**Learning:** Good starting point, validated JSON editing approach

#### bits-ui Installation ✅
**Scope:** Install bits-ui package dependency  
**Learning:** Established package installation pattern

#### .gitignore Rules ✅
**Scope:** Add .env, .nova/, .vscode/ rules  
**Challenge:** Smart rule detection to avoid duplicates  
**Solution:** Pattern matching with existing rules

### Complex Features

#### SvelteKit Project Setup ✅
**Scope:** Directory structure, aliases, hooks configuration  
**Challenges:**
- Multiple file types (directories, TypeScript, JavaScript config)
- Various svelte.config.js patterns in the wild
- Git tracking for empty directories

**Key Decisions:**
- Skip `lib/theme` directory (user feedback)
- Use `$ui -> src/lib/components` instead of separate ui folder
- Create placeholder files for git tracking
- Move existing hook files to organized structure

#### Git Directory Tracking ✅
**Problem:** Empty directories not tracked by git  
**Solution:** Smart placeholder files:
- `.gitkeep` for asset directories (attachments)
- `index.ts` for code directories (utils, components)
- Skip placeholders for directories that get real files (hooks)

---

## Technical Evolution

### Logging System Progression

#### Phase 1: Ad-hoc console.log ❌
**Problem:** Inconsistent formatting, hard to maintain

#### Phase 2: Manual indentation ⚠️
**Improvement:** Added consistent 2-space and 4-space indentation  
**Problem:** Still manual, easy to get wrong

#### Phase 3: Centralized Logger ✅
**Decision:** Create semantic logging utility  
**Benefits:**
- `log.moduleTitle()`, `log.success()`, `log.detail()` etc.
- Consistent visual hierarchy
- Easy to change styling globally
- `logGroup.summary()` for complex output

```typescript
// Before
console.log(pc.green(`  ✓ Created ${count} files`));
console.log(pc.gray(`    → Added utilities`));

// After  
logGroup.summary(`Created ${count} files`, ['Added utilities']);
```

### Build and Distribution

#### Package Structure ✅
**Decision:** Compile TypeScript to single bundled file  
**Build Command:** `bun build src/cli.ts --outdir=dist --target=node`  
**Distribution:** `bin` points to compiled JavaScript  

#### Development Workflow ✅
**Local Testing:** `bun link` + test in separate directory  
**Rationale:** Simulates real-world usage, avoids modifying development directory

---

## Lessons Learned

### 1. **Start Simple, Evolve**
Started with basic modules (prettier, bits-ui) before tackling complex ones (sveltekit setup). This validated the architecture before adding complexity.

### 2. **Real-world Config Patterns**
SvelteKit projects use various config patterns:
- `export default { kit: {...} }`
- `const config = {...}; export default config`
- Needed ts-morph to handle all patterns robustly

### 3. **User Feedback is Gold**
- Removed unnecessary `lib/ui` directory based on feedback
- Added git tracking for directories based on real usage
- Improved logging based on visual clarity needs

### 4. **Non-destructive is Critical**
Users need confidence that running the tool won't break existing work:
- Always check file existence before creating
- Merge with existing configs, don't replace
- Preserve comments and formatting

### 5. **Developer Experience Matters**
- Beautiful CLI output with consistent visual hierarchy
- Clear error messages with context
- Semantic logging functions for maintainability

---

## Current State & Architecture

### File Structure
```
packages/setup/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── types.ts            # TypeScript interfaces
│   ├── modules/            # Feature modules
│   │   ├── prettier.ts     # .prettierrc configuration
│   │   ├── bits-ui.ts      # Package installation
│   │   ├── gitignore.ts    # .gitignore rules
│   │   └── sveltekit.ts    # Project structure setup
│   └── utils/
│       ├── logger.ts       # Centralized logging
│       ├── svelte-config.ts # AST-based config editing
│       ├── directories.ts  # Directory/file management
│       ├── dependencies.ts # Package installation
│       ├── gitignore.ts    # Gitignore utilities
│       ├── json.ts         # JSON file editing
│       └── files.ts        # File utilities
├── package.json            # Dependencies and build config
└── TODO.md                 # Feature roadmap
```

### Key Dependencies
- `@clack/prompts` - Interactive CLI
- `ts-morph` - AST-based JavaScript editing  
- `edit-json-file` - Precise JSON editing
- `execa` - Shell command execution
- `fs-extra` - Enhanced file operations
- `picocolors` - Terminal colors

---

## Future Considerations

### Potential Improvements
1. **Configuration Files** - Save/load user preferences
2. **Rollback Support** - Undo changes if something fails
3. **Validation** - Check if we're in a SvelteKit project
4. **Parallel Operations** - Install multiple packages simultaneously
5. **Plugin System** - Allow third-party modules

### Architectural Decisions to Revisit
1. **Bundle Size** - Currently 11MB due to ts-morph (might optimize)
2. **Error Handling** - Could be more granular
3. **Testing** - No automated tests yet (all manual)

---

## Success Metrics

✅ **User Experience:** Clean, professional CLI output  
✅ **Reliability:** Non-destructive, handles edge cases  
✅ **Maintainability:** Modular, semantic logging, clear architecture  
✅ **Extensibility:** Easy to add new features  
✅ **Performance:** Fast execution, compiled bundle  

The project successfully evolved from a simple idea to a robust, production-ready tool through iterative development and user feedback.