import { z } from 'zod'
import { languageCodeSchema, translatableText } from './i18n'
import { localizedPageSeoSchema } from './seo'

/** Like translatableSlug, but an empty string is allowed to mark the locale's homepage. */
export const pageSlugSchema = z.record(
  languageCodeSchema,
  z
    .string()
    .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Slug must be lowercase kebab-case, or empty for the homepage'),
)

export const pageSeoSchema = localizedPageSeoSchema

export const createPageSchema = z.object({
  slug: pageSlugSchema,
  title: translatableText(),
  seo: pageSeoSchema.default({}),
})

export const updatePageSchema = z.object({
  slug: pageSlugSchema.optional(),
  title: translatableText().optional(),
  seo: pageSeoSchema.optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
