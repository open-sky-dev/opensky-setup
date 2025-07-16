import { promises as fs } from 'fs';
import { pathExists } from 'fs-extra';
import pc from 'picocolors';

export interface GitignoreRule {
  pattern: string;
  comment?: string;
}

export async function updateGitignore(rules: GitignoreRule[]): Promise<void> {
  const gitignorePath = '.gitignore';
  let content = '';
  
  // Read existing .gitignore if it exists
  if (await pathExists(gitignorePath)) {
    content = await fs.readFile(gitignorePath, 'utf-8');
  }
  
  const existingLines = content.split('\n');
  const newRules: string[] = [];
  
  for (const rule of rules) {
    const { pattern, comment } = rule;
    
    // Check if this rule already exists (exact match or pattern match)
    const exists = existingLines.some(line => {
      const trimmed = line.trim();
      return trimmed === pattern || 
             (pattern.startsWith('.env') && trimmed.includes('.env') && !trimmed.includes('.env.example'));
    });
    
    if (!exists) {
      if (comment) {
        newRules.push(`# ${comment}`);
      }
      newRules.push(pattern);
    }
  }
  
  if (newRules.length > 0) {
    // Add a section header if we're adding new rules
    const newSection = [
      '',
      '# Added by @opensky/setup',
      ...newRules
    ];
    
    const updatedContent = content + newSection.join('\n') + '\n';
    await fs.writeFile(gitignorePath, updatedContent);
    
    console.log(pc.green(`✓ Added ${newRules.filter(r => !r.startsWith('#')).length} new rules to .gitignore`));
  } else {
    console.log(pc.gray('→ All gitignore rules already present'));
  }
}

export function getStandardGitignoreRules(): GitignoreRule[] {
  return [
    {
      pattern: '.env',
      comment: 'Environment files (but keep .env.example)'
    },
    {
      pattern: '.env.*'
    },
    {
      pattern: '!.env.example'
    },
    {
      pattern: '.nova/',
      comment: 'Nova editor files'
    },
    {
      pattern: '.vscode/',
      comment: 'VS Code settings'
    }
  ];
}