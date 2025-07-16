import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { execa } from 'execa';
import pc from 'picocolors';

export interface SvelteConfigAlias {
  [key: string]: string;
}

export interface SvelteConfigHooks {
  server?: string;
  client?: string;
  universal?: string;
}

export async function updateSvelteConfig(
  aliases?: SvelteConfigAlias,
  hooks?: SvelteConfigHooks
): Promise<void> {
  const configPath = 'svelte.config.js';
  
  if (!(await pathExists(configPath))) {
    throw new Error('svelte.config.js not found. Are you in a SvelteKit project?');
  }
  
  let content = await fs.readFile(configPath, 'utf-8');
  const originalContent = content;
  
  // Parse and update the config
  content = updateKitConfig(content, aliases, hooks);
  
  if (content !== originalContent) {
    await fs.writeFile(configPath, content);
    
    // Format the file with prettier and eslint
    await formatSvelteConfig(configPath);
    
    console.log(pc.green('✓ Updated svelte.config.js'));
  } else {
    console.log(pc.gray('→ svelte.config.js already up to date'));
  }
}

function updateKitConfig(
  content: string, 
  aliases?: SvelteConfigAlias, 
  hooks?: SvelteConfigHooks
): string {
  // Find the kit object
  const kitRegex = /kit:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/s;
  const kitMatch = content.match(kitRegex);
  
  if (!kitMatch) {
    // No kit object exists, create one
    const newKit = buildKitObject(aliases, hooks);
    return content.replace(
      /export default \{([^}]*)\}/s,
      `export default {${newKit}$1}`
    );
  }
  
  let kitContent = kitMatch[1];
  
  // Update alias section
  if (aliases) {
    kitContent = updateAliasInKit(kitContent, aliases);
  }
  
  // Update files.hooks section
  if (hooks) {
    kitContent = updateFilesHooksInKit(kitContent, hooks);
  }
  
  return content.replace(kitMatch[0], `kit: {${kitContent}}`);
}

function updateAliasInKit(kitContent: string, aliases: SvelteConfigAlias): string {
  const aliasRegex = /alias:\s*{([^{}]*)}/s;
  const aliasMatch = kitContent.match(aliasRegex);
  
  const aliasEntries = Object.entries(aliases)
    .map(([key, value]) => `\t\t\t${key}: '${value}'`)
    .join(',\n');
  
  if (aliasMatch) {
    // Alias exists, merge with existing
    const existingAliases = aliasMatch[1].trim();
    const separator = existingAliases && !existingAliases.endsWith(',') ? ',' : '';
    
    return kitContent.replace(
      aliasMatch[0],
      `alias: {${existingAliases}${separator}\n${aliasEntries}\n\t\t}`
    );
  } else {
    // No alias, add it
    const trimmedKit = kitContent.trim();
    const separator = trimmedKit && !trimmedKit.endsWith(',') ? ',' : '';
    
    return `${kitContent}${separator}\n\t\talias: {\n${aliasEntries}\n\t\t}`;
  }
}

function updateFilesHooksInKit(kitContent: string, hooks: SvelteConfigHooks): string {
  const filesRegex = /files:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/s;
  const filesMatch = kitContent.match(filesRegex);
  
  const hooksEntries = Object.entries(hooks)
    .map(([key, value]) => `\t\t\t\t${key}: '${value}'`)
    .join(',\n');
  
  if (filesMatch) {
    // files object exists
    const filesContent = filesMatch[1];
    const hooksRegex = /hooks:\s*{([^{}]*)}/s;
    const hooksMatch = filesContent.match(hooksRegex);
    
    if (hooksMatch) {
      // hooks exists in files, merge
      const existingHooks = hooksMatch[1].trim();
      const separator = existingHooks && !existingHooks.endsWith(',') ? ',' : '';
      
      const newFilesContent = filesContent.replace(
        hooksMatch[0],
        `hooks: {${existingHooks}${separator}\n${hooksEntries}\n\t\t\t}`
      );
      
      return kitContent.replace(filesMatch[0], `files: {${newFilesContent}}`);
    } else {
      // files exists but no hooks, add hooks
      const trimmedFiles = filesContent.trim();
      const separator = trimmedFiles && !trimmedFiles.endsWith(',') ? ',' : '';
      
      const newFilesContent = `${filesContent}${separator}\n\t\t\thooks: {\n${hooksEntries}\n\t\t\t}`;
      return kitContent.replace(filesMatch[0], `files: {${newFilesContent}}`);
    }
  } else {
    // No files object, create it with hooks
    const trimmedKit = kitContent.trim();
    const separator = trimmedKit && !trimmedKit.endsWith(',') ? ',' : '';
    
    return `${kitContent}${separator}\n\t\tfiles: {\n\t\t\thooks: {\n${hooksEntries}\n\t\t\t}\n\t\t}`;
  }
}

function buildKitObject(aliases?: SvelteConfigAlias, hooks?: SvelteConfigHooks): string {
  const parts: string[] = [];
  
  if (aliases) {
    const aliasEntries = Object.entries(aliases)
      .map(([key, value]) => `\t\t\t${key}: '${value}'`)
      .join(',\n');
    parts.push(`\t\talias: {\n${aliasEntries}\n\t\t}`);
  }
  
  if (hooks) {
    const hooksEntries = Object.entries(hooks)
      .map(([key, value]) => `\t\t\t\t${key}: '${value}'`)
      .join(',\n');
    parts.push(`\t\tfiles: {\n\t\t\thooks: {\n${hooksEntries}\n\t\t\t}\n\t\t}`);
  }
  
  return parts.length > 0 ? `\n\tkit: {\n${parts.join(',\n')}\n\t},` : '';
}

async function formatSvelteConfig(configPath: string): Promise<void> {
  try {
    // Try prettier first
    await execa('npx', ['prettier', '--write', configPath], { stdio: 'pipe' });
    console.log(pc.gray('  → Formatted with prettier'));
  } catch (error) {
    // Prettier might not be available, skip silently
  }
  
  try {
    // Try eslint --fix
    await execa('npx', ['eslint', '--fix', configPath], { stdio: 'pipe' });
    console.log(pc.gray('  → Linted with eslint'));
  } catch (error) {
    // ESLint might not be available, skip silently
  }
}