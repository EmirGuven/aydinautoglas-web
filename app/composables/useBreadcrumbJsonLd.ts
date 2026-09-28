interface BreadcrumbItem {
  name: string
  path: string
}

/** BreadcrumbList JSON-LD (prompt.md §15.2) for a detail page. `items` excludes the domain — absolute URLs are built from the current request origin. */
export function useBreadcrumbJsonLd(items: MaybeRefOrGetter<BreadcrumbItem[] | undefined>) {
  const requestUrl = useRequestURL()
  const schema = computed(() => {
    const list = toValue(items)
    if (!list?.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: new URL(item.path, requestUrl.origin).toString(),
      })),
    }
  })
  useJsonLd(schema)
}
