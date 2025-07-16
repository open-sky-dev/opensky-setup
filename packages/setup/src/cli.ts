#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { prettierModule } from './modules/prettier.js';
import { bitsUiModule } from './modules/bits-ui.js';
import { gitignoreModule } from './modules/gitignore.js';
import { sveltekitModule } from './modules/sveltekit.js';
import { interFontModule } from './modules/inter-font.js';
import { runPrettierFormat } from './utils/prettier.js';
import type { SetupModule } from './types.js';

const availableModules: Record<string, SetupModule> = {
  prettier: prettierModule,
  bitsUi: bitsUiModule,
  gitignore: gitignoreModule,
  sveltekit: sveltekitModule,
  interFont: interFontModule
};

async function main() {
  console.clear();
  
  p.intro(pc.bgBlue(pc.white(' @opensky/setup ')));
  
  // Git commit suggestion
  p.note(
    pc.gray('💡 ') + pc.white('Recommendation: ') + pc.gray('Commit all changes before running setup for a clean before/after comparison'),
    'Git Status'
  );
  
  // Apply all vs select picker
  const setupMode = await p.select({
    message: 'How would you like to proceed?',
    options: [
      {
        value: 'all',
        label: 'Apply all modules',
        hint: 'Install and configure all available features'
      },
      {
        value: 'select',
        label: 'Select specific modules',
        hint: 'Choose which features to install'
      }
    ]
  });

  if (p.isCancel(setupMode)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let selectedModules: string[];

  if (setupMode === 'all') {
    selectedModules = Object.keys(availableModules);
  } else {
    const modules = await p.multiselect({
      message: 'Select features to set up:',
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
        {
          value: 'interFont',
          label: 'Inter font',
          hint: 'Install Inter variable font and import in root layout'
        }
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

    selectedModules = modules;
  }

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
    
    // Run prettier to clean up formatting
    await runPrettierFormat();
    
    p.outro(pc.green('Setup complete! 🎉'));
  } catch (error) {
    spinner.stop('Setup failed');
    p.outro(pc.red(`Error: ${error}`));
    process.exit(1);
  }
}

main().catch(console.error);
