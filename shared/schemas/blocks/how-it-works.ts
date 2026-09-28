import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const howItWorksStepSchema = z.object({
  title: translatableText(),
  description: translatableOptionalText(),
  icon: z.string().optional(),
})

export const howItWorksBlockSchema = z.object({
  type: z.literal('how-it-works'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    steps: z.array(howItWorksStepSchema).default([]),
  }),
})
