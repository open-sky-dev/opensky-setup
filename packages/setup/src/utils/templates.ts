import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the path to the templates directory
// The templates directory is alongside dist/, so we need to go up from dist/ to find templates/
const templatesDir = path.join(__dirname, '..', 'templates');

export async function copyTemplateFile(templatePath: string, targetPath: string, forceOverwrite: boolean = false): Promise<void> {
  const fullTemplatePath = path.join(templatesDir, templatePath);
  
  if (!(await pathExists(fullTemplatePath))) {
    throw new Error(`Template file not found: ${fullTemplatePath}`);
  }
  
  if (await pathExists(targetPath) && !forceOverwrite) {
    log.detail(`File already exists: ${targetPath}`);
    return;
  }
  
  const templateContent = await fs.readFile(fullTemplatePath, 'utf-8');
  await fs.writeFile(targetPath, templateContent);
  
  if (await pathExists(targetPath) && forceOverwrite) {
    log.detail(`Overwritten: ${templatePath} → ${targetPath}`);
  } else {
    log.detail(`Copied template: ${templatePath} → ${targetPath}`);
  }
}

export async function copyTemplateFiles(templateDir: string, targetDir: string, files: string[]): Promise<void> {
  for (const file of files) {
    const templatePath = path.join(templateDir, file);
    const targetPath = path.join(targetDir, file);
    await copyTemplateFile(templatePath, targetPath);
  }
}