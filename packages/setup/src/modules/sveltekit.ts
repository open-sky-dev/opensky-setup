import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import path from 'path';
import { SetupModule } from '../types.js';
import { updateSvelteConfig } from '../utils/svelte-config.js';
import { createDirectories } from '../utils/directories.js';
import { copyTemplateFile } from '../utils/templates.js';
import { log, logGroup } from '../utils/logger.js';

async function setupHooksFromTemplates(): Promise<string[]> {
  const hooksDir = 'src/hooks';
  const actions: string[] = [];
  
  await ensureDir(hooksDir);
  
  // Check for existing hook files in src/
  const srcFiles = await fs.readdir('src', { withFileTypes: true });
  const existingHookFiles = srcFiles
    .filter(file => file.isFile() && file.name.match(/^hooks?\.(ts|js)$/))
    .map(file => file.name);
  
  // Move existing hook files to hooks directory
  for (const fileName of existingHookFiles) {
    const srcPath = path.join('src', fileName);
    const destPath = path.join(hooksDir, fileName);
    
    if (!(await pathExists(destPath))) {
      await fs.rename(srcPath, destPath);
      actions.push(`Moved: ${srcPath} → ${destPath}`);
      log.success(`Moved: ${srcPath} → ${destPath}`);
    }
  }
  
  // Create hook files from templates if they don't exist
  const hookFiles = ['hooks.server.ts', 'hooks.client.ts', 'hooks.ts'];
  
  for (const hookFile of hookFiles) {
    const filePath = path.join(hooksDir, hookFile);
    
    if (!(await pathExists(filePath))) {
      await copyTemplateFile(`sveltekit/hooks/${hookFile}`, filePath);
      actions.push(`Created: ${filePath}`);
      log.success(`Created: ${filePath}`);
    }
  }
  
  return actions;
}

async function createErrorPage(): Promise<boolean> {
  const errorPagePath = 'src/error.html';
  
  await copyTemplateFile('sveltekit/error.html', errorPagePath, true);
  log.success(`Created: ${errorPagePath}`);
  
  return true;
}

export const sveltekitModule: SetupModule = {
  name: 'sveltekit',
  description: 'Configure SvelteKit project structure and aliases',
  
  async install() {
    log.moduleTitle('Setting up SvelteKit project structure...');
    
    try {
      // Create required directories
      const requiredDirs = [
        'src/hooks',
        'src/lib/attachments',
        'src/lib/components',
        'src/lib/utils'
      ];
      
      const createdDirs = await createDirectories(requiredDirs, ['hooks']);
      
      // Setup hooks from templates (move existing or create from templates)
      const hookActions = await setupHooksFromTemplates();
      
      // Create error page
      const errorPageCreated = await createErrorPage();
      
      // Update svelte.config.js with aliases, hooks configuration, and error template
      await updateSvelteConfig(
        {
          '$ui': 'src/lib/components',
          '$utils': 'src/lib/utils'
        },
        {
          server: 'src/hooks/hooks.server',
          client: 'src/hooks/hooks.client', 
          universal: 'src/hooks/hooks'
        }
      );
      
      // Update svelte.config.js to set error template path
      await updateSvelteConfig(
        {},
        {},
        'src/error.html'
      );
      
      // Summary output
      const totalChanges = createdDirs.length + hookActions.length + (errorPageCreated ? 1 : 0);
      
      if (totalChanges > 0) {
        const summaryItems = [];
        if (createdDirs.length > 0) {
          summaryItems.push(`Created ${createdDirs.length} directories`);
        }
        if (hookActions.length > 0) {
          summaryItems.push(`${hookActions.length} hook file actions`);
        }
        if (errorPageCreated) {
          summaryItems.push('Created error.html template');
        }
        summaryItems.push('Added $ui and $utils aliases');
        summaryItems.push('Configured hooks file paths');
        summaryItems.push('Set error template path');
        
        logGroup.summary(`SvelteKit setup complete (${totalChanges} changes)`, summaryItems);
      } else {
        log.info('SvelteKit project already configured');
      }
      
    } catch (error) {
      log.error('SvelteKit setup failed:');
      log.detail(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};