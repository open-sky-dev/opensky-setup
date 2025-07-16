import { promises as fs } from 'fs';
import { ensureDir } from 'fs-extra';
import path from 'path';
import { log } from '../utils/logger.js';
import { copyTemplateFiles } from '../utils/templates.js';
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
  
  await ensureDir(utilsDir);
  log.detail('Ensured utils directory exists');
  
  // Copy known utility files
  const utilityFiles = ['index.ts', 'cn.ts', 'types.ts'];
  await copyTemplateFiles('utils', utilsDir, utilityFiles);
  log.detail('Copied utility files');
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