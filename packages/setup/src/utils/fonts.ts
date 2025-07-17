import { installDependencies } from './dependencies.js';
import { log } from './logger.js';
import { addFontImport } from './font-import.js';
import fonts from '../fonts.json';

export interface FontConfig {
  package: string;
  label: string;
  hint: string;
}

export async function installFont(fontKey: string): Promise<void> {
  const fontConfig = fonts[fontKey as keyof typeof fonts] as FontConfig;
  
  if (!fontConfig) {
    throw new Error(`Font configuration not found for: ${fontKey}`);
  }

  log.detail(`Installing ${fontConfig.label}...`);
  await installDependencies([fontConfig.package]);
  log.success(`${fontConfig.label} installed`);
}

export async function installInterFont(): Promise<void> {
  log.detail('Installing Inter font...');
  await installDependencies(['@fontsource-variable/inter']);
  
  log.detail('Adding Inter font import to root layout...');
  await addFontImport('@fontsource-variable/inter');
  
  log.success('Inter font installed and configured');
}

export function getFontOptions() {
  return Object.entries(fonts).map(([key, config]) => ({
    value: key,
    label: config.label,
    hint: config.hint
  }));
}