/**
 * Zod gotcha: `schema.partial().safeParse(body)` still fills in a field's `.default(...)`
 * when that key is simply absent from `body` — `.optional()` only means "undefined is a
 * valid value", and Zod treats a missing key as `undefined` reaching (and triggering) the
 * inner default. A real PATCH that only sends `{ slug: {...} }` against a schema where
 * `content`/`isFeatured` have defaults would silently come back with `parsed.data.content`
 * reset to `{}` and `isFeatured` reset to `false` — a live data-loss bug caught during Phase
 * 7 testing (see docs/decisions.md ADR-0010).
 *
 * Fix: after parsing, keep only the keys the caller actually sent, dropping anything Zod
 * injected as a default for a key that was never in the raw body.
 */
export function keysActuallySent<T extends Record<string, unknown>>(parsed: T, rawBody: unknown): Partial<T> {
  if (!rawBody || typeof rawBody !== 'object') return {}
  const sentKeys = new Set(Object.keys(rawBody))
  return Object.fromEntries(Object.entries(parsed).filter(([key]) => sentKeys.has(key))) as Partial<T>
}
