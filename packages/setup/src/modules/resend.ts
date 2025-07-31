import { ensureDir } from 'fs-extra';
import { log } from '../utils/logger.js';
import { copyTemplateFiles, copyTemplateDirectory } from '../utils/templates.js';
import { installDependencies } from '../utils/dependencies.js';
import { addResendAuthToEnvFiles } from '../utils/env.js';
import type { SetupModule } from '../types.js';

async function installResendPackages(): Promise<void> {
  log.detail('Installing resend packages...');
  
  // Production dependencies
  const prodDeps = ['resend', 'react', 'react-dom'];
  await installDependencies(prodDeps);
  
  // Development dependencies
  const devDeps = ['react-email', '@types/react'];
  await installDependencies(devDeps, true);
  
  log.success('Resend packages installed');
}

async function createEmailDirectory(): Promise<void> {
  const emailDir = 'src/lib/server/email';
  
  await ensureDir(emailDir);
  log.detail('Created email directory');
  
  // Copy template files
  const templateFiles = ['environment.ts', 'index.ts', 'send.ts'];
  await copyTemplateFiles('resend', emailDir, templateFiles);
  
  log.detail('Created email utility files');
}

async function installEmailTemplates(selectedTemplates: string[]): Promise<void> {
  if (selectedTemplates.length === 0) return;
  
  const emailDir = 'src/lib/server/email';
  
  for (const template of selectedTemplates) {
    await copyTemplateDirectory(`resend/${template}`, `${emailDir}/${template}`);
    log.detail(`Installed ${template} email templates`);
  }
}

export const resendModule: SetupModule = {
  async install(templateSelections?: string[]) {
    log.moduleTitle('Setting up Resend email service');
    
    // Install required packages
    await installResendPackages();
    
    // Create email directory and files
    await createEmailDirectory();
    
    // Install selected email templates
    if (templateSelections && templateSelections.length > 0) {
      await installEmailTemplates(templateSelections);
    }
    
    // Add RESEND_AUTH to environment files
    await addResendAuthToEnvFiles();
    log.detail('Added RESEND_AUTH to environment files');
    
    log.success('Resend email service configured');
  }
};