import { promises as fs } from 'fs';
import { pathExists, ensureDir } from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

export async function createDirectories(dirs: string[]): Promise<string[]> {
  const created: string[] = [];
  
  for (const dir of dirs) {
    if (!(await pathExists(dir))) {
      await ensureDir(dir);
      created.push(dir);
      console.log(pc.green(`✓ Created directory: ${dir}`));
    }
  }
  
  return created;
}

export async function moveHookFiles(): Promise<string[]> {
  const moved: string[] = [];
  const hooksDir = 'src/hooks';
  
  // Ensure hooks directory exists
  await ensureDir(hooksDir);
  
  // Find hook files in src/
  const srcFiles = await fs.readdir('src', { withFileTypes: true });
  const hookFiles = srcFiles
    .filter(file => file.isFile() && file.name.match(/^hooks?\.(ts|js)$/))
    .map(file => file.name);
  
  for (const fileName of hookFiles) {
    const srcPath = path.join('src', fileName);
    const destPath = path.join(hooksDir, fileName);
    
    if (!(await pathExists(destPath))) {
      await fs.rename(srcPath, destPath);
      moved.push(`${srcPath} → ${destPath}`);
      console.log(pc.green(`✓ Moved: ${srcPath} → ${destPath}`));
    }
  }
  
  return moved;
}

export async function createDefaultHooks(): Promise<string[]> {
  const created: string[] = [];
  const hooksDir = 'src/hooks';
  
  await ensureDir(hooksDir);
  
  const hookFiles = [
    {
      name: 'hooks.server.ts',
      content: `import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
\treturn resolve(event);
};
`
    },
    {
      name: 'hooks.client.ts', 
      content: `import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
\tconsole.error('Client error:', error);
\treturn {
\t\tmessage: 'Something went wrong'
\t};
};
`
    },
    {
      name: 'hooks.ts',
      content: `// Universal hooks - runs on both client and server
export {};
`
    }
  ];
  
  for (const hookFile of hookFiles) {
    const filePath = path.join(hooksDir, hookFile.name);
    
    if (!(await pathExists(filePath))) {
      await fs.writeFile(filePath, hookFile.content);
      created.push(hookFile.name);
      console.log(pc.green(`✓ Created: ${filePath}`));
    }
  }
  
  return created;
}