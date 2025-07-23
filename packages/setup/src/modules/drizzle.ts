import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import path from 'path';
import { log } from '../utils/logger.js';
import { copyTemplateFile } from '../utils/templates.js';
import { editJson } from '../utils/json.js';
import { updateEnvFile, createEnvFile, getDevEnvVariables, getProdEnvVariables, getPublicEnvVariables } from '../utils/env.js';
import { updateGitignore } from '../utils/gitignore.js';
import type { SetupModule } from '../types.js';

async function detectDrizzleType(): Promise<'drizzle' | 'neon' | null> {
  // Check package.json for dependencies
  if (await pathExists('package.json')) {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for Neon dependencies
    if (deps['@neondatabase/serverless'] || deps['drizzle-orm/neon-http']) {
      return 'neon';
    }
    
    // Check for SQLite dependencies
    if (deps['better-sqlite3'] || deps['drizzle-orm/better-sqlite3']) {
      return 'drizzle';
    }
    
    // Check for general drizzle-orm (default to drizzle/sqlite)
    if (deps['drizzle-orm']) {
      return 'drizzle';
    }
  }
  
  // Check existing drizzle.config.ts
  if (await pathExists('drizzle.config.ts')) {
    const configContent = await fs.readFile('drizzle.config.ts', 'utf-8');
    if (configContent.includes('postgresql') || configContent.includes('neon')) {
      return 'neon';
    }
    if (configContent.includes('sqlite')) {
      return 'drizzle';
    }
  }
  
  return null;
}

async function setupSchemaDirectory(): Promise<void> {
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
    // Create schema index with barrel export template if it doesn't exist
    if (!(await pathExists(newSchemaPath))) {
      const schemaTemplate = `// Database schema definitions
// Export all your schema tables from this file

// Example:
// export * from './users'
// export * from './posts'
// export * from './comments'

// Or if you have everything in this file:
// export const users = sqliteTable('users', { ... })
// export const posts = sqliteTable('posts', { ... })
`;
      await fs.writeFile(newSchemaPath, schemaTemplate);
      log.detail('Created schema/index.ts with barrel export template');
    }
  }
}

async function setupSeedsDirectory(): Promise<void> {
  const seedsDir = 'db/seeds';
  const seedsIndexPath = path.join(seedsDir, 'index.ts');
  
  await ensureDir(seedsDir);
  
  await copyTemplateFile('db/seeds/index.ts', seedsIndexPath, true);
  log.detail('Created seeds/index.ts in root db/ directory');
}

async function setupDatabaseFiles(dbType: 'drizzle' | 'neon'): Promise<void> {
  const dbDir = 'src/lib/server/db';
  
  // Copy database index.ts (force overwrite)
  await copyTemplateFile(`db/${dbType}/index.ts`, path.join(dbDir, 'index.ts'), true);
  log.detail(`Updated database connection for ${dbType}`);
  
  // Copy drizzle.config.ts (dev config, force overwrite)
  await copyTemplateFile(`db/${dbType}/drizzle.config.ts`, 'drizzle.config.ts', true);
  log.detail(`Updated drizzle.config.ts (dev) for ${dbType}`);
  
  // Copy drizzle-prod.config.ts (prod config, force overwrite)
  await copyTemplateFile(`db/${dbType}/drizzle-prod.config.ts`, 'drizzle-prod.config.ts', true);
  log.detail(`Updated drizzle-prod.config.ts (prod) for ${dbType}`);
  
  // Copy reset.ts to root db/ directory (only for drizzle)
  if (dbType === 'drizzle') {
    await copyTemplateFile('db/drizzle/reset.ts', 'db/reset.ts', true);
    log.detail('Added database reset utility to root db/ directory');
  }
}

async function updatePackageJsonScripts(): Promise<void> {
  await editJson('package.json', {
    'scripts.db:gen': 'drizzle-kit generate',
    'scripts.db:migrate': 'drizzle-kit migrate',
    'scripts.db:push': 'drizzle-kit push',
    'scripts.db:studio': 'drizzle-kit studio',
    'scripts.db:reset': 'bun run db/reset.ts',
    'scripts.prod:db:gen': 'drizzle-kit generate --config=drizzle-prod.config.ts',
    'scripts.prod:db:migrate': 'drizzle-kit migrate --config=drizzle-prod.config.ts',
    'scripts.prod:db:studio': 'drizzle-kit studio --config=drizzle-prod.config.ts'
  });
  
  log.detail('Added database scripts to package.json');
}

async function setupEnvironmentFiles(dbType: 'drizzle' | 'neon'): Promise<void> {
  // Get PUBLIC variables to include in all env files
  const publicVariables = getPublicEnvVariables();
  
  // Update .env file with development variables (remove old DB vars and add new ones)
  const devVariables = [...publicVariables, ...getDevEnvVariables(dbType)];
  await updateEnvFile('.env', devVariables, ['DATABASE*', 'DB*', 'PUBLIC_*']);
  log.detail('Updated .env file with development database variables');
  
  // Create .env.example with development variables
  await createEnvFile('.env.example', devVariables);
  
  // Create .env.prod with production variables
  const prodVariables = [...publicVariables, ...getProdEnvVariables(dbType)];
  await createEnvFile('.env.prod', prodVariables);
}

export const drizzleModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up Drizzle database structure');
    
    // Detect the database type
    const dbType = await detectDrizzleType();
    
    if (!dbType) {
      log.error('Could not detect Drizzle database type. Make sure drizzle-orm is installed.');
      return;
    }
    
    log.detail(`Detected database type: ${dbType}`);
    
    // Create base database directories
    await ensureDir('src/lib/server/db');
    await ensureDir('db');
    
    // Setup schema directory
    await setupSchemaDirectory();
    
    // Setup seeds directory
    await setupSeedsDirectory();
    
    // Setup database files based on detected type
    await setupDatabaseFiles(dbType);
    
    // Update package.json scripts
    await updatePackageJsonScripts();
    
    // Setup environment files
    await setupEnvironmentFiles(dbType);
    
    // Update .gitignore to exclude SQLite database files
    if (dbType === 'drizzle') {
      await updateGitignore([
        {
          pattern: 'db/dev.db*',
          comment: 'SQLite database files'
        }
      ]);
      log.detail('Added SQLite database files to .gitignore');
    }
    
    log.success('Drizzle database structure configured');
  }
};