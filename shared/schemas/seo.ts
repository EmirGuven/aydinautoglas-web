import { z } from 'zod'

/**
 * Per-locale SEO metadata shared by services, blog posts, and (extended below) pages —
 * see prompt.md §15.4/§15.5. `shortAnswer` is the 2-3 sentence direct-answer summary shown
 * at the top of a page for AI/GEO crawlers; `focusKeyword` only drives the admin SEO
 * checklist and is never rendered publicly.
 */
export const seoFieldsSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  noindex: z.boolean().optional(),
  focusKeyword: z.string().optional(),
  shortAnswer: z.string().optional(),
})

export const pageSeoFieldsSchema = seoFieldsSchema.extend({
  ogImageMediaId: z.string().uuid().optional(),
})

export const localizedSeoSchema = z.record(z.string(), seoFieldsSchema)
export const localizedPageSeoSchema = z.record(z.string(), pageSeoFieldsSchema)

export type SeoFields = z.infer<typeof seoFieldsSchema>
export type PageSeoFields = z.infer<typeof pageSeoFieldsSchema>
