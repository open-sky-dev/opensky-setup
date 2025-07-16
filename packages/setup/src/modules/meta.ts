import { pathExists } from 'fs-extra';
import { log } from '../utils/logger.js';
import { copyTemplateFile } from '../utils/templates.js';
import { installDependencies } from '../utils/dependencies.js';
import type { SetupModule } from '../types.js';

async function installSvelteKitMeta(): Promise<void> {
  log.detail('Installing sveltekit-meta package...');
  await installDependencies(['sveltekit-meta']);
  log.success('sveltekit-meta installed');
}

async function createLayoutFile(): Promise<void> {
  const layoutPath = 'src/routes/+layout.ts';
  
  // Always overwrite the layout file to ensure meta setup
  await copyTemplateFile('meta/+layout.ts', layoutPath, true);
  log.detail('Created root layout load function');
}

async function createPageFile(): Promise<void> {
  const pagePath = 'src/routes/+page.ts';
  
  // Only create if it doesn't exist to avoid overwriting existing page logic
  if (!(await pathExists(pagePath))) {
    await copyTemplateFile('meta/+page.ts', pagePath);
    log.detail('Created home page load function');
  } else {
    log.detail('Home page load function already exists');
  }
}

export const metaModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up Meta/SEO with sveltekit-meta');
    
    // Install sveltekit-meta package
    await installSvelteKitMeta();
    
    // Create layout load function
    await createLayoutFile();
    
    // Create page load function
    await createPageFile();
    
    log.success('Meta/SEO setup complete');
  }
};