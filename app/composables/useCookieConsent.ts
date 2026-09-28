export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing'

interface ConsentRecord {
  categories: CookieCategory[]
  decidedAt: string
}

/**
 * DSGVO cookie consent (prompt.md §9/§15): a signed-ish record (category list + timestamp)
 * stored in a first-party cookie so it round-trips through SSR. `necessary` is implicit and
 * never needs to appear in the stored list. No consent cookie yet = no decision made (banner
 * should show); an empty `categories` array after a decision means "necessary only".
 */
export function useCookieConsent() {
  const consent = useCookie<ConsentRecord | null>('cookie_consent', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  function hasDecided() {
    return consent.value !== null
  }

  function hasConsent(category: CookieCategory) {
    if (category === 'necessary') return true
    return consent.value?.categories.includes(category) ?? false
  }

  function setConsent(categories: CookieCategory[]) {
    consent.value = { categories: categories.filter((c) => c !== 'necessary'), decidedAt: new Date().toISOString() }
  }

  return { consent, hasDecided, hasConsent, setConsent }
}
