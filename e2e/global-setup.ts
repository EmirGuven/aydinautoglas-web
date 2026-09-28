import argon2 from 'argon2'
import { db, pool } from '../server/db/client'
import { users } from '../server/db/schema'

/** Fixed, idempotent test admin — never use these credentials outside a local/CI test database. */
export const E2E_ADMIN_EMAIL = 'e2e-admin@example.com'
export const E2E_ADMIN_PASSWORD = 'E2ETestPassword123!'

export default async function globalSetup() {
  const passwordHash = await argon2.hash(E2E_ADMIN_PASSWORD)
  await db
    .insert(users)
    .values({ email: E2E_ADMIN_EMAIL, name: 'E2E Admin', passwordHash, role: 'owner', locale: 'en' })
    .onConflictDoUpdate({ target: users.email, set: { passwordHash, role: 'owner', locale: 'en' } })
  await pool.end()
}
