import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const whyUsFeatureSchema = z.object({
  title: translatableText(),
  description: translatableOptionalText(),
  icon: z.string().optional(),
})

export const whyUsBlockSchema = z.object({
  type: z.literal('why-us'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    features: z.array(whyUsFeatureSchema).default([]),
  }),
})
