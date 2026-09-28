import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** Content is pulled live from the `blog_posts` table (published posts only). */
export const blogPreviewBlockSchema = z.object({
  type: z.literal('blog-preview'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    limit: z.number().int().min(1).max(12).default(3),
  }),
})
