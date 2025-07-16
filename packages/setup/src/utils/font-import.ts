import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { log } from './logger.js';

/**
 * Adds a font import to the root layout file
 */
export async function addFontImport(fontPackage: string): Promise<void> {
  const layoutPath = 'src/routes/+layout.svelte';
  
  if (!(await pathExists(layoutPath))) {
    log.error('Could not find root layout file (src/routes/+layout.svelte)');
    return;
  }
  
  const content = await fs.readFile(layoutPath, 'utf-8');
  const importStatement = `import '${fontPackage}';`;
  
  // Check if import already exists
  if (content.includes(importStatement)) {
    log.detail('Font import already exists in root layout');
    return;
  }
  
  // Add import to script section
  let updatedContent: string;
  const scriptMatch = content.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
  
  if (scriptMatch) {
    // Add import to existing script section
    const [, openTag, scriptContent, closeTag] = scriptMatch;
    const newScriptContent = `${importStatement}\n${scriptContent}`;
    updatedContent = content.replace(scriptMatch[0], `${openTag}${newScriptContent}${closeTag}`);
  } else {
    // Add new script section at the top
    updatedContent = `<script>\n${importStatement}\n</script>\n\n${content}`;
  }
  
  await fs.writeFile(layoutPath, updatedContent);
  log.detail(`Added font import to ${layoutPath}`);
}