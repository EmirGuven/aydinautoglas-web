import { z } from 'zod'
import { translatableText } from '../i18n'

export const statItemSchema = z.object({
  label: translatableText(),
  value: z.number(),
  suffix: z.string().optional(),
})

export const statsCounterBlockSchema = z.object({
  type: z.literal('stats-counter'),
  data: z.object({
    heading: translatableText().optional(),
    stats: z.array(statItemSchema).default([]),
  }),
})
