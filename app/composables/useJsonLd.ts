/**
 * Injects one or more JSON-LD <script type="application/ld+json"> blocks into <head>.
 *
 * unhead dedupes head tags by `key` *globally*, not per call-site — a plain `ld-json-0`
 * collided across independent useJsonLd() calls (e.g. the layout's Organization array and a
 * block's FAQPage both used index 0), silently dropping one. `useId()` gives each call-site
 * a unique instance id so keys never collide across components.
 */
export function useJsonLd(schema: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[] | null | undefined>) {
  const instanceId = useId()
  useHead(() => {
    const value = toValue(schema)
    if (!value) return {}
    const items = Array.isArray(value) ? value : [value]
    if (!items.length) return {}
    return {
      script: items.map((item, index) => ({
        key: `ld-json-${instanceId}-${index}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(item),
      })),
    }
  })
}
