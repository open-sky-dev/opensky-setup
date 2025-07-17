import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { log } from '../utils/logger.js';
import { updateEnvFile, type EnvVariable } from '../utils/env.js';
import type { SetupModule } from '../types.js';

const PUBLIC_ENV_VARIABLES: EnvVariable[] = [
  {
    key: 'PUBLIC_URL_BASE',
    value: 'https://yourdomain.com',
    comment: 'Base URL for the application'
  },
  {
    key: 'PUBLIC_URL_ID',
    value: 'your-app-id',
    comment: 'Application identifier'
  },
  {
    key: 'PUBLIC_SITE_NAME',
    value: 'Your App Name',
    comment: 'Display name for the site'
  },
  {
    key: 'PUBLIC_URL_ASSETS',
    value: 'https://assets.yourdomain.com',
    comment: 'URL for static assets'
  },
  {
    key: 'PUBLIC_ANALYTICS',
    value: 'your-analytics-id',
    comment: 'Analytics tracking ID'
  }
];

async function findEnvFiles(): Promise<string[]> {
  const envFiles: string[] = [];
  
  try {
    // Read all files in the current directory
    const files = await fs.readdir('.');
    
    // Filter for .env* files
    const envPatterns = files.filter(file => 
      file.startsWith('.env') && 
      (file === '.env' || file.match(/^\.env\./))
    );
    
    // Check if each file exists and is readable
    for (const file of envPatterns) {
      if (await pathExists(file)) {
        envFiles.push(file);
      }
    }
    
    return envFiles;
  } catch (error) {
    log.error('Error reading directory for env files');
    return [];
  }
}

async function addPublicVariablesToEnvFiles(): Promise<void> {
  const envFiles = await findEnvFiles();
  
  if (envFiles.length === 0) {
    log.detail('No .env files found');
    return;
  }
  
  log.detail(`Found ${envFiles.length} env files: ${envFiles.join(', ')}`);
  
  for (const envFile of envFiles) {
    try {
      // Add PUBLIC_* variables to each env file, removing any existing PUBLIC_* variables first
      await updateEnvFile(envFile, PUBLIC_ENV_VARIABLES, ['PUBLIC_*']);
      log.detail(`Updated ${envFile} with PUBLIC_* variables`);
    } catch (error) {
      log.error(`Failed to update ${envFile}: ${error}`);
    }
  }
}

export const envModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up environment variables');
    
    // Add PUBLIC_* variables to all env files
    await addPublicVariablesToEnvFiles();
    
    log.success('Environment variables configured');
  }
};