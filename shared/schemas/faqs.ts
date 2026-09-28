import { z } from 'zod'
import { translatableText } from './i18n'

export const faqCategoryInputSchema = z.object({
  name: translatableText(),
})

export const faqInputSchema = z.object({
  categoryId: z.string().uuid().optional(),
  question: translatableText(),
  answer: translatableText(),
})

export type FaqCategoryInput = z.infer<typeof faqCategoryInputSchema>
export type FaqInput = z.infer<typeof faqInputSchema>
