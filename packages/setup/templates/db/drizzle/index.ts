import { env } from '$env/dynamic/private'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const isDev = env.NODE_ENV !== 'production'

const connectionConfig = isDev
	? { url: env.DB_URL || './db/dev.db' }
	: { url: env.DB_URL!, authToken: env.DB_AUTH! }

const turso = createClient(connectionConfig)

if (isDev) {
	turso.execute('PRAGMA journal_mode = WAL;') // Better performance
	turso.execute('PRAGMA foreign_keys = ON;') // Enable foreign key constraints
	turso.execute('PRAGMA synchronous = NORMAL;') // Good balance of safety and speed
	turso.execute('PRAGMA busy_timeout = 5000;') // Timeout after 5s
}

export const db = drizzle({
	client: turso,
	schema: schema,
	logger: false
})
