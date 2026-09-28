import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { translations } from '../db/schema'
import type { TranslationInput } from '../../shared/schemas/translations'

export async function listTranslations() {
  return db.select().from(translations).orderBy(translations.group, translations.key)
}

/** Public shape: { "contactForm.send": { de: "Senden", en: "Send", tr: "Gönder" }, ... } — merged into vue-i18n's message catalog client/server-side (see app/composables/useDbTranslations.ts), on top of the static i18n/locales/*.json fallback defaults. */
let cache: { value: Record<string, Record<string, string>>; expiresAt: number } | null = null
const TTL_MS = 60_000

export async function getTranslationsMap(): Promise<Record<string, Record<string, string>>> {
  if (cache && cache.expiresAt > Date.now()) return cache.value
  const rows = await listTranslations()
  const value = Object.fromEntries(rows.map((row) => [row.key, row.values]))
  cache = { value, expiresAt: Date.now() + TTL_MS }
  return value
}

export async function upsertTranslation(input: TranslationInput) {
  const [row] = await db
    .insert(translations)
    .values(input)
    .onConflictDoUpdate({ target: translations.key, set: { values: input.values, group: input.group } })
    .returning()
  if (!row) throw new Error('Translation upsert did not return a row')
  cache = null
  return row
}

export async function deleteTranslation(key: string) {
  await db.delete(translations).where(eq(translations.key, key))
  cache = null
}
