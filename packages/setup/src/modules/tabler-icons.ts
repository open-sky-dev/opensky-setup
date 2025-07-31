import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import { log } from '../utils/logger.js';

export const tablerIconsModule: SetupModule = {
  name: 'tabler-icons',
  description: 'Install @tabler/icons-svelte icon library',
  dependencies: ['@tabler/icons-svelte'],
  
  async install() {
    log.moduleTitle('Installing @tabler/icons-svelte...');
    
    if (this.dependencies) {
      await installDependencies(this.dependencies);
    }
    
    log.success('@tabler/icons-svelte installed successfully');
  }
};