import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { siteSettings } from '../db/schema'
import { siteSettingsSchemas, type SiteSettingsKey } from '../../shared/schemas/site-settings'

export async function getSetting<K extends SiteSettingsKey>(
  key: K,
): Promise<import('zod').infer<(typeof siteSettingsSchemas)[K]> | null> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1)
  if (!row) return null
  const schema = siteSettingsSchemas[key]
  return schema.parse(row.value) as never
}

export async function setSetting<K extends SiteSettingsKey>(
  key: K,
  value: import('zod').infer<(typeof siteSettingsSchemas)[K]>,
): Promise<void> {
  const schema = siteSettingsSchemas[key]
  const parsed = schema.parse(value)

  await db
    .insert(siteSettings)
    .values({ key, value: parsed })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed } })
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(siteSettings)
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}
