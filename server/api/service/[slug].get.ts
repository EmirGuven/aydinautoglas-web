// GET /api/service/[slug] — public
import { getDb } from "../../utils/db"
import { mapServiceRow } from "../../utils/services"
import { normalizeLocale, getTranslationMap, applyTranslations } from "../../utils/translations"

const TRANSLATABLE_FIELDS = [
  "hero_eyebrow", "hero_title", "hero_lead", "what_title", "what_lead",
  "issues_title", "issues_lead", "process_title", "process_lead",
  "cta_title", "cta_lead", "cta_primary_label", "cta_secondary_label",
]

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const locale = normalizeLocale(getQuery(event).locale)
  const db   = await getDb()
  const row  = await db.prepare("SELECT * FROM service_pages WHERE slug = ?").get(slug) as any
  if (!row) throw createError({ statusCode: 404, message: "Seite nicht gefunden." })
  const translations = await getTranslationMap("service_page", row.id, locale)
  return mapServiceRow(applyTranslations(row, translations, TRANSLATABLE_FIELDS))
})
