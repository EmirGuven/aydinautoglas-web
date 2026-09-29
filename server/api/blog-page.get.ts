// GET /api/blog-page — public
import { getDb } from "../utils/db"
import { normalizeLocale, getTranslationMap, applyTranslations } from "../utils/translations"

const TRANSLATABLE_FIELDS = ["hero_eyebrow", "hero_title", "hero_lead"]

export default defineEventHandler(async (event) => {
  const db  = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  let row = await db.prepare("SELECT * FROM blog_page WHERE id = 1").get() as any
  if (!row) return {}
  const translations = await getTranslationMap("blog_page", 1, locale)
  row = applyTranslations(row, translations, TRANSLATABLE_FIELDS)
  return {
    heroEyebrow: row.hero_eyebrow,
    heroTitle:   row.hero_title,
    heroLead:    row.hero_lead,
    heroBgImage: row.hero_bg_image || '',
  }
})
