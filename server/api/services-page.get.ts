// GET /api/services-page — public
import { getDb } from "../utils/db"
import { normalizeLocale, getTranslationMap, applyTranslations } from "../utils/translations"

const TRANSLATABLE_FIELDS = ["hero_eyebrow", "hero_title", "hero_lead", "intro_title", "intro_lead", "cta_title", "cta_lead"]

export default defineEventHandler(async (event) => {
  const db  = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  let row = await db.prepare("SELECT * FROM services_page WHERE id = 1").get() as any
  if (!row) return {}
  const translations = await getTranslationMap("services_page", 1, locale)
  row = applyTranslations(row, translations, TRANSLATABLE_FIELDS)
  return {
    heroEyebrow: row.hero_eyebrow,
    heroTitle:   row.hero_title,
    heroLead:    row.hero_lead,
    heroBgImage: row.hero_bg_image || '',
    introTitle:  row.intro_title,
    introLead:   row.intro_lead,
    ctaTitle:    row.cta_title,
    ctaLead:     row.cta_lead,
    ctaBgImage:  row.cta_bg_image || '',
  }
})
