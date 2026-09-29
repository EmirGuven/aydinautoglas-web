import { getDb } from "../utils/db"
import { mapServiceSummaryRow } from "../utils/services"
import { normalizeLocale, getTranslationMapBulk, applyTranslations } from "../utils/translations"

const TRANSLATABLE_FIELDS = ["hero_eyebrow", "hero_title", "hero_lead", "what_lead"]

export default defineEventHandler(async (event) => {
  const db = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  const rows = await db.prepare(`
    SELECT id, slug, hero_eyebrow, hero_title, hero_lead, what_lead, hero_bg_image
    FROM service_pages
    ORDER BY id ASC
  `).all() as any[]

  const bulk = await getTranslationMapBulk("service_page", rows.map(r => r.id), locale)
  return rows.map(r => mapServiceSummaryRow(applyTranslations(r, bulk[r.id] || {}, TRANSLATABLE_FIELDS)))
})
