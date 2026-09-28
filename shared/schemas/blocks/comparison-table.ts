import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

export const comparisonRowSchema = z.object({
  label: translatableText(),
  cells: z.array(translatableOptionalText()).default([]),
})

export const comparisonTableBlockSchema = z.object({
  type: z.literal('comparison-table'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
    columns: z.array(translatableText()).default([]),
    rows: z.array(comparisonRowSchema).default([]),
  }),
})
