import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import { log } from '../utils/logger.js';

export const styleUtilsModule: SetupModule = {
  name: 'style-utils',
  description: 'Install @opensky/styles utility package',
  dependencies: ['@opensky/styles'],
  
  async install() {
    log.moduleTitle('Installing @opensky/styles...');
    
    if (this.dependencies) {
      await installDependencies(this.dependencies);
    }
    
    log.success('@opensky/styles installed successfully');
  }
};