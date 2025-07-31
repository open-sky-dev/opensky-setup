import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import path from 'path';
import { log } from '../utils/logger.js';
import { copyTemplateFile } from '../utils/templates.js';
import { editJson } from '../utils/json.js';
import { setupDrizzleEnvironment } from '../utils/env.js';
import { updateGitignore } from '../utils/gitignore.js';
import type { SetupModule } from '../types.js';

type DbType = 'sqlite-turso' | 'postgres';

async function setupSchemaDirectory(dbType: DbType): Promise<void> {
  const schemaDir = 'src/lib/server/db/schema';
  const oldSchemaPath = 'src/lib/server/db/schema.ts';
  const newSchemaPath = path.join(schemaDir, 'index.ts');
  
  // Create schema directory
  await ensureDir(schemaDir);
  log.detail('Created schema directory');
  
  // Move existing schema.ts to schema/index.ts
  if (await pathExists(oldSchemaPath)) {
    if (!(await pathExists(newSchemaPath))) {
      await fs.rename(oldSchemaPath, newSchemaPath);
      log.detail('Moved schema.ts to schema/index.ts');
    } else {
      log.detail('Schema index.ts already exists');
    }
  } else {
    // Create schema index with appropriate template if it doesn't exist
    if (!(await pathExists(newSchemaPath))) {
      const tableFunction = dbType === 'sqlite-turso' ? 'sqliteTable' : 'pgTable';
      const importStatement = dbType === 'sqlite-turso' 
        ? "import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';"
        : "import { pgTable, text, integer } from 'drizzle-orm/pg-core';";
      
      const schemaTemplate = `${importStatement}

// Database schema definitions
// Export all your schema tables from this file

// Example:
// export * from './users'
// export * from './posts'
// export * from './comments'

// Or if you have everything in this file:
// export const users = ${tableFunction}('users', { ... })
// export const posts = ${tableFunction}('posts', { ... })
`;
      await fs.writeFile(newSchemaPath, schemaTemplate);
      log.detail('Created schema/index.ts with appropriate template');
    }
  }
}

async function setupDbDirectory(): Promise<void> {
  const dbDir = 'db';
  await ensureDir(dbDir);
  
  // Always add reset script
  await copyTemplateFile('db/reset.ts', 'db/reset.ts', true);
  log.detail('Added database reset utility to db/ directory');
  
  // Add seeds directory
  const seedsDir = 'db/seeds';
  await ensureDir(seedsDir);
  await copyTemplateFile('db/seeds/index.ts', path.join(seedsDir, 'index.ts'), true);
  log.detail('Created seeds/index.ts in db/ directory');
}

// SQLite + Turso: Copy all our template files
async function setupSqliteTurso(): Promise<void> {
  const dbDir = 'src/lib/server/db';
  
  // Copy database index.ts (force overwrite)
  await copyTemplateFile('db/sqlite-turso/index.ts', path.join(dbDir, 'index.ts'), true);
  log.detail('Updated database connection for SQLite + Turso');
  
  // Copy drizzle.config.ts (dev config, force overwrite)
  await copyTemplateFile('db/sqlite-turso/drizzle.config.ts', 'drizzle.config.ts', true);
  log.detail('Updated drizzle.config.ts for SQLite + Turso');
  
  // Copy drizzle-prod.config.ts (prod config, force overwrite)
  await copyTemplateFile('db/sqlite-turso/drizzle-prod.config.ts', 'drizzle-prod.config.ts', true);
  log.detail('Updated drizzle-prod.config.ts for SQLite + Turso');
}

