import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { log } from './logger.js';

export interface EnvVariable {
  key: string;
  value: string;
  comment?: string;
}

export async function parseEnvFile(filePath: string): Promise<EnvVariable[]> {
  if (!(await pathExists(filePath))) {
    return [];
  }
  
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const variables: EnvVariable[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse key=value pairs
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      variables.push({ key, value });
    }
  }
  
  return variables;
}

export async function addResendAuthToEnvFiles(): Promise<void> {
  const resendVar: EnvVariable = {
    key: 'RESEND_AUTH',
    value: ''
  };
  
  // Add to .env (development) - preserve existing variables
  if (!(await pathExists('.env'))) {
    await createEnvFile('.env', [resendVar]);
  } else {
    await updateEnvFile('.env', [resendVar], []);
  }
  
  // Add to .env.example - preserve existing and add missing template vars
  if (!(await pathExists('.env.example'))) {
    await createEnvFile('.env.example', [resendVar]);
  } else {
    // Parse existing and ensure all our template vars are present
    const existingVars = await parseEnvFile('.env.example');
    const mergedVars = [...existingVars];
    
    // Add RESEND_AUTH if missing
    if (!existingVars.find(v => v.key === 'RESEND_AUTH')) {
      mergedVars.push(resendVar);
    }
    
    await updateEnvFile('.env.example', mergedVars, []);
  }
}

