import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import { log } from '../utils/logger.js';

export const bitsUiModule: SetupModule = {
  name: 'bits-ui',
  description: 'Install bits-ui component library',
  dependencies: ['bits-ui'],
  
  async install() {
    log.moduleTitle('Installing bits-ui...');
    
    if (this.dependencies) {
      await installDependencies(this.dependencies);
    }
    
    log.success('bits-ui installed successfully');
  }
};