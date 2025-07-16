import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_URL) throw new Error('DATABASE_URL is not set');
const isDev = process.env.PUBLIC_NODE_ENV === 'development'

export default defineConfig({
  schema: './src/lib/server/db/schema/index.ts',
  out: './db/migrations',
  dialect: isDev ? 'sqlite' : 'turso',
  dbCredentials: isDev ? {
    authToken: process.env.DB_AUTH,
    url: process.env.DB_URL
  } : {
    url: process.env.DB_URL
  },
  verbose: true,
  strict: true
});
