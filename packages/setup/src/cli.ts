#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { prettierModule } from './modules/prettier.js';
import { bitsUiModule } from './modules/bits-ui.js';
import { gitignoreModule } from './modules/gitignore.js';
import { sveltekitModule } from './modules/sveltekit.js';
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
  
  const selectedModules = await p.multiselect({
    message: 'Select features to set up:',
    options: [
      {
        value: 'sveltekit',
        label: 'SvelteKit Setup',
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
      }
    ]
  });

  if (p.isCancel(selectedModules)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (selectedModules.length === 0) {
    p.outro('No features selected. Goodbye!');
    process.exit(0);
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
    p.outro(pc.green('Setup complete! 🎉'));
  } catch (error) {
    spinner.stop('Setup failed');
    p.outro(pc.red(`Error: ${error}`));
    process.exit(1);
  }
}

main().catch(console.error);
