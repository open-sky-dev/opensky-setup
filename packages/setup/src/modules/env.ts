import { pathExists } from 'fs-extra';
import { log } from '../utils/logger.js';
import { parseEnvFile, updateEnvFile, createEnvFile, type EnvVariable } from '../utils/env.js';
import { copyTemplateFile } from '../utils/templates.js';
import type { SetupModule } from '../types.js';

export const envModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up environment variables');
    
    // NODE_ENV variable to ensure is present
    const nodeEnvVar: EnvVariable = {
      key: 'NODE_ENV',
      value: 'development'
    };
    
    // Handle .env file
    if (await pathExists('.env')) {
      // Parse existing variables
      const existingVars = await parseEnvFile('.env');
      
      // Add NODE_ENV if it doesn't exist
      if (!existingVars.find(v => v.key === 'NODE_ENV')) {
        existingVars.unshift(nodeEnvVar); // Add to beginning
      }
      
      // Rewrite with proper organization
      await updateEnvFile('.env', existingVars, []);
      log.detail('Organized .env file');
    } else {
      // Create new .env with just NODE_ENV
      await createEnvFile('.env', [nodeEnvVar]);
      log.detail('Created .env file');
    }
    
    // Handle .env.example file
    if (await pathExists('.env.example')) {
      // Parse existing variables
      const existingVars = await parseEnvFile('.env.example');
      
      // Add NODE_ENV if it doesn't exist
      if (!existingVars.find(v => v.key === 'NODE_ENV')) {
        existingVars.unshift(nodeEnvVar); // Add to beginning
      }
      
      // Rewrite with proper organization
      await updateEnvFile('.env.example', existingVars, []);
      log.detail('Organized .env.example file');
    } else {
      // Create new .env.example with just NODE_ENV
      await createEnvFile('.env.example', [nodeEnvVar]);
      log.detail('Created .env.example file');
    }
    
    // Copy site-config.ts template
    await copyTemplateFile('config/site-config.ts', 'src/lib/site-config.ts');
    log.detail('Created site-config.ts with site configuration');
    
    log.success('Environment variables and site config configured');
  }
};