// PostgreSQL/Neon: Make surgical edits to existing files
async function setupPostgres(): Promise<void> {
  const dbIndexPath = 'src/lib/server/db/index.ts';
  const drizzleConfigPath = 'drizzle.config.ts';
  
  // Edit db/index.ts to update DATABASE_URL -> DB_URL and schema import
  if (await pathExists(dbIndexPath)) {
    let content = await fs.readFile(dbIndexPath, 'utf-8');
    
    // Replace DATABASE_URL with DB_URL
    content = content.replace(/DATABASE_URL/g, 'DB_URL');
    
    // Update schema import to point to schema directory
    content = content.replace(
      /import \* as schema from ['"]\.\/schema(.ts)?['"];?/g,
      "import * as schema from './schema';"
    );
    content = content.replace(
      /import \{[^}]+\} from ['"]\.\/schema(.ts)?['"];?/g,
      "import * as schema from './schema';"
    );
    
    await fs.writeFile(dbIndexPath, content);
    log.detail('Updated db/index.ts for PostgreSQL');
  }
  
  // Edit drizzle.config.ts to update DATABASE_URL -> DB_URL and set out directory
  if (await pathExists(drizzleConfigPath)) {
    let content = await fs.readFile(drizzleConfigPath, 'utf-8');
    
    // Replace DATABASE_URL with DB_URL
    content = content.replace(/DATABASE_URL/g, 'DB_URL');
    
    // Update schema path
    content = content.replace(
      /schema:\s*['"]\.\/src\/lib\/server\/db\/schema(.ts)?['"],?/g,
      "schema: './src/lib/server/db/schema',"
    );
    
    // Add or update out directory
    if (content.includes('out:')) {
      content = content.replace(/out:\s*['"][^'"]*['"],?/g, "out: './db/migrations',");
    } else {
      // Add out property to the config object - handle different export formats
      if (content.includes('export default defineConfig({')) {
        content = content.replace(
          /(export default defineConfig\(\{\s*)/,
          "$1out: './db/migrations',\n  "
        );
      } else if (content.includes('export default {')) {
        content = content.replace(
          /(export default \{\s*)/,
          "$1out: './db/migrations',\n  "
        );
      }
    }
    
    await fs.writeFile(drizzleConfigPath, content);
    log.detail('Updated drizzle.config.ts for PostgreSQL');
  }
}

async function updatePackageJsonScripts(dbType: DbType): Promise<void> {
  const baseScripts = {
    'scripts.db:gen': 'drizzle-kit generate',
    'scripts.db:reset': 'bun run db/reset.ts'
  };
  
  if (dbType === 'sqlite-turso') {
    // Add full set of scripts for SQLite + Turso
    await editJson('package.json', {
      ...baseScripts,
      'scripts.db:migrate': 'drizzle-kit migrate',
      'scripts.db:push': 'drizzle-kit push',
      'scripts.db:studio': 'drizzle-kit studio',
      'scripts.prod:db:gen': 'drizzle-kit generate --config=drizzle-prod.config.ts',
      'scripts.prod:db:migrate': 'drizzle-kit migrate --config=drizzle-prod.config.ts',
      'scripts.prod:db:studio': 'drizzle-kit studio --config=drizzle-prod.config.ts'
    });
  } else {
    // Add basic scripts for PostgreSQL/Neon
    await editJson('package.json', baseScripts);
  }
  
  log.detail('Added database scripts to package.json');
}

async function setupEnvironmentFiles(dbType: DbType): Promise<void> {
  // Convert our dbType to the format expected by env utils
  const envDbType = dbType === 'sqlite-turso' ? 'drizzle' : 'neon';
  
  await setupDrizzleEnvironment(envDbType);
  log.detail('Updated environment files with database configuration');
}

export const drizzleModule: SetupModule = {
  async install(dbType?: DbType) {
    log.moduleTitle('Setting up Drizzle database structure');
    
    if (!dbType) {
      log.error('Database type not specified');
      return;
    }
    
    log.detail(`Setting up database for: ${dbType}`);
    
    // Create base database directories
    await ensureDir('src/lib/server/db');
    
    // Universal setup (always done)
    await setupSchemaDirectory(dbType);
    await setupDbDirectory();
    await updatePackageJsonScripts(dbType);
    await setupEnvironmentFiles(dbType);
    
    // Database-specific setup
    if (dbType === 'sqlite-turso') {
      await setupSqliteTurso();
      
      // Update .gitignore to exclude SQLite database files
      await updateGitignore([
        {
          pattern: 'db/dev.db*',
          comment: 'SQLite database files'
        }
      ]);
      log.detail('Added SQLite database files to .gitignore');
    } else {
      await setupPostgres();
    }
    
    log.success('Drizzle database structure configured');
  }
};