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
    value: 'your-resend-auth-token',
    comment: 'Resend API authentication token'
  };

  const devResendVar: EnvVariable = {
    key: 'RESEND_AUTH',
    value: 'your-resend-auth-token',
    comment: 'Resend API authentication token for development'
  };

  // Add to .env (development)
  await updateEnvFile('.env', [devResendVar], ['RESEND_AUTH']);
  
  // Add to .env.prod (production)
  await updateEnvFile('.env.prod', [resendVar], ['RESEND_AUTH']);
  
  // Add to .env.example
  await updateEnvFile('.env.example', [resendVar], ['RESEND_AUTH']);
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
  
  // Generate content
  const content = existingVars
    .map(variable => {
      const comment = variable.comment ? `# ${variable.comment}\n` : '';
      return `${comment}${variable.key}=${variable.value}`;
    })
    .join('\n');
  
  await fs.writeFile(filePath, content + '\n');
}

export async function createEnvFile(filePath: string, variables: EnvVariable[]): Promise<void> {
  const content = variables
    .map(variable => {
      const comment = variable.comment ? `# ${variable.comment}\n` : '';
      return `${comment}${variable.key}=${variable.value}`;
    })
    .join('\n');
  
  await fs.writeFile(filePath, content + '\n');
  log.detail(`Created ${filePath}`);
}

export function getDevEnvVariables(dbType: 'drizzle' | 'neon'): EnvVariable[] {
  const baseVars: EnvVariable[] = [
    {
      key: 'NODE_ENV',
      value: 'development',
      comment: 'Development environment'
    }
  ];
  
  if (dbType === 'drizzle') {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: './db/dev.db',
        comment: 'Local SQLite database path'
      }
    ];
  } else {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: '',
        comment: 'Neon database URL for development'
      }
    ];
  }
}

export function getProdEnvVariables(dbType: 'drizzle' | 'neon'): EnvVariable[] {
  const baseVars: EnvVariable[] = [
    {
      key: 'NODE_ENV',
      value: 'production',
      comment: 'Production environment'
    }
  ];
  
  if (dbType === 'drizzle') {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: 'libsql://your-database-url',
        comment: 'Turso database URL'
      },
      {
        key: 'DB_AUTH',
        value: 'your-auth-token',
        comment: 'Turso auth token'
      }
    ];
  } else {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: 'postgresql://your-connection-string',
        comment: 'Neon database URL'
      }
    ];
  }
}