// GET /api/about — public
import { getDb } from "../utils/db"
import { aboutCtaDefaults, resolvePageCtaButtons } from "../../utils/page-cta"
import { normalizeLocale, getTranslationMap, applyTranslations, applyAllJsonArrayTranslations } from "../utils/translations"
import { TRANSLATABLE_CONTENT } from "../utils/translatable-content"

const TRANSLATABLE_FIELDS = [
  "hero_eyebrow", "hero_title", "hero_lead", "bio_title", "bio_badge_label",
  "approach_title", "approach_lead", "cta_title", "cta_text",
  "cta_primary_label", "cta_secondary_label",
]

export default defineEventHandler(async (event) => {
  const db  = await getDb()
  const locale = normalizeLocale(getQuery(event).locale)
  let row = await db.prepare("SELECT * FROM about_page WHERE id = 1").get() as any
  if (!row) return {}
  const translations = await getTranslationMap("about_page", 1, locale)
  row = applyTranslations(row, translations, TRANSLATABLE_FIELDS)
  row = applyAllJsonArrayTranslations(row, translations, TRANSLATABLE_CONTENT.about_page.jsonArrays || {})

  const parse = (field: string) => {
    try { return JSON.parse(field) } catch { return [] }
  }

  const ctaButtons = resolvePageCtaButtons({
    primaryLabel: row.cta_primary_label || "",
    primaryUrl: row.cta_primary_url || "",
    secondaryLabel: row.cta_secondary_label || "",
    secondaryUrl: row.cta_secondary_url || "",
  }, aboutCtaDefaults)

  return {
    heroEyebrow:    row.hero_eyebrow,
    heroTitle:      row.hero_title,
    heroLead:       row.hero_lead,
    heroBgImage:    row.hero_bg_image || '',
    photoUrl:       row.photo_url,
    bioTitle:       row.bio_title,
    bioParagraphs:  parse(row.bio_paragraphs),
    bioBadgeValue:  row.bio_badge_value || '',
    bioBadgeLabel:  row.bio_badge_label || '',
    specialties:    parse(row.specialties),
    heroBadges:     parse(row.hero_badges),
    timeline:       parse(row.timeline),
    approachTitle:  row.approach_title,
    approachLead:   row.approach_lead,
    approachValues: parse(row.approach_values),
    ctaTitle:       row.cta_title,
    ctaText:        row.cta_text,
    ctaBgImage:     row.cta_bg_image || "",
    ctaPrimaryLabel: ctaButtons.primaryLabel,
    ctaPrimaryUrl: ctaButtons.primaryUrl,
    ctaSecondaryLabel: ctaButtons.secondaryLabel,
    ctaSecondaryUrl: ctaButtons.secondaryUrl,
  }
})
