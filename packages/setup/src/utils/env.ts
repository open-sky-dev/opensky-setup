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
    value: 'your-resend-auth-token'
  };

  const devResendVar: EnvVariable = {
    key: 'RESEND_AUTH',
    value: 'your-resend-auth-token'
  };

  // Create files with PUBLIC variables if they don't exist
  const publicVariables = getPublicEnvVariables();
  
  // Add to .env (development)
  if (!(await pathExists('.env'))) {
    await createEnvFile('.env', [...publicVariables, devResendVar]);
  } else {
    await updateEnvFile('.env', [devResendVar], ['RESEND_AUTH']);
  }
  
  // Add to .env.prod (production)
  if (!(await pathExists('.env.prod'))) {
    await createEnvFile('.env.prod', [...publicVariables, resendVar]);
  } else {
    await updateEnvFile('.env.prod', [resendVar], ['RESEND_AUTH']);
  }
  
  // Add to .env.example
  if (!(await pathExists('.env.example'))) {
    await createEnvFile('.env.example', [...publicVariables, resendVar]);
  } else {
    await updateEnvFile('.env.example', [resendVar], ['RESEND_AUTH']);
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
  const dbVars = existingVars.filter(v => v.key.startsWith('DB_') || v.key === 'DATABASE_URL');
  const serviceVars = existingVars.filter(v => 
    !v.key.startsWith('PUBLIC_') && 
    !v.key.startsWith('DB_') && 
    v.key !== 'DATABASE_URL' && 
    v.key !== 'NODE_ENV'
  );
  const publicVars = existingVars.filter(v => v.key.startsWith('PUBLIC_'));
  
  // Generate content with sections
  const sections: string[] = [];
  
  // NODE_ENV first
  if (nodeEnvVar.length > 0) {
    sections.push('# Environment\n' + 
      nodeEnvVar.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Database configuration
  if (dbVars.length > 0) {
    sections.push('# Database\n' +
      dbVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Other services (like RESEND_AUTH)
  if (serviceVars.length > 0) {
    // Group by service type
    const resendVars = serviceVars.filter(v => v.key.startsWith('RESEND_'));
    const otherServiceVars = serviceVars.filter(v => !v.key.startsWith('RESEND_'));
    
    if (resendVars.length > 0) {
      sections.push('# Email Service\n' +
        resendVars.map(v => `${v.key}=${v.value}`).join('\n'));
    }
    
    if (otherServiceVars.length > 0) {
      sections.push('# Services\n' +
        otherServiceVars.map(v => `${v.key}=${v.value}`).join('\n'));
    }
  }
  
  // Public variables last
  if (publicVars.length > 0) {
    sections.push('# Public Variables\n' + 
      publicVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  const content = sections.join('\n\n');
  await fs.writeFile(filePath, content + '\n');
}

export async function createEnvFile(filePath: string, variables: EnvVariable[]): Promise<void> {
  // Group variables by type
  const nodeEnvVar = variables.filter(v => v.key === 'NODE_ENV');
  const dbVars = variables.filter(v => v.key.startsWith('DB_') || v.key === 'DATABASE_URL');
  const serviceVars = variables.filter(v => 
    !v.key.startsWith('PUBLIC_') && 
    !v.key.startsWith('DB_') && 
    v.key !== 'DATABASE_URL' && 
    v.key !== 'NODE_ENV'
  );
  const publicVars = variables.filter(v => v.key.startsWith('PUBLIC_'));
  
  // Generate content with sections
  const sections: string[] = [];
  
  // NODE_ENV first
  if (nodeEnvVar.length > 0) {
    sections.push('# Environment\n' + 
      nodeEnvVar.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Database configuration
  if (dbVars.length > 0) {
    sections.push('# Database\n' +
      dbVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  // Other services (like RESEND_AUTH)
  if (serviceVars.length > 0) {
    // Group by service type
    const resendVars = serviceVars.filter(v => v.key.startsWith('RESEND_'));
    const otherServiceVars = serviceVars.filter(v => !v.key.startsWith('RESEND_'));
    
    if (resendVars.length > 0) {
      sections.push('# Email Service\n' +
        resendVars.map(v => `${v.key}=${v.value}`).join('\n'));
    }
    
    if (otherServiceVars.length > 0) {
      sections.push('# Services\n' +
        otherServiceVars.map(v => `${v.key}=${v.value}`).join('\n'));
    }
  }
  
  // Public variables last
  if (publicVars.length > 0) {
    sections.push('# Public Variables\n' + 
      publicVars.map(v => `${v.key}=${v.value}`).join('\n'));
  }
  
  const content = sections.join('\n\n');
  await fs.writeFile(filePath, content + '\n');
  log.detail(`Created ${filePath}`);
}

export function getPublicEnvVariables(): EnvVariable[] {
  return [
    {
      key: 'PUBLIC_URL_BASE',
      value: 'https://yourdomain.com'
    },
    {
      key: 'PUBLIC_URL_ID',
      value: 'your-app-id'
    },
    {
      key: 'PUBLIC_SITE_NAME',
      value: 'Your App Name'
    },
    {
      key: 'PUBLIC_URL_ASSETS',
      value: 'https://assets.yourdomain.com'
    },
    {
      key: 'PUBLIC_ANALYTICS',
      value: 'your-analytics-id'
    }
  ];
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

export function getProdEnvVariables(dbType: 'drizzle' | 'neon'): EnvVariable[] {
  const baseVars: EnvVariable[] = [
    {
      key: 'NODE_ENV',
      value: 'production'
    }
  ];
  
  if (dbType === 'drizzle') {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: 'libsql://your-database-url'
      },
      {
        key: 'DB_AUTH',
        value: 'your-auth-token'
      }
    ];
  } else {
    return [
      ...baseVars,
      {
        key: 'DB_URL',
        value: 'postgresql://your-connection-string'
      }
    ];
  }
}