import { defineConfig } from 'drizzle-kit';
import { env } from '$env/dynamic/private';

export default defineConfig({
  schema: './src/lib/server/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!
  }
});