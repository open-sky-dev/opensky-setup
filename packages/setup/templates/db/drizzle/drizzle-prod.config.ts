import { defineConfig } from 'drizzle-kit'

if (!process.env.DB_URL) throw new Error('DB_URL is not set')

export default defineConfig({
  schema: './src/lib/server/db/schema/index.ts',
  out: './db/migrations',
  dialect: 'turso',
  dbCredentials: {
    authToken: process.env.DB_AUTH,
    url: process.env.DB_URL
  },
  verbose: true,
  strict: true
})
