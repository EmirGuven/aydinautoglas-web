import { deleteContactMessage } from '../../../services/contact-messages.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing message id' })
  await deleteContactMessage(id)
  return { success: true }
})
