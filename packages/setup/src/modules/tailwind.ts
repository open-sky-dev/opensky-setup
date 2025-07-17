import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import { log } from '../utils/logger.js';
import { updateSvelteConfig } from '../utils/svelte-config.js';
import { copyTemplateFiles } from '../utils/templates.js';
import type { SetupModule } from '../types.js';

async function updateRootLayoutImport(): Promise<void> {
  const layoutPath = 'src/routes/+layout.svelte';
  
  if (!(await pathExists(layoutPath))) {
    log.error('Could not find root layout file (src/routes/+layout.svelte)');
    return;
  }
  
  const content = await fs.readFile(layoutPath, 'utf-8');
  
  // Replace the app.css import with $tailwind alias
  const updatedContent = content.replace(
    /import\s+['"]\.\.\/app\.css['"];?/,
    "import '$tailwind';"
  );
  
  if (content !== updatedContent) {
    await fs.writeFile(layoutPath, updatedContent);
    log.detail('Updated root layout import to use $tailwind alias');
  } else {
    log.detail('Root layout import already uses correct path');
  }
}

async function createThemeFiles(): Promise<void> {
  const themeDir = 'src/lib/theme';
  
  // Copy template files to theme directory
  const files = ['base.css', 'utils.css', 'styles.css'];
  await copyTemplateFiles('tailwind', themeDir, files);
}

async function updateAppCss(): Promise<void> {
  const appCssPath = 'src/lib/theme/app.css';
  
  if (!(await pathExists(appCssPath))) {
    log.error('Could not find app.css file');
    return;
  }
  
  const content = await fs.readFile(appCssPath, 'utf-8');
  
  // Add import statements for the new CSS files
  const imports = [
    "@import './base.css';",
    "@import './utils.css';",
    "@import './styles.css';"
  ];
  
  let updatedContent = content;
  
  // Add imports that don't already exist
  for (const importStatement of imports) {
    if (!content.includes(importStatement)) {
      updatedContent = `${importStatement}\n${updatedContent}`;
    }
  }
  
  if (content !== updatedContent) {
    await fs.writeFile(appCssPath, updatedContent);
    log.detail('Added import statements to app.css');
  } else {
    log.detail('Import statements already exist in app.css');
  }
}

export const tailwindModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up Tailwind theme structure');
    
    // Create theme directory
    await ensureDir('src/lib/theme');
    log.detail('Created src/lib/theme directory');
    
    // Move app.css to theme directory
    const appCssExists = await pathExists('src/app.css');
    const themeAppCssExists = await pathExists('src/lib/theme/app.css');
    
    if (appCssExists && !themeAppCssExists) {
      await fs.rename('src/app.css', 'src/lib/theme/app.css');
      log.detail('Moved src/app.css to src/lib/theme/app.css');
    } else if (themeAppCssExists) {
      log.detail('app.css already exists in theme directory');
    } else {
      log.error('Could not find src/app.css to move');
    }
    
    // Add $tailwind alias to svelte.config.js
    await updateSvelteConfig({ $tailwind: 'src/lib/theme/app.css' });
    
    // Update root layout import
    await updateRootLayoutImport();
    
    // Create theme files
    await createThemeFiles();
    
    // Update app.css with imports
    await updateAppCss();
    
    log.success('Tailwind theme structure configured');
  }
};