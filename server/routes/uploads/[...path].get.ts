import { join, normalize, sep, extname } from 'node:path'
import { createReadStream, existsSync } from 'node:fs'

const UPLOADS_ROOT = normalize(join(process.cwd(), 'uploads'))

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

/** Serves uploaded files, guarding against path traversal: the resolved path must stay inside UPLOADS_ROOT. */
export default defineEventHandler((event) => {
  const requestedPath = getRouterParam(event, 'path') ?? ''
  const resolvedPath = normalize(join(UPLOADS_ROOT, requestedPath))

  if (!resolvedPath.startsWith(UPLOADS_ROOT + sep) || !existsSync(resolvedPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const contentType = CONTENT_TYPES[extname(resolvedPath).toLowerCase()]
  if (contentType) {
    setResponseHeader(event, 'Content-Type', contentType)
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return sendStream(event, createReadStream(resolvedPath))
})
