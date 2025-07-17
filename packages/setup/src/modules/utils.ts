import { log } from '../utils/logger.js';
import { copyTemplateDirectory } from '../utils/templates.js';
import { installDependencies } from '../utils/dependencies.js';
import type { SetupModule } from '../types.js';

async function installUtilityPackages(): Promise<void> {
  log.detail('Installing utility packages...');
  
  const packages = ['clsx', 'tailwind-merge'];
  await installDependencies(packages);
  
  log.success('Utility packages installed');
}

async function copyUtilityFiles(): Promise<void> {
  const utilsDir = 'src/lib/utils';
  
  await copyTemplateDirectory('utils', utilsDir);
  log.detail('Copied utility files from templates/utils');
}

export const utilsModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up utility functions');
    
    // Install required packages
    await installUtilityPackages();
    
    // Copy utility files from templates
    await copyUtilityFiles();
    
    log.success('Utility functions configured');
  }
};