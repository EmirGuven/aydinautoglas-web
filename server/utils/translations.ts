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

// JSON dizi alanlarındaki tek tek öğeler için sözde alan adı üretir.
// Nesne dizileri: "services_items.0.title" — düz metin dizileri: "bio_paragraphs.0"
export function jsonArrayField(arrayField: string, index: number, prop?: string): string {
  return prop ? `${arrayField}.${index}.${prop}` : `${arrayField}.${index}`
}

// Bir JSON dizi metnini parse edip, çeviri haritasındaki öğe çevirilerini üzerine yazar.
export function applyJsonArrayTranslations(
  jsonText: string,
  translations: Record<string, string>,
  arrayField: string,
  props: string[],
): string {
  let items: any[]
  try {
    items = JSON.parse(jsonText || "[]")
  } catch {
    return jsonText
  }
  if (!Array.isArray(items)) return jsonText

  const translated = items.map((item, i) => {
    if (typeof item === "string") {
      return translations[jsonArrayField(arrayField, i)] || item
    }
    if (item && typeof item === "object") {
      const copy: any = { ...item }
      for (const prop of props) {
        const value = translations[jsonArrayField(arrayField, i, prop)]
        if (value) copy[prop] = value
      }
      return copy
    }
    return item
  })
  return JSON.stringify(translated)
}

// Bir kaydın tüm yapılandırılmış JSON dizi alanlarına çevirileri uygular.
export function applyAllJsonArrayTranslations<T extends Record<string, any>>(
  row: T,
  translations: Record<string, string>,
  arrayConfig: Record<string, string[]>,
): T {
  if (!translations || !Object.keys(translations).length) return row
  const result: any = { ...row }
  for (const [field, props] of Object.entries(arrayConfig)) {
    if (typeof result[field] === "string") {
      result[field] = applyJsonArrayTranslations(result[field], translations, field, props)
    }
  }
  return result
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
