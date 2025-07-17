#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { prettierModule } from './modules/prettier.js';
import { bitsUiModule } from './modules/bits-ui.js';
import { gitignoreModule } from './modules/gitignore.js';
import { sveltekitModule } from './modules/sveltekit.js';
import { tailwindModule } from './modules/tailwind.js';
import { drizzleModule } from './modules/drizzle.js';
import { metaModule } from './modules/meta.js';
import { resendModule } from './modules/resend.js';
import { utilsModule } from './modules/utils.js';
import { envModule } from './modules/env.js';
import { runPrettierFormat } from './utils/prettier.js';
import { installInterFont, installFont, getFontOptions } from './utils/fonts.js';
import type { SetupModule } from './types.js';

const availableModules: Record<string, SetupModule> = {
  prettier: prettierModule,
  bitsUi: bitsUiModule,
  gitignore: gitignoreModule,
  sveltekit: sveltekitModule,
  tailwind: tailwindModule,
  drizzle: drizzleModule,
  meta: metaModule,
  resend: resendModule,
  utils: utilsModule,
  env: envModule
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
        label: 'SvelteKit',
        hint: 'Project structure, hooks, error page'
      },
      {
        value: 'prettier',
        label: 'Prettier',
        hint: 'Configure prettier rules'
      },
      {
        value: 'bitsUi',
        label: 'Bits-ui',
        hint: 'Install Bits-ui component library'
      },
      {
        value: 'gitignore',
        label: '.gitignore',
        hint: 'Add .gitignore rules'
      },
      {
        value: 'tailwind',
        label: 'tailwind',
        hint: 'Organization, utils, and default styles'
      },
      {
        value: 'drizzle',
        label: 'drizzle',
        hint: 'Configure for Turso/SQLite or Neon'
      },
      {
        value: 'meta',
        label: 'metatags seo',
        hint: 'Install and use sveltekit-meta'
      },
      {
        value: 'resend',
        label: 'resend email',
        hint: 'Install resend, react-email and create email utilities'
      },
      {
        value: 'utils',
        label: 'utils',
        hint: 'Setups some basic utils'
      },
      {
        value: 'env',
        label: 'env variables',
        hint: 'Adds several PUBLIC_* variables to all .env files'
      },
    ],
    required: false
  });

  if (p.isCancel(modules)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const selectedModules = modules;

  // Install selected modules
  if (selectedModules.length > 0) {
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
    ],
    required: false
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

  // Run prettier to clean up formatting if anything was installed
  if (selectedModules.length > 0 || fonts.length > 0) {
    await runPrettierFormat();
    p.outro(pc.green('Setup complete! 🎉'));
  } else {
    p.outro('No features or fonts selected. Goodbye!');
  }
}

main().catch(console.error);
