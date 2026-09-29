import de from "./locales/de.json"
import en from "./locales/en.json"
import tr from "./locales/tr.json"

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "de",
  fallbackLocale: "de",
  messages: { de, en, tr }
}))