export async function updateEnvFile(
  filePath: string,
  updates: EnvVariable[],
  removePatterns: string[] = []
): Promise<void> {
  let existingVars: EnvVariable[] = [];
  
  // Parse existing file if it exists
  if (await pathExists(filePath)) {
    existingVars = await parseEnvFile(filePath);
  }
  
  // Remove variables matching patterns (e.g., DATABASE*, DB*)
  if (removePatterns.length > 0) {
    existingVars = existingVars.filter(variable => {
      return !removePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'), 'i');
        return regex.test(variable.key);
      });
    });
  }
  
  // Add or update variables
  for (const update of updates) {
    const existingIndex = existingVars.findIndex(v => v.key === update.key);
    if (existingIndex >= 0) {
      existingVars[existingIndex] = update;
    } else {
      existingVars.push(update);
    }
  }
  
  // Group variables by type
  const nodeEnvVar = existingVars.filter(v => v.key === 'NODE_ENV');
  const dbVars = existingVars.filter(v => 
    v.key.startsWith('DB') || 
    v.key.startsWith('DATABASE') || 
    v.key.startsWith('PG')
  );
  const serviceVars = existingVars.filter(v => 
    v.key !== 'NODE_ENV' &&
    !v.key.startsWith('DB') && 
    !v.key.startsWith('DATABASE') && 
    !v.key.startsWith('PG')
  );
  
  // Generate content with sections
  const sections: string[] = [];
  
  // NODE_ENV first (no header, just the variable)
  if (nodeEnvVar.length > 0) {
    sections.push(nodeEnvVar.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Database configuration second
  if (dbVars.length > 0) {
    sections.push('# Database\n' +
      dbVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Services third
  if (serviceVars.length > 0) {
    sections.push('# Services\n' +
      serviceVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  const content = sections.join('\n\n');
  await fs.writeFile(filePath, content + '\n');
}

export async function createEnvFile(filePath: string, variables: EnvVariable[]): Promise<void> {
  // Group variables by type
  const nodeEnvVar = variables.filter(v => v.key === 'NODE_ENV');
  const dbVars = variables.filter(v => 
    v.key.startsWith('DB') || 
    v.key.startsWith('DATABASE') || 
    v.key.startsWith('PG')
  );
  const serviceVars = variables.filter(v => 
    v.key !== 'NODE_ENV' &&
    !v.key.startsWith('DB') && 
    !v.key.startsWith('DATABASE') && 
    !v.key.startsWith('PG')
  );
  
  // Generate content with sections
  const sections: string[] = [];
  
  // NODE_ENV first (no header, just the variable)
  if (nodeEnvVar.length > 0) {
    sections.push(nodeEnvVar.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Database configuration second
  if (dbVars.length > 0) {
    sections.push('# Database\n' +
      dbVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Services third
  if (serviceVars.length > 0) {
    sections.push('# Services\n' +
      serviceVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  const content = sections.join('\n\n');
  await fs.writeFile(filePath, content + '\n');
  log.detail(`Created ${filePath}`);
}


export function getDevEnvVariables(dbType: 'drizzle' | 'neon'): EnvVariable[] {
  const baseVars: EnvVariable[] = [
    {
      key: 'NODE_ENV',
      value: 'development'
    }
  ];
  
  if (dbType === 'drizzle') {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: './db/dev.db'
      }
      // Note: DB_AUTH is only for production, not development
    ];
  } else {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: ''
      }
    ];
  }
}

export function getExampleEnvVariables(dbType: 'drizzle' | 'neon'): EnvVariable[] {
  const baseVars: EnvVariable[] = [
    {
      key: 'NODE_ENV',
      value: 'development'
    }
  ];
  
  if (dbType === 'drizzle') {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: './db/dev.db'
      },
      {
        key: 'DB_AUTH',
        value: ''
      }
    ];
  } else {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: ''
      }
    ];
  }
}


export async function renameDatabaseUrl(filePath: string, newDbUrl?: string): Promise<void> {
  if (!(await pathExists(filePath))) {
    return;
  }
  
  const existingVars = await parseEnvFile(filePath);
  const databaseUrlVar = existingVars.find(v => v.key === 'DATABASE_URL');
  
  if (databaseUrlVar) {
    // Remove DATABASE_URL and add DB_URL with the existing value (or provided new value)
    const updatedVars = existingVars.filter(v => v.key !== 'DATABASE_URL');
    updatedVars.push({
      key: 'DB_URL',
      value: newDbUrl || databaseUrlVar.value
    });
    
    // Rewrite the file with all existing variables plus the renamed one
    await updateEnvFile(filePath, [], []); // Don't remove anything
    await updateEnvFile(filePath, updatedVars, ['DATABASE_URL']); // Just remove DATABASE_URL and add all vars
  }
}

export async function setupDrizzleEnvironment(dbType: 'drizzle' | 'neon'): Promise<void> {
  // Get DB variables for templates
  const devDbVariables = getDevEnvVariables(dbType);
  const exampleDbVariables = getExampleEnvVariables(dbType);
  
  // Handle .env file - rename DATABASE_URL to DB_URL and clean up unwanted DATABASE_* vars
  if (await pathExists('.env')) {
    await renameDatabaseUrl('.env');
    
    // Remove any unwanted DATABASE_* variables and add missing dev variables
    const existingVars = await parseEnvFile('.env');
    const cleanedVars = existingVars.filter(v => 
      !v.key.startsWith('DATABASE_') || v.key === 'DATABASE_URL' // Keep DATABASE_URL for renaming
    );
    
    // For turso (drizzle), we want to force DB_URL to be ./db/dev.db in development
    // For postgres/neon, we preserve the existing value
    const devVariables = [...devDbVariables];
    const mergedVars = [...cleanedVars];
    
    for (const devVar of devVariables) {
      const existingVar = cleanedVars.find(v => v.key === devVar.key);
      if (existingVar) {
        // For turso development, force DB_URL to be ./db/dev.db
        if (dbType === 'drizzle' && devVar.key === 'DB_URL') {
          // Replace the existing DB_URL with our dev value
          const index = mergedVars.findIndex(v => v.key === 'DB_URL');
          if (index >= 0) {
            mergedVars[index] = devVar;
          }
        }
        // For other variables or postgres, keep existing values
      } else {
        // Add missing variables
        mergedVars.push(devVar);
      }
    }
    
    await updateEnvFile('.env', mergedVars, ['DATABASE_*']);
  } else {
    // Create new .env with dev variables
    const devVariables = [...devDbVariables];
    await createEnvFile('.env', devVariables);
  }
  
  // Handle .env.example - ensure it has the correct template values including DB_AUTH for turso
  const exampleVars = [...exampleDbVariables];
  if (await pathExists('.env.example')) {
    // Parse existing and remove all DATABASE_* variables
    const existingExampleVars = await parseEnvFile('.env.example').then(vars => 
      vars.filter(v => !v.key.startsWith('DATABASE_')) // Remove all DATABASE_* variables
    );
    const mergedVars = [...existingExampleVars];
    
    // Add any missing template vars (including DB_URL and DB_AUTH for turso)
    for (const templateVar of exampleVars) {
      if (!existingExampleVars.find(v => v.key === templateVar.key)) {
        mergedVars.push(templateVar);
      }
    }
    
    // Write the merged vars
    await updateEnvFile('.env.example', mergedVars, ['DATABASE_*']);
  } else {
    await createEnvFile('.env.example', exampleVars);
  }
}