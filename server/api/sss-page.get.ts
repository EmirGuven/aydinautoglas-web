// GET /api/sss-page — public
import { getDb } from "../utils/db"
import { faqCtaDefaults, resolvePageCtaButtons } from "../../utils/page-cta"
import { normalizeLocale, getTranslationMap, applyTranslations } from "../utils/translations"

const TRANSLATABLE_FIELDS = ["hero_eyebrow", "hero_title", "hero_lead", "cta_title", "cta_lead", "cta_primary_label", "cta_secondary_label"]

export default defineEventHandler(async (event) => {
  const db  = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  let row = await db.prepare("SELECT * FROM sss_page WHERE id = 1").get() as any
  if (!row) return {}
  const translations = await getTranslationMap("sss_page", 1, locale)
  row = applyTranslations(row, translations, TRANSLATABLE_FIELDS)

  const ctaButtons = resolvePageCtaButtons({
    primaryLabel: row.cta_primary_label || '',
    primaryUrl: row.cta_primary_url || '',
    secondaryLabel: row.cta_secondary_label || '',
    secondaryUrl: row.cta_secondary_url || '',
  }, faqCtaDefaults)
  return {
    heroEyebrow: row.hero_eyebrow,
    heroTitle:   row.hero_title,
    heroLead:    row.hero_lead,
    heroBgImage: row.hero_bg_image || '',
    ctaTitle:    row.cta_title,
    ctaLead:     row.cta_lead,
    ctaBgImage:  row.cta_bg_image || '',
    ctaPrimaryLabel: ctaButtons.primaryLabel,
    ctaPrimaryUrl: ctaButtons.primaryUrl,
    ctaSecondaryLabel: ctaButtons.secondaryLabel,
    ctaSecondaryUrl: ctaButtons.secondaryUrl,
  }
})
