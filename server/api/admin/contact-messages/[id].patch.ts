import { z } from 'zod'
import { markContactMessageRead } from '../../../services/contact-messages.service'
import { requireSessionWithRole } from '../../../utils/session'

const bodySchema = z.object({ isRead: z.boolean() })

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing message id' })
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: parsed.error.flatten() })
  }
  return markContactMessageRead(id, parsed.data.isRead)
})
