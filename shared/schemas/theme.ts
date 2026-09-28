import { z } from 'zod'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a hex color')

export const themeSchema = z.object({
  colorPrimary: hexColor,
  colorSecondary: hexColor,
  colorAccent: hexColor,
  colorBackground: hexColor,
  colorText: hexColor,
  fontFamily: z.string().min(1),
  borderRadius: z.string().min(1),
  buttonStyle: z.enum(['solid', 'outline', 'pill']),
})

export type ThemeInput = z.infer<typeof themeSchema>
