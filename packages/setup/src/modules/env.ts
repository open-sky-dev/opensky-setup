import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { log } from '../utils/logger.js';
import { updateEnvFile, createEnvFile, getPublicEnvVariables, type EnvVariable } from '../utils/env.js';
import type { SetupModule } from '../types.js';

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
  
  const publicVariables = getPublicEnvVariables();
  
  for (const envFile of envFiles) {
    try {
      // Add PUBLIC_* variables to each env file, removing any existing PUBLIC_* variables first
      await updateEnvFile(envFile, publicVariables, ['PUBLIC_*']);
      log.detail(`Updated ${envFile} with PUBLIC_* variables`);
    } catch (error) {
      log.error(`Failed to update ${envFile}: ${error}`);
    }
  }
}

export const envModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up environment variables');
    
    const publicVariables = getPublicEnvVariables();
    
    // Create .env if it doesn't exist
    if (!(await pathExists('.env'))) {
      await createEnvFile('.env', publicVariables);
      log.detail('Created .env file with PUBLIC_* variables');
    }
    
    // Create .env.example if it doesn't exist
    if (!(await pathExists('.env.example'))) {
      await createEnvFile('.env.example', publicVariables);
      log.detail('Created .env.example file with PUBLIC_* variables');
    }
    
    // Create .env.prod if it doesn't exist
    if (!(await pathExists('.env.prod'))) {
      await createEnvFile('.env.prod', publicVariables);
      log.detail('Created .env.prod file with PUBLIC_* variables');
    }
    
    // Update existing env files with PUBLIC_* variables
    await addPublicVariablesToEnvFiles();
    
    log.success('Environment variables configured');
  }
};