import { SetupModule } from '../types.js';
import { updateGitignore, getStandardGitignoreRules } from '../utils/gitignore.js';
import pc from 'picocolors';

export const gitignoreModule: SetupModule = {
  name: 'gitignore',
  description: 'Update .gitignore with essential rules',
  
  async install() {
    console.log(pc.blue('Updating .gitignore with essential rules...'));
    
    const rules = getStandardGitignoreRules();
    await updateGitignore(rules);
    
    console.log(pc.green('✓ .gitignore updated with:'));
    console.log(pc.gray('  → .env (but keeps .env.example)'));
    console.log(pc.gray('  → .nova/ (Nova editor)'));
    console.log(pc.gray('  → .vscode/ (VS Code settings)'));
  }
};