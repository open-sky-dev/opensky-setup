import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

const sql = neon(env.DB_URL!);
export const db = drizzle(sql);

// Export all schema tables here
export * from './schema/index.js';
