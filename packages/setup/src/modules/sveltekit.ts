import { SetupModule } from '../types.js';
import { updateSvelteConfig } from '../utils/svelte-config.js';
import { createDirectories, moveHookFiles, createDefaultHooks } from '../utils/directories.js';
import { log, logGroup } from '../utils/logger.js';

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
      
      // Move existing hook files to src/hooks/
      const movedFiles = await moveHookFiles();
      
      // Create default hook files if they don't exist
      const createdHooks = await createDefaultHooks();
      
      // Update svelte.config.js with aliases and hooks configuration
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
      
      // Summary output
      const totalChanges = createdDirs.length + movedFiles.length + createdHooks.length;
      
      if (totalChanges > 0) {
        const summaryItems = [];
        if (createdDirs.length > 0) {
          summaryItems.push(`Created ${createdDirs.length} directories`);
        }
        if (movedFiles.length > 0) {
          summaryItems.push(`Moved ${movedFiles.length} hook files`);
        }
        if (createdHooks.length > 0) {
          summaryItems.push(`Created ${createdHooks.length} default hook files`);
        }
        summaryItems.push('Added $ui and $utils aliases');
        summaryItems.push('Configured hooks file paths');
        
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