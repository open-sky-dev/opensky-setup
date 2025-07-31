import { log } from '../utils/logger.js';
import { copyTemplateDirectory } from '../utils/templates.js';
import type { SetupModule } from '../types.js';

async function copyUtilityFiles(): Promise<void> {
  const utilsDir = 'src/lib/utils';
  
  await copyTemplateDirectory('utils', utilsDir);
  log.detail('Copied utility files from templates/utils');
}

export const utilsModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up utility functions');
    
    // Copy utility files from templates
    await copyUtilityFiles();
    
    log.success('Utility functions configured');
  }
};