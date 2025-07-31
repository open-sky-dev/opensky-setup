import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import { log } from '../utils/logger.js';

export const styleUtilsModule: SetupModule = {
  name: 'style-utils',
  description: 'Install @opensky/style utility package',
  dependencies: ['@opensky/style'],
  
  async install() {
    log.moduleTitle('Installing @opensky/style...');
    
    if (this.dependencies) {
      await installDependencies(this.dependencies);
    }
    
    log.success('@opensky/style installed successfully');
  }
};