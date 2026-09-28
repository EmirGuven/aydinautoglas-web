import { z } from 'zod'
import { translatableOptionalText, translatableText } from '../i18n'

/** The actual questions/options/rules come from the damage_wizard_* tables (configured in Phase 6). */
export const damageWizardBlockSchema = z.object({
  type: z.literal('damage-wizard'),
  data: z.object({
    heading: translatableText(),
    subheading: translatableOptionalText(),
  }),
})
