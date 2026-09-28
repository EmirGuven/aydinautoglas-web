import type { H3Event } from 'h3'

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Simple in-process fixed-window rate limiter, keyed by client IP + a caller-provided
 * scope (e.g. "login", "contact"). Good enough for a single-instance deployment; if the
 * app is ever scaled horizontally, replace the Map with a shared store (Redis/unstorage).
 */
const buckets = new Map<string, Bucket>()

export function checkRateLimit(event: H3Event, scope: string, limit: number, windowMs: number): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${scope}:${ip}`
  const now = Date.now()

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests, please try again later.' })
  }

  bucket.count += 1
}
