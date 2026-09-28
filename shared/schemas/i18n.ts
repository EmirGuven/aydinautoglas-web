import { z } from 'zod'

/**
 * Language codes are data (see the `languages` table), not a hardcoded
 * union, so that adding a 4th language never requires a code change.
 * We only validate the *shape* here (BCP-47-ish, e.g. "de", "en", "pt-BR").
 */
export const languageCodeSchema = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code')

/**
 * A translatable plain-text field, stored as JSONB: { de: "...", en: "...", tr: "..." }.
 * At least one language must be present so content can never be fully empty.
 */
export function translatableText() {
  return z
    .record(languageCodeSchema, z.string())
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one language translation is required',
    })
}

/**
 * Like translatableText, but allows an empty string per-language (e.g. optional
 * subtitle) and does not require every language to be filled in.
 */
export function translatableOptionalText() {
  return z.record(languageCodeSchema, z.string()).default({})
}

/** Rich text (HTML from TipTap) per language. Sanitized at the service layer before save. */
export function translatableRichText() {
  return z.record(languageCodeSchema, z.string()).default({})
}

/**
 * A translatable URL slug. Each language gets its own slug so URLs read
 * naturally in every language (e.g. /leistungen/... vs /en/services/...).
 * Uniqueness per language is enforced in the service layer, not the DB,
 * since slugs live inside a JSONB column.
 */
export function translatableSlug() {
  return z.record(
    languageCodeSchema,
    z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  )
}

export type TranslatableText = z.infer<ReturnType<typeof translatableText>>
export type TranslatableSlug = z.infer<ReturnType<typeof translatableSlug>>
