import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import path from 'path';
import { SetupModule } from '../types.js';
import { updateSvelteConfig } from '../utils/svelte-config.js';
import { createDirectories } from '../utils/directories.js';
import { copyTemplateFile } from '../utils/templates.js';
import { log, logGroup } from '../utils/logger.js';

async function setupHooksFromTemplates(): Promise<string[]> {
  const actions: string[] = [];
  
  // Create hooks.server.ts from template if it doesn't exist
  const hooksServerPath = 'src/hooks.server.ts';
  
  if (!(await pathExists(hooksServerPath))) {
    await copyTemplateFile('sveltekit/hooks/hooks.server.ts', hooksServerPath);
    actions.push(`Created: ${hooksServerPath}`);
    log.success(`Created: ${hooksServerPath}`);
  }
  
  return actions;
}

async function createErrorPages(): Promise<string[]> {
  const actions: string[] = [];
  
  // Copy error.html template
  const errorPagePath = 'src/error.html';
  await copyTemplateFile('sveltekit/error.html', errorPagePath, true);
  actions.push(`Created: ${errorPagePath}`);
  log.success(`Created: ${errorPagePath}`);
  
  // Copy +error.svelte to routes
  await ensureDir('src/routes');
  const errorSveltePath = 'src/routes/+error.svelte';
  await copyTemplateFile('sveltekit/+error.svelte', errorSveltePath, true);
  actions.push(`Created: ${errorSveltePath}`);
  log.success(`Created: ${errorSveltePath}`);
  
  return actions;
}

export const sveltekitModule: SetupModule = {
  name: 'sveltekit',
  description: 'Configure SvelteKit project structure and aliases',
  
  async install() {
    log.moduleTitle('Setting up SvelteKit project structure...');
    
    try {
      // Create required directories
      const requiredDirs = [
        'src/lib/attachments',
        'src/lib/components',
        'src/lib/utils'
      ];
      
      const createdDirs = await createDirectories(requiredDirs);
      
      // Setup hooks from templates (move existing or create from templates)
      const hookActions = await setupHooksFromTemplates();
      
      // Create error pages
      const errorPageActions = await createErrorPages();
      
      // Update svelte.config.js with aliases
      await updateSvelteConfig(
        {
          '$ui': 'src/lib/components',
          '$utils': 'src/lib/utils'
        }
      );
      
      // Summary output
      const totalChanges = createdDirs.length + hookActions.length + errorPageActions.length;
      
      if (totalChanges > 0) {
        const summaryItems = [];
        if (createdDirs.length > 0) {
          summaryItems.push(`Created ${createdDirs.length} directories`);
        }
        if (hookActions.length > 0) {
          summaryItems.push(`${hookActions.length} hook file actions`);
        }
        if (errorPageActions.length > 0) {
          summaryItems.push(`${errorPageActions.length} error page files created`);
        }
        summaryItems.push('Added $ui and $utils aliases');
        
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