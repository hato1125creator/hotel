import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function createClient() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, { schema })
}

export type DrizzleClient = ReturnType<typeof createClient>
