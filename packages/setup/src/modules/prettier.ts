import { type SetupModule } from '../types.js';
import { editJson } from '../utils/json.js';
import { log } from '../utils/logger.js';

export const prettierModule: SetupModule = {
  name: 'prettier',
  description: 'Configure Prettier with custom settings',
  
  async install() {
    log.moduleTitle('Setting up Prettier configuration...');
    
    // Ensure these rules are set (some may be defaults but we want to guarantee them)
    const prettierRules = {
      useTabs: true,      // Should be default, but ensure it's set
      singleQuote: true,  // Should be default, but ensure it's set
      semi: false         // Not default, needs to be added
    };
    
    await editJson('.prettierrc', prettierRules);
    
    log.success('Prettier configuration updated');
  }
};
