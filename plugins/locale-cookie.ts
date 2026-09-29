// Sayfa her yüklendiğinde (SSR ve client), kullanıcının daha önce seçtiği dili
// çerezden okuyup i18n'e uygular — böylece dil seçimi sayfalar arası kalıcı olur.
export default defineNuxtPlugin(async () => {
  const { locale, setLocale } = useNuxtApp().$i18n as any
  const cookie = useCookie<string>("app_locale", {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  if (cookie.value && cookie.value !== locale.value) {
    await setLocale(cookie.value)
  }
})
