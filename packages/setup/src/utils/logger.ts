import pc from 'picocolors';

export const log = {
  // Module-level logging
  moduleTitle: (message: string) => {
    console.log(pc.blue(message));
  },

  // Primary actions (main results)
  success: (message: string) => {
    console.log(pc.green(`  ✓ ${message}`));
  },

  error: (message: string) => {
    console.error(pc.red(`  ✗ ${message}`));
  },

  info: (message: string) => {
    console.log(pc.gray(`  → ${message}`));
  },

  // Sub-actions (details under primary actions)  
  detail: (message: string) => {
    console.log(pc.gray(`    → ${message}`));
  },

  // Running commands or processes
  command: (message: string) => {
    console.log(pc.gray(`  → ${message}`));
  },

  // Warnings
  warning: (message: string) => {
    console.log(pc.yellow(`  ⚠ ${message}`));
  },

  // Raw console access for special cases
  raw: (message: string, color?: (text: string) => string) => {
    console.log(color ? color(message) : message);
  }
};

// Convenience functions for common patterns
export const logGroup = {
  // For summarizing module results
  summary: (title: string, items: string[]) => {
    log.success(title);
    items.forEach(item => log.detail(item));
  },

  // For listing multiple related items
  list: (title: string, items: string[]) => {
    log.info(title);
    items.forEach(item => log.detail(item));
  }
};