import { sql } from 'drizzle-orm'
import { db } from '../db/client'

export default defineEventHandler(async (event) => {
  try {
    await db.execute(sql`select 1`)
    return { status: 'ok', db: 'ok' }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'error', db: 'unreachable' }
  }
})
