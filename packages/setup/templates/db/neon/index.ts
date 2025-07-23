import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import * as schema from './schema/index';

const sql = neon(env.DB_URL!);
export const db = drizzle(sql, { schema });

// Export all schema tables here
export * from './schema/index';
