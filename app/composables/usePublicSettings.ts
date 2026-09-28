interface PublicSettings {
  general: { companyName: string; activeSectorTemplate: string } | null
  logo: { logoMediaId?: string; faviconMediaId?: string } | null
  contact: { email?: string; phone?: string; whatsapp?: string; address?: Record<string, string> } | null
  social: { facebook?: string; instagram?: string; linkedin?: string } | null
  cookieBanner: { text?: Record<string, string>; categories: string[] } | null
  analytics: { googleAnalyticsId?: string; turnstileEnabled: boolean } | null
}

export function usePublicSettings() {
  return useFetch<PublicSettings>('/api/settings/public', { key: 'public-settings' })
}
