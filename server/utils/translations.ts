import { getDb } from "./db"

export const SUPPORTED_LOCALES = ["de", "en", "tr"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = "de"

export function normalizeLocale(value: unknown): SupportedLocale {
  const v = String(value || "").toLowerCase()
  return (SUPPORTED_LOCALES as readonly string[]).includes(v) ? (v as SupportedLocale) : DEFAULT_LOCALE
}

// Tek bir içerik kaydı için, verilen dildeki alan çevirilerini getirir.
// Almanca (varsayılan dil) için ana tablo değerleri kullanıldığından boş obje döner.
export async function getTranslationMap(contentType: string, contentId: number, locale: string): Promise<Record<string, string>> {
  if (locale === DEFAULT_LOCALE) return {}
  const db = await getDb()
  const rows = await db.prepare(
    "SELECT field, value FROM translations WHERE content_type = ? AND content_id = ? AND locale = ?"
  ).all(contentType, contentId, locale) as Array<{ field: string; value: string }>
  const map: Record<string, string> = {}
  for (const row of rows) map[row.field] = row.value
  return map
}

// Birden fazla kayıt için (ör. blog listesi) toplu çeviri haritası: { [content_id]: { [field]: value } }
export async function getTranslationMapBulk(contentType: string, contentIds: number[], locale: string): Promise<Record<number, Record<string, string>>> {
  if (locale === DEFAULT_LOCALE || !contentIds.length) return {}
  const db = await getDb()
  const placeholders = contentIds.map(() => "?").join(",")
  const rows = await db.prepare(
    `SELECT content_id, field, value FROM translations WHERE content_type = ? AND locale = ? AND content_id IN (${placeholders})`
  ).all(contentType, locale, ...contentIds) as Array<{ content_id: number; field: string; value: string }>
  const result: Record<number, Record<string, string>> = {}
  for (const row of rows) {
    if (!result[row.content_id]) result[row.content_id] = {}
    result[row.content_id][row.field] = row.value
  }
  return result
}

// base objesindeki alanları, çeviri haritasında karşılığı varsa (boş değilse) üzerine yazar.
export function applyTranslations<T extends Record<string, any>>(base: T, translations: Record<string, string>, fields: string[]): T {
  if (!translations || !Object.keys(translations).length) return base
  const result: T = { ...base }
  for (const field of fields) {
    const value = translations[field]
    if (value !== undefined && value !== "") {
      (result as any)[field] = value
    }
  }
  return result
}

// Admin: bir içerik kaydının tüm dillerdeki tüm alan çevirilerini getirir.
export async function getAllTranslations(contentType: string, contentId: number) {
  const db = await getDb()
  return await db.prepare(
    "SELECT locale, field, value FROM translations WHERE content_type = ? AND content_id = ? ORDER BY locale, field"
  ).all(contentType, contentId) as Array<{ locale: string; field: string; value: string }>
}

// Menü gibi JSON dizi alanlarındaki her öğenin "label" alanı için sözde alan adı üretir.
export function arrayLabelField(arrayField: string, index: number): string {
  return `${arrayField}.${index}.label`
}

// Bir JSON dizi metnini parse edip, çeviri haritasındaki label çevirilerini üzerine yazar.
export function applyArrayLabelTranslations(jsonText: string, translations: Record<string, string>, arrayField: string): string {
  let items: any[]
  try {
    items = JSON.parse(jsonText)
  } catch {
    return jsonText
  }
  if (!Array.isArray(items)) return jsonText
  const translated = items.map((item, i) => {
    const key = arrayLabelField(arrayField, i)
    if (item && typeof item === "object" && translations[key]) {
      return { ...item, label: translations[key] }
    }
    return item
  })
  return JSON.stringify(translated)
}

// Admin: bir alanın çevirisini kaydeder/günceller.
export async function saveTranslation(contentType: string, contentId: number, locale: string, field: string, value: string) {
  if (locale === DEFAULT_LOCALE) return
  const db = await getDb()
  await db.prepare(`
    INSERT INTO translations (content_type, content_id, locale, field, value)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (content_type, content_id, locale, field) DO UPDATE SET value = EXCLUDED.value
  `).run(contentType, contentId, locale, field, value)
}
