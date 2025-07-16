#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { prettierModule } from './modules/prettier.js';
import { bitsUiModule } from './modules/bits-ui.js';
import { gitignoreModule } from './modules/gitignore.js';
import { sveltekitModule } from './modules/sveltekit.js';
import { runPrettierFormat } from './utils/prettier.js';
import { installInterFont, installFont, getFontOptions } from './utils/fonts.js';
import type { SetupModule } from './types.js';

const availableModules: Record<string, SetupModule> = {
  prettier: prettierModule,
  bitsUi: bitsUiModule,
  gitignore: gitignoreModule,
  sveltekit: sveltekitModule
};

async function main() {
  console.clear();
  
  p.intro(pc.bgBlue(pc.white(' @opensky/setup ')));

  console.log(pc.bold(pc.gray('Recommendation: Commit all changes before running setup for a clean before/after comparison')));
  console.log('');

  const modules = await p.multiselect({
    message: 'Select features to set up (press a for all):',
    options: [
      {
        value: 'sveltekit',
        label: 'sveltekit setup',
        hint: 'Directories, aliases, hooks structure'
      },
      {
        value: 'prettier',
        label: 'prettier config',
        hint: 'Configure Prettier (semi: false)'
      },
      {
        value: 'bitsUi',
        label: 'bits-ui',
        hint: 'Install bits-ui component library'
      },
      {
        value: 'gitignore',
        label: '.gitignore rules',
        hint: 'Add .env, .nova/, .vscode/ rules'
      },
    ]
  });

  if (p.isCancel(modules)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (modules.length === 0) {
    p.outro('No features selected. Goodbye!');
    process.exit(0);
  }

  const selectedModules = modules;

  // Install selected modules
  const spinner = p.spinner();
  spinner.start('Setting up selected features...');

  try {
    for (const moduleKey of selectedModules) {
      const module = availableModules[moduleKey];
      if (module) {
        await module.install();
      }
    }
    
    spinner.stop('All features set up successfully!');
  } catch (error) {
    spinner.stop('Setup failed');
    p.outro(pc.red(`Error: ${error}`));
    process.exit(1);
  }

  // Font selection step
  const fontOptions = getFontOptions();
  const fonts = await p.multiselect({
    message: 'Select fonts to install (press a for all):',
    options: [
      {
        value: 'inter',
        label: 'Inter (with layout import)',
        hint: 'Variable font with automatic layout integration'
      },
      ...fontOptions
    ]
  });

  if (p.isCancel(fonts)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // Install selected fonts
  if (fonts.length > 0) {
    const fontSpinner = p.spinner();
    fontSpinner.start('Installing selected fonts...');

    try {
      for (const fontKey of fonts) {
        if (fontKey === 'inter') {
          await installInterFont();
        } else {
          await installFont(fontKey);
        }
      }
      
      fontSpinner.stop('All fonts installed successfully!');
    } catch (error) {
      fontSpinner.stop('Font installation failed');
      p.outro(pc.red(`Error: ${error}`));
      process.exit(1);
    }
  }

  // Run prettier to clean up formatting
  await runPrettierFormat();
  
  p.outro(pc.green('Setup complete! 🎉'));
}

main().catch(console.error);
