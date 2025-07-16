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
  
  // Add aliases to kit.alias
  if (aliases) {
    content = addAliasesToConfig(content, aliases);
  }
  
  // Add hooks configuration to kit.files.hooks
  if (hooks) {
    content = addHooksToConfig(content, hooks);
  }
  
  if (content !== originalContent) {
    await fs.writeFile(configPath, content);
    
    // Format the file with prettier and eslint
    await formatSvelteConfig(configPath);
    
    console.log(pc.green('✓ Updated svelte.config.js'));
  } else {
    console.log(pc.gray('→ svelte.config.js already up to date'));
  }
}

function addAliasesToConfig(content: string, aliases: SvelteConfigAlias): string {
  // Check if kit.alias already exists
  const kitAliasRegex = /kit:\s*{[^}]*alias:\s*{([^}]*)}/s;
  const kitRegex = /kit:\s*{([^}]*)}/s;
  
  if (kitAliasRegex.test(content)) {
    // kit.alias already exists, merge aliases
    return content.replace(kitAliasRegex, (match, existingAliases) => {
      const newAliases = Object.entries(aliases)
        .map(([key, value]) => `${key}: '${value}'`)
        .join(',\n\t\t\t');
      
      const trimmedExisting = existingAliases.trim();
      const separator = trimmedExisting && !trimmedExisting.endsWith(',') ? ',' : '';
      
      return match.replace(existingAliases, `${existingAliases}${separator}\n\t\t\t${newAliases}`);
    });
  } else if (kitRegex.test(content)) {
    // kit exists but no alias, add alias section
    return content.replace(kitRegex, (match, kitContent) => {
      const aliasString = Object.entries(aliases)
        .map(([key, value]) => `\t\t\t${key}: '${value}'`)
        .join(',\n');
      
      const trimmedKit = kitContent.trim();
      const separator = trimmedKit && !trimmedKit.endsWith(',') ? ',' : '';
      
      return match.replace(kitContent, `${kitContent}${separator}\n\t\talias: {\n${aliasString}\n\t\t}`);
    });
  } else {
    // No kit section, add everything
    const aliasString = Object.entries(aliases)
      .map(([key, value]) => `\t\t\t${key}: '${value}'`)
      .join(',\n');
    
    return content.replace(
      /export default \{([^}]*)\}/s,
      `export default {\n\tkit: {\n\t\talias: {\n${aliasString}\n\t\t}\n\t}$1}`
    );
  }
}

function addHooksToConfig(content: string, hooks: SvelteConfigHooks): string {
  // Check if kit.files.hooks already exists
  const kitFilesHooksRegex = /kit:\s*{[^}]*files:\s*{[^}]*hooks:\s*{([^}]*)}/s;
  const kitFilesRegex = /kit:\s*{[^}]*files:\s*{([^}]*)}/s;
  const kitRegex = /kit:\s*{([^}]*)}/s;
  
  const hooksString = Object.entries(hooks)
    .map(([key, value]) => `\t\t\t${key}: '${value}'`)
    .join(',\n');
  
  if (kitFilesHooksRegex.test(content)) {
    // kit.files.hooks already exists, merge
    return content.replace(kitFilesHooksRegex, (match, existingHooks) => {
      const trimmedExisting = existingHooks.trim();
      const separator = trimmedExisting && !trimmedExisting.endsWith(',') ? ',' : '';
      
      return match.replace(existingHooks, `${existingHooks}${separator}\n${hooksString}`);
    });
  } else if (kitFilesRegex.test(content)) {
    // kit.files exists but no hooks
    return content.replace(kitFilesRegex, (match, filesContent) => {
      const trimmedFiles = filesContent.trim();
      const separator = trimmedFiles && !trimmedFiles.endsWith(',') ? ',' : '';
      
      return match.replace(filesContent, `${filesContent}${separator}\n\t\t\thooks: {\n${hooksString}\n\t\t\t}`);
    });
  } else if (kitRegex.test(content)) {
    // kit exists but no files
    return content.replace(kitRegex, (match, kitContent) => {
      const trimmedKit = kitContent.trim();
      const separator = trimmedKit && !trimmedKit.endsWith(',') ? ',' : '';
      
      return match.replace(kitContent, `${kitContent}${separator}\n\t\tfiles: {\n\t\t\thooks: {\n${hooksString}\n\t\t\t}\n\t\t}`);
    });
  } else {
    // No kit section
    return content.replace(
      /export default \{([^}]*)\}/s,
      `export default {\n\tkit: {\n\t\tfiles: {\n\t\t\thooks: {\n${hooksString}\n\t\t\t}\n\t\t}\n\t}$1}`
    );
  }
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