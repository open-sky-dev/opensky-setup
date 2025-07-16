import { execa } from 'execa';
import pc from 'picocolors';

export async function installDependencies(deps: string[], isDev = false): Promise<void> {
  if (deps.length === 0) return;
  
  const flag = isDev ? '--dev' : '';
  const command = `bun add ${flag} ${deps.join(' ')}`;
  
  console.log(pc.gray(`Running: ${command}`));
  
  try {
    await execa('bun', ['add', ...(isDev ? ['--dev'] : []), ...deps], {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(pc.red(`Failed to install dependencies: ${deps.join(', ')}`));
    throw error;
  }
}