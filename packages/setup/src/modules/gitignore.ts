import { SetupModule } from '../types.js';
import { updateGitignore, getStandardGitignoreRules } from '../utils/gitignore.js';
import { log, logGroup } from '../utils/logger.js';

export const gitignoreModule: SetupModule = {
  name: 'gitignore',
  description: 'Update .gitignore with essential rules',
  
  async install() {
    log.moduleTitle('Updating .gitignore with essential rules...');
    
    const rules = getStandardGitignoreRules();
    await updateGitignore(rules);
    
    logGroup.list('.gitignore updated with:', [
      '.env (but keeps .env.example)',
      '.nova/ (Nova editor)',
      '.vscode/ (VS Code settings)'
    ]);
  }
};