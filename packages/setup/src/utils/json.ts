import editJsonFile from 'edit-json-file';
import { pathExists } from 'fs-extra';
import { writeJsonFile } from './files.js';

export async function editJson(filePath: string, updates: Record<string, any>): Promise<void> {
  if (!(await pathExists(filePath))) {
    await writeJsonFile(filePath, updates);
    return;
  }
  
  const file = editJsonFile(filePath);
  
  for (const [key, value] of Object.entries(updates)) {
    file.set(key, value);
  }
  
  file.save();
}