import { InvalidUploadError, uploadMedia } from '../../../services/media.service'
import { requireSessionWithRole } from '../../../utils/session'
import { recordAuditLog } from '../../../services/audit-log.service'

export default defineEventHandler(async (event) => {
  const session = requireSessionWithRole(event, 'editor')

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file')
  if (!filePart || !filePart.data.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  try {
    setResponseStatus(event, 201)
    const created = await uploadMedia(filePart.data, filePart.filename ?? 'upload')
    await recordAuditLog({
      userId: session.sub,
      action: 'media.upload',
      entityType: 'media',
      entityId: created.id,
      metadata: { originalFileName: created.originalFileName },
    })
    return created
  } catch (error) {
    if (error instanceof InvalidUploadError) {
      throw createError({ statusCode: 422, statusMessage: error.message })
    }
    throw error
  }
})
