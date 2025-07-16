import { promises as fs } from 'fs';
import path from 'path';
import { pathExists } from 'fs-extra';

export async function ensureFile(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  if (!(await pathExists(filePath))) {
    await fs.writeFile(filePath, '');
  }
}

export async function writeJsonFile(filePath: string, content: object): Promise<void> {
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(content, null, 2) + '\n');
}