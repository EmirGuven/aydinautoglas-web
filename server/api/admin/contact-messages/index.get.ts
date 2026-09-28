import { listContactMessages } from '../../../services/contact-messages.service'
import { requireSessionWithRole } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  requireSessionWithRole(event, 'editor')
  return listContactMessages()
})
