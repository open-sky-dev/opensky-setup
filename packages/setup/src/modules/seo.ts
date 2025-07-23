import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import { log } from '../utils/logger.js';
import { copyTemplateFile } from '../utils/templates.js';
import { installDependencies } from '../utils/dependencies.js';
import type { SetupModule } from '../types.js';

async function installSvelteKitMeta(): Promise<void> {
  log.detail('Installing @opensky/seo package...');
  await installDependencies(['@opensky/seo']);
  log.success('@opensky/seo installed');
}

async function createLayoutFile(): Promise<void> {
  const layoutPath = 'src/routes/+layout.ts';
  
  // Always overwrite the layout file to ensure meta setup
  await copyTemplateFile('seo/+layout.ts', layoutPath, true);
  log.detail('Created root layout load function');
}

async function createPageFile(): Promise<void> {
  const pagePath = 'src/routes/+page.ts';
  
  // Only create if it doesn't exist to avoid overwriting existing page logic
  if (!(await pathExists(pagePath))) {
    await copyTemplateFile('seo/+page.ts', pagePath);
    log.detail('Created home page load function');
  } else {
    log.detail('Home page load function already exists');
  }
}

async function updateLayoutSvelte(): Promise<void> {
  const layoutPath = 'src/routes/+layout.svelte';
  
  if (!(await pathExists(layoutPath))) {
    log.error('Could not find root layout file (src/routes/+layout.svelte)');
    return;
  }
  
  let content = await fs.readFile(layoutPath, 'utf-8');
  const importStatement = `import { MetaTags } from '@opensky/seo'`;
  const metaTagsComponent = '<MetaTags />';
  
  // Check if import already exists
  const hasImport = content.includes(importStatement) || content.includes("from '@opensky/seo'");
  const hasComponent = content.includes(metaTagsComponent);
  
  if (hasImport && hasComponent) {
    log.detail('MetaTags already configured in root layout');
    return;
  }
  
  // Add import to script section if needed
  if (!hasImport) {
    const scriptMatch = content.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
    
    if (scriptMatch) {
      const [fullMatch, openTag, scriptContent, closeTag] = scriptMatch;
      
      // Find the last import statement or the beginning of the script
      const importRegex = /import\s+[^;]+;?\s*$/gm;
      const imports = scriptContent.match(importRegex);
      
      let newScriptContent: string;
      if (imports && imports.length > 0) {
        // Add after the last import
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = scriptContent.lastIndexOf(lastImport);
        const beforeImports = scriptContent.substring(0, lastImportIndex + lastImport.length);
        const afterImports = scriptContent.substring(lastImportIndex + lastImport.length);
        newScriptContent = beforeImports + '\n\t' + importStatement + afterImports;
      } else {
        // Add at the beginning of the script
        newScriptContent = '\n\t' + importStatement + scriptContent;
      }
      
      content = content.replace(fullMatch, `${openTag}${newScriptContent}${closeTag}`);
    } else {
      // Add new script section at the top
      content = `<script lang="ts">\n\t${importStatement}\n</script>\n\n${content}`;
    }
    
    log.detail('Added MetaTags import to root layout');
  }
  
  // Add MetaTags component if needed
  if (!hasComponent) {
    // Find where to insert MetaTags - before the first element/component or children render
    const childrenRenderMatch = content.match(/\{@render\s+children\(\)\}/);
    
    if (childrenRenderMatch) {
      const insertIndex = childrenRenderMatch.index!;
      content = content.substring(0, insertIndex) + metaTagsComponent + '\n\n' + content.substring(insertIndex);
    } else {
      // If no children render found, add after the script tag
      const scriptEndMatch = content.match(/<\/script>\s*/);
      if (scriptEndMatch) {
        const insertIndex = scriptEndMatch.index! + scriptEndMatch[0].length;
        content = content.substring(0, insertIndex) + '\n' + metaTagsComponent + '\n' + content.substring(insertIndex);
      }
    }
    
    log.detail('Added MetaTags component to root layout');
  }
  
  await fs.writeFile(layoutPath, content);
}

export const seoModule: SetupModule = {
  async install() {
    log.moduleTitle('Setting up SEO with @opensky/seo');
    
    // Install @opensky/seo package
    await installSvelteKitMeta();
    
    // Create layout load function
    await createLayoutFile();
    
    // Create page load function
    await createPageFile();
    
    // Update +layout.svelte with MetaTags
    await updateLayoutSvelte();
    
    log.success('SEO setup complete');
  }
};