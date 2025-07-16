import { execa } from 'execa';
import { log } from './logger.js';

export async function installDependencies(deps: string[], isDev = false): Promise<void> {
  if (deps.length === 0) return;
  
  const flag = isDev ? '--dev' : '';
  const command = `bun add ${flag} ${deps.join(' ')}`;
  
  log.command(`Running: ${command}`);
  
  try {
    await execa('bun', ['add', ...(isDev ? ['--dev'] : []), ...deps], {
      stdio: 'inherit'
    });
  } catch (error) {
    log.error(`Failed to install dependencies: ${deps.join(', ')}`);
    throw error;
  }
}