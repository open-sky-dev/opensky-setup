#!/usr/bin/env node

// Simple test script to verify the CLI works
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = join(__dirname, 'src', 'cli.ts');

console.log('Testing CLI...');
const child = spawn('node', [cliPath], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`CLI exited with code ${code}`);
});