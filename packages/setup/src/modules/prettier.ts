import { SetupModule } from '../types.js';
import { editJson } from '../utils/json.js';
import { log } from '../utils/logger.js';

export const prettierModule: SetupModule = {
  name: 'prettier',
  description: 'Configure Prettier with custom settings',
  
  async install() {
    log.moduleTitle('Setting up Prettier configuration...');
    
    await editJson('.prettierrc', {
      semi: false
    });
    
    log.success('Prettier configuration updated');
  }
};