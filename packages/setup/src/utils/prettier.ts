import { execa } from 'execa';
import { log } from './logger.js';

/**
 * Runs prettier on the working directory to clean up formatting
 */
export async function runPrettierFormat(): Promise<void> {
  log.command('Running: bunx prettier --write .');
  
  try {
    await execa('bunx', ['prettier', '--write', '.'], {
      stdio: 'pipe' // Hide output since it can be verbose
    });
    log.success('Code formatted with Prettier');
  } catch (error) {
    log.warning('Prettier formatting failed (this is non-critical)');
    log.detail(error instanceof Error ? error.message : String(error));
  }
}