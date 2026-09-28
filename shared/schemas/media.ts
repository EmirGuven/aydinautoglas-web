import { z } from 'zod'
import { translatableOptionalText } from './i18n'

export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const

export const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export const updateMediaSchema = z.object({
  altText: translatableOptionalText(),
})
