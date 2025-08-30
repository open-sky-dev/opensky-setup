#!/usr/bin/env node

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { prettierModule } from './modules/prettier.js';
import { bitsUiModule } from './modules/bits-ui.js';
import { tablerIconsModule } from './modules/tabler-icons.js';
import { styleUtilsModule } from './modules/style-utils.js';
import { gitignoreModule } from './modules/gitignore.js';
import { sveltekitModule } from './modules/sveltekit.js';
import { tailwindModule } from './modules/tailwind.js';
import { drizzleModule } from './modules/drizzle.js';
import { seoModule } from './modules/seo.js';
import { resendModule } from './modules/resend.js';
import { utilsModule } from './modules/utils.js';
import { envModule } from './modules/env.js';
import { runPrettierFormat } from './utils/prettier.js';
import { installInterFont, installFont, getFontOptions } from './utils/fonts.js';
import type { SetupModule } from './types.js';

const availableModules: Record<string, SetupModule> = {
  prettier: prettierModule,
  bitsUi: bitsUiModule,
  tablerIcons: tablerIconsModule,
  styleUtils: styleUtilsModule,
  gitignore: gitignoreModule,
  sveltekit: sveltekitModule,
  tailwind: tailwindModule,
  drizzle: drizzleModule,
  seo: seoModule,
  resend: resendModule,
  utils: utilsModule,
  env: envModule
};

async function main() {
  console.clear();
  
  p.intro(pc.bgBlue(pc.white(' @opensky/setup ')));

  console.log(pc.bold(pc.gray('Recommendation: Commit all changes before running setup for a clean before/after comparison')));
  console.log('');

  // Step 1: Core Setup
  const setupSelection = await p.multiselect({
    message: 'Step 1: Core Setup (press a for all):',
    options: [
      {
        value: 'projectSetup',
        label: 'Project Setup',
        hint: 'SvelteKit structure, .gitignore, .env, prettier'
      },
      {
        value: 'tailwind',
        label: 'Tailwind',
        hint: 'Organization, utils, and default styles'
      },
      {
        value: 'utils',
        label: 'Basic Utils',
        hint: 'Setups some basic utils'
      },
      {
        value: 'styleUtils',
        label: 'Style Utils',
        hint: 'Install @opensky/style utility package'
      },
      {
        value: 'resend',
        label: 'Resend Email',
        hint: 'Install resend, react-email and create email utilities'
      },
      {
        value: 'seo',
        label: 'SEO Metatags',
        hint: 'Install and use @opensky/seo'
      },
      {
        value: 'drizzle',
        label: 'Drizzle',
        hint: 'Configure for Turso/SQLite or Neon'
      }
    ],
    required: false
  });

  if (p.isCancel(setupSelection)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // Extract the modules to install based on selection
  const coreModules: string[] = [];
  const configModules: string[] = [];
  
  for (const selection of setupSelection) {
    if (selection === 'projectSetup') {
      configModules.push('sveltekit', 'gitignore', 'env', 'prettier');
    } else if (selection === 'tailwind') {
      configModules.push('tailwind');
    } else {
      coreModules.push(selection);
    }
  }

  // Conditional sub-step: Resend Email Templates
  let resendTemplates: string[] = [];
  if (coreModules.includes('resend')) {
    resendTemplates = await p.multiselect({
      message: 'Resend Email Templates (press a for all):',
      options: [
        {
          value: 'account',
          label: 'Account Templates',
          hint: 'Email verification, password reset, account alerts'
        },
        {
          value: 'payments',
          label: 'Payment Templates', 
          hint: 'Invoices, receipts, subscription notifications'
        }
      ],
      required: false
    });

    if (p.isCancel(resendTemplates)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // Conditional sub-step: Drizzle Database Type
  let drizzleDbType: string = '';
  if (coreModules.includes('drizzle')) {
    const dbTypeSelection = await p.select({
      message: 'Select your database setup:',
      options: [
        {
          value: 'sqlite-turso',
          label: 'SQLite + Turso',
          hint: 'Local SQLite for development, Turso for production'
        },
        {
          value: 'postgres',
          label: 'PostgreSQL/Neon',
          hint: 'PostgreSQL database (local, hosted, or Neon)'
        }
      ]
    });

    if (p.isCancel(dbTypeSelection)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    drizzleDbType = dbTypeSelection;
  }

  // Step 2: UI Components
  const uiModules = await p.multiselect({
    message: 'Step 2: UI Components (press a for all):',
    options: [
      {
        value: 'bitsUi',
        label: 'bits-ui',
        hint: 'Install Bits-ui component library'
      },
      {
        value: 'tablerIcons',
        label: 'tabler-icons',
        hint: 'Install @tabler/icons-svelte icon library'
      }
    ],
    required: false
  });

  if (p.isCancel(uiModules)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // Step 3: Fonts
  const fontSelection = await p.multiselect({
    message: 'Step 3: Fonts (press a for all):',
    options: [
      {
        value: 'inter',
        label: 'Inter Font',
        hint: 'Variable font with automatic layout integration'
      },
      {
        value: 'moreFonts',
        label: 'More fonts',
        hint: 'Choose from additional font options'
      }
    ],
    required: false
  });

  if (p.isCancel(fontSelection)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // Step 4: Additional Fonts (conditional)
  let additionalFonts: string[] = [];
  if (fontSelection.includes('moreFonts')) {
    const fontOptions = getFontOptions();
    additionalFonts = await p.multiselect({
      message: 'Step 4: Select Additional Fonts (press a for all):',
      options: fontOptions,
      required: false
    });

    if (p.isCancel(additionalFonts)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // Combine all selected modules
  const allSelectedModules = [
    ...configModules,
    ...coreModules,
    ...uiModules
  ];

  // Install selected modules
  if (allSelectedModules.length > 0) {
    const spinner = p.spinner();
    spinner.start('Setting up selected features...');

    try {
      for (const moduleKey of allSelectedModules) {
        const module = availableModules[moduleKey];
        if (module) {
          // Pass options to modules that need them
          if (moduleKey === 'resend' && resendTemplates.length > 0) {
            await module.install(resendTemplates);
          } else if (moduleKey === 'drizzle' && drizzleDbType) {
            await module.install(drizzleDbType);
          } else {
            await module.install();
          }
        }
      }
      
      spinner.stop('All features set up successfully!');
    } catch (error) {
      spinner.stop('Setup failed');
      p.outro(pc.red(`Error: ${error}`));
      process.exit(1);
    }
  }

  // Install fonts
  const allSelectedFonts = [
    ...(fontSelection.includes('inter') ? ['inter'] : []),
    ...additionalFonts
  ];

  if (allSelectedFonts.length > 0) {
    const fontSpinner = p.spinner();
    fontSpinner.start('Installing selected fonts...');

    try {
      for (const fontKey of allSelectedFonts) {
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
  if (allSelectedModules.length > 0 || allSelectedFonts.length > 0) {
    await runPrettierFormat();
    p.outro(pc.green('Setup complete! 🎉'));
  } else {
    p.outro('No features or fonts selected. Goodbye!');
  }
}

main().catch(console.error);
