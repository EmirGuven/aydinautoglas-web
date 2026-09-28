import { z } from 'zod'
import { translatableOptionalText, translatableRichText, translatableSlug, translatableText } from './i18n'
import { localizedSeoSchema } from './seo'

export const blogCategoryInputSchema = z.object({
  slug: translatableSlug(),
  name: translatableText(),
})

export const blogPostInputSchema = z.object({
  categoryId: z.string().uuid().optional(),
  slug: translatableSlug(),
  title: translatableText(),
  excerpt: translatableOptionalText(),
  content: translatableRichText(),
  coverMediaId: z.string().uuid().optional(),
  publishedByLocale: z.record(z.string(), z.boolean()).default({}),
  authorName: z.string().optional(),
  authorRole: translatableOptionalText(),
  authorPhotoMediaId: z.string().uuid().optional(),
  shortAnswer: translatableOptionalText(),
  seo: localizedSeoSchema.default({}),
})

export type BlogCategoryInput = z.infer<typeof blogCategoryInputSchema>
export type BlogPostInput = z.infer<typeof blogPostInputSchema>
