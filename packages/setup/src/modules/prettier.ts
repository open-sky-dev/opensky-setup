import { SetupModule } from '../types.js';
import { editJson } from '../utils/json.js';
import pc from 'picocolors';

export const prettierModule: SetupModule = {
  name: 'prettier',
  description: 'Configure Prettier with custom settings',
  
  async install() {
    console.log(pc.blue('Setting up Prettier configuration...'));
    
    await editJson('.prettierrc', {
      semi: false
    });
    
    console.log(pc.green('✓ Prettier configuration updated'));
  }
};