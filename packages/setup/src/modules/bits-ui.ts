import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import pc from 'picocolors';

export const bitsUiModule: SetupModule = {
  name: 'bits-ui',
  description: 'Install bits-ui component library',
  dependencies: ['bits-ui'],
  
  async install() {
    console.log(pc.blue('Installing bits-ui...'));
    
    if (this.dependencies) {
      await installDependencies(this.dependencies);
    }
    
    console.log(pc.green('✓ bits-ui installed successfully'));
  }
};