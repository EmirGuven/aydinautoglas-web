import { z } from 'zod'
import { translatableText } from './i18n'

export const menuLocationSchema = z.enum(['header', 'footer'])
export type MenuLocation = z.infer<typeof menuLocationSchema>

export const menuItemInputSchema = z.object({
  label: translatableText(),
  linkType: z.enum(['page', 'url']),
  linkValue: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
})

export const reorderMenuItemsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    parentId: z.string().uuid().nullable(),
    sortOrder: z.number().int(),
  }),
)

export type MenuItemInput = z.infer<typeof menuItemInputSchema>
