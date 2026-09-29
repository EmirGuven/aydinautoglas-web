export function useAppLocale() {
  const { locale, locales, setLocale } = useI18n()
  const cookie = useCookie<string>("app_locale", {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  async function changeLocale(code: string) {
    await setLocale(code as any)
    cookie.value = code
  }

  return { locale, locales, changeLocale }
}
