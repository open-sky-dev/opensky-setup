import { Project, ObjectLiteralExpression, PropertyAssignment, SyntaxKind, SourceFile, VariableDeclaration } from 'ts-morph';
import { pathExists } from 'fs-extra';
import { execa } from 'execa';
import { log } from './logger.js';

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
  hooks?: SvelteConfigHooks,
  errorTemplate?: string
): Promise<void> {
  const configPath = 'svelte.config.js';
  
  if (!(await pathExists(configPath))) {
    throw new Error('svelte.config.js not found. Are you in a SvelteKit project?');
  }
  
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(configPath);
  
  // Find the configuration object - handle various patterns
  const configObjectLiteral = findConfigObject(sourceFile);
  if (!configObjectLiteral) {
    throw new Error('Could not find configuration object in svelte.config.js');
  }
  
  // Get or create the kit property
  const kitProperty = getOrCreateKitProperty(configObjectLiteral);
  const kitObject = kitProperty.getInitializer() as ObjectLiteralExpression;
  
  let hasChanges = false;
  
  // Update aliases
  if (aliases) {
    const aliasProperty = getOrCreateProperty(kitObject, 'alias');
    const aliasObject = aliasProperty.getInitializer() as ObjectLiteralExpression;
    
    for (const [key, value] of Object.entries(aliases)) {
      if (!aliasObject.getProperty(key)) {
        aliasObject.addPropertyAssignment({
          name: key,
          initializer: `'${value}'`
        });
        hasChanges = true;
      }
    }
  }
  
  // Update hooks configuration
  if (hooks) {
    const filesProperty = getOrCreateProperty(kitObject, 'files');
    const filesObject = filesProperty.getInitializer() as ObjectLiteralExpression;
    
    const hooksProperty = getOrCreateProperty(filesObject, 'hooks');
    const hooksObject = hooksProperty.getInitializer() as ObjectLiteralExpression;
    
    for (const [key, value] of Object.entries(hooks)) {
      if (!hooksObject.getProperty(key)) {
        hooksObject.addPropertyAssignment({
          name: key,
          initializer: `'${value}'`
        });
        hasChanges = true;
      }
    }
  }
  
  // Update error template
  if (errorTemplate) {
    const filesProperty = getOrCreateProperty(kitObject, 'files');
    const filesObject = filesProperty.getInitializer() as ObjectLiteralExpression;
    
    const existingErrorTemplate = filesObject.getProperty('errorTemplate');
    if (!existingErrorTemplate) {
      filesObject.addPropertyAssignment({
        name: 'errorTemplate',
        initializer: `'${errorTemplate}'`
      });
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    // Save the file
    await sourceFile.save();
    
    // Format the file
    await formatSvelteConfig(configPath);
    
    log.success('Updated svelte.config.js');
  } else {
    log.info('svelte.config.js already up to date');
  }
}

function findConfigObject(sourceFile: SourceFile): ObjectLiteralExpression | null {
  // Pattern 1: export default { ... }
  const exportAssignment = sourceFile.getExportAssignment(() => true);
  if (exportAssignment) {
    const configObject = exportAssignment.getExpression();
    if (configObject?.asKind(SyntaxKind.ObjectLiteralExpression)) {
      return configObject as ObjectLiteralExpression;
    }
    
    // Pattern 2: export default config; (where config is a variable)
    if (configObject?.asKind(SyntaxKind.Identifier)) {
      const identifier = configObject.getText();
      const variableDeclaration = sourceFile.getVariableDeclaration(identifier);
      if (variableDeclaration) {
        const initializer = variableDeclaration.getInitializer();
        if (initializer?.asKind(SyntaxKind.ObjectLiteralExpression)) {
          return initializer as ObjectLiteralExpression;
        }
      }
    }
  }
  
  // Pattern 3: Look for a variable named 'config' directly
  const configVar = sourceFile.getVariableDeclaration('config');
  if (configVar) {
    const initializer = configVar.getInitializer();
    if (initializer?.asKind(SyntaxKind.ObjectLiteralExpression)) {
      return initializer as ObjectLiteralExpression;
    }
  }
  
  return null;
}

function getOrCreateKitProperty(configObject: ObjectLiteralExpression): PropertyAssignment {
  let kitProperty = configObject.getProperty('kit');
  
  if (!kitProperty) {
    kitProperty = configObject.addPropertyAssignment({
      name: 'kit',
      initializer: '{}'
    });
  }
  
  return kitProperty as PropertyAssignment;
}

function getOrCreateProperty(parentObject: ObjectLiteralExpression, propertyName: string): PropertyAssignment {
  let property = parentObject.getProperty(propertyName);
  
  if (!property) {
    property = parentObject.addPropertyAssignment({
      name: propertyName,
      initializer: '{}'
    });
  }
  
  return property as PropertyAssignment;
}

async function formatSvelteConfig(configPath: string): Promise<void> {
  try {
    // Try prettier first
    await execa('npx', ['prettier', '--write', configPath], { stdio: 'pipe' });
    log.detail('Formatted with prettier');
  } catch (error) {
    // Prettier might not be available, skip silently
  }
  
  try {
    // Try eslint --fix
    await execa('npx', ['eslint', '--fix', configPath], { stdio: 'pipe' });
    log.detail('Linted with eslint');
  } catch (error) {
    // ESLint might not be available, skip silently
  }
}