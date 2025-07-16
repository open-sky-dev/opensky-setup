import { SetupModule } from '../types.js';
import { updateSvelteConfig } from '../utils/svelte-config.js';
import { createDirectories, moveHookFiles, createDefaultHooks } from '../utils/directories.js';
import pc from 'picocolors';

export const sveltekitModule: SetupModule = {
  name: 'sveltekit',
  description: 'Configure SvelteKit project structure and aliases',
  
  async install() {
    console.log(pc.blue('Setting up SvelteKit project structure...'));
    
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
        console.log(pc.green(`✓ SvelteKit setup complete (${totalChanges} changes)`));
        
        if (createdDirs.length > 0) {
          console.log(pc.gray(`  → Created ${createdDirs.length} directories`));
        }
        if (movedFiles.length > 0) {
          console.log(pc.gray(`  → Moved ${movedFiles.length} hook files`));
        }
        if (createdHooks.length > 0) {
          console.log(pc.gray(`  → Created ${createdHooks.length} default hook files`));
        }
        console.log(pc.gray('  → Added $ui and $utils aliases'));
        console.log(pc.gray('  → Configured hooks file paths'));
      } else {
        console.log(pc.gray('→ SvelteKit project already configured'));
      }
      
    } catch (error) {
      console.error(pc.red('✗ SvelteKit setup failed:'));
      console.error(pc.red(`  ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }
};