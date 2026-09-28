/**
 * Seeds the `translations` table with every UI-string key the app currently defines, using
 * the static `i18n/locales/*.json` files' own values as the initial DB row content. This is
 * NOT sector content (unlike `seed/templates/*`) — it runs unconditionally regardless of
 * which sector template is applied, same as `seedBaseLanguages()` in `run.ts`, so the admin
 * "Translations" screen (`/admin/translations`) has something to show and edit from the
 * start instead of being empty until someone learns the exact dot-path key to type in.
 *
 * Safe to re-run: `upsertTranslation` is an upsert, so re-seeding after a template switch
 * (which truncates *content* tables, not `translations`) never overwrites an admin's edits —
 * `onConflictDoUpdate` would, actually, if you re-ran this after an edit, so `run.ts` only
 * calls this once per fresh database, not on every seed invocation. Don't call this from
 * anywhere that might run against an already-customized database.
 */
import deTranslations from '../../../i18n/locales/de.json'
import enTranslations from '../../../i18n/locales/en.json'
import trTranslations from '../../../i18n/locales/tr.json'
import { upsertTranslation } from '../../services/translations.service'

type NestedMessages = { [key: string]: string | NestedMessages }

function flatten(messages: NestedMessages, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[fullKey] = value
    } else {
      Object.assign(result, flatten(value, fullKey))
    }
  }
  return result
}

export async function seedCoreTranslations(): Promise<void> {
  const de = flatten(deTranslations)
  const en = flatten(enTranslations)
  const tr = flatten(trTranslations)
  const allKeys = new Set([...Object.keys(de), ...Object.keys(en), ...Object.keys(tr)])

  for (const key of allKeys) {
    const group = key.split('.')[0] ?? 'general'
    const values: Record<string, string> = {}
    if (de[key]) values.de = de[key]
    if (en[key]) values.en = en[key]
    if (tr[key]) values.tr = tr[key]
    await upsertTranslation({ key, values, group })
  }
}
