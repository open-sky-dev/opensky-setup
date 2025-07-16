import { SetupModule } from '../types.js';
import { installDependencies } from '../utils/dependencies.js';
import { addFontImport } from '../utils/font-import.js';
import { log } from '../utils/logger.js';

export const interFontModule: SetupModule = {
  name: 'inter-font',
  description: 'Install Inter variable font and import in root layout',
  dependencies: ['@fontsource-variable/inter'],
  
  async install() {
    log.moduleTitle('Installing Inter font...');
    
    try {
      // Install the font package
      if (this.dependencies) {
        await installDependencies(this.dependencies);
      }
      
      // Add import to root layout
      await addFontImport('@fontsource-variable/inter');
      
      log.success('Inter font installed and imported successfully');
    } catch (error) {
      log.error('Inter font installation failed:');
      log.detail(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};