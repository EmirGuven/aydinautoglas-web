import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import DOMPurify from 'isomorphic-dompurify'
import sharp from 'sharp'
import { eq, ilike } from 'drizzle-orm'
import { db } from '../db/client'
import { blogPosts, media, partners, services, testimonials } from '../db/schema'
import { ALLOWED_MEDIA_MIME_TYPES, MAX_MEDIA_SIZE_BYTES } from '../../shared/schemas/media'

const UPLOADS_ROOT = join(process.cwd(), 'uploads')
const MEDIA_DIR = join(UPLOADS_ROOT, 'media')

export class InvalidUploadError extends Error {}

async function ensureUploadDirs() {
  await mkdir(MEDIA_DIR, { recursive: true })
}

function looksLikeSvg(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 1024).toString('utf8').trimStart().toLowerCase()
  return head.startsWith('<?xml') || head.startsWith('<svg')
}

export async function uploadMedia(buffer: Buffer, originalFileName: string) {
  if (buffer.byteLength > MAX_MEDIA_SIZE_BYTES) {
    throw new InvalidUploadError('File exceeds the 5MB limit')
  }

  await ensureUploadDirs()
  const id = randomUUID()

  if (looksLikeSvg(buffer)) {
    const raw = buffer.toString('utf8')
    // Reject anything that doesn't parse as an SVG root element before sanitizing,
    // so a renamed .svg containing arbitrary text/HTML doesn't slip through.
    if (!/<svg[\s>]/i.test(raw)) {
      throw new InvalidUploadError('File is not a valid image')
    }
    const sanitized = DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true, svgFilters: true } })
    const fileName = `${id}.svg`
    await writeFile(join(MEDIA_DIR, fileName), sanitized, 'utf8')

    const url = `/uploads/media/${fileName}`
    const [created] = await db
      .insert(media)
      .values({
        fileName,
        originalFileName,
        mimeType: 'image/svg+xml',
        sizeBytes: Buffer.byteLength(sanitized, 'utf8'),
        sizes: { original: url },
      })
      .returning()
    if (!created) throw new Error('Media insert did not return a row')
    return created
  }

  const detected = await fileTypeFromBuffer(buffer)
  if (!detected || !ALLOWED_MEDIA_MIME_TYPES.includes(detected.mime as (typeof ALLOWED_MEDIA_MIME_TYPES)[number])) {
    throw new InvalidUploadError('Unsupported or unrecognized image type')
  }

  const sizes: Record<string, string> = {}
  const variants: Array<[string, number]> = [
    ['thumb', 200],
    ['medium', 800],
    ['large', 1600],
  ]

  for (const [name, width] of variants) {
    const fileName = `${id}-${name}.webp`
    const outputBuffer = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp().toBuffer()
    await writeFile(join(MEDIA_DIR, fileName), outputBuffer)
    sizes[name] = `/uploads/media/${fileName}`
  }

  const [created] = await db
    .insert(media)
    .values({
      fileName: `${id}.webp`,
      originalFileName,
      mimeType: 'image/webp',
      sizeBytes: buffer.byteLength,
      sizes,
    })
    .returning()

  if (!created) throw new Error('Media insert did not return a row')
  return created
}

export async function listMedia(search?: string) {
  if (search?.trim()) {
    return db
      .select()
      .from(media)
      .where(ilike(media.originalFileName, `%${search.trim()}%`))
      .orderBy(media.createdAt)
  }
  return db.select().from(media).orderBy(media.createdAt)
}

export async function updateMediaAltText(id: string, altText: Record<string, string>) {
  const [updated] = await db.update(media).set({ altText }).where(eq(media.id, id)).returning()
  if (!updated) throw new Error('Media not found')
  return updated
}

/** Best-effort usage check across the tables that currently reference a media id directly. */
export async function isMediaInUse(id: string): Promise<boolean> {
  const [service] = await db.select({ id: services.id }).from(services).where(eq(services.iconOrMediaId, id)).limit(1)
  if (service) return true

  const [post] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.coverMediaId, id)).limit(1)
  if (post) return true

  const [testimonial] = await db
    .select({ id: testimonials.id })
    .from(testimonials)
    .where(eq(testimonials.authorPhotoMediaId, id))
    .limit(1)
  if (testimonial) return true

  const [partner] = await db.select({ id: partners.id }).from(partners).where(eq(partners.logoMediaId, id)).limit(1)
  if (partner) return true

  return false
}

export async function deleteMedia(id: string) {
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1)
  if (!row) throw new Error('Media not found')

  await Promise.all(
    Object.values(row.sizes).map(async (url) => {
      const fileName = url.split('/').pop()
      if (!fileName) return
      await unlink(join(MEDIA_DIR, fileName)).catch(() => undefined)
    }),
  )

  await db.delete(media).where(eq(media.id, id))
}
