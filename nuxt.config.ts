import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",
  devtools: { enabled: false },
  ssr: true,
  modules: ["@nuxtjs/seo", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  seo: {
    // favicon admin panelden dinamik yönetiliyor (app.vue) — otomatik statik favicon taraması kapalı
    metaDataFiles: false
  },
  i18n: {
    strategy: "no_prefix",
    defaultLocale: "de",
    locales: [
      { code: "de", language: "de-DE", name: "Deutsch" },
      { code: "en", language: "en-US", name: "English" },
      { code: "tr", language: "tr-TR", name: "Türkçe" }
    ],
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: false
  },
  runtimeConfig: {
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY || "",
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://www.aydinautoglas.de",
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ""
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "de"
      },
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "%s | Aydin Autoglas"
    }
  },
  // @ts-ignore - @nuxtjs/seo module augments this type at runtime
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://www.aydinautoglas.de",
    name: "Aydin Autoglas",
    description: "Aydin Autoglas — Steinschlagreparatur, Frontscheibenaustausch, Seiten- und Heckscheiben sowie mobiler Service in Hildrizhausen und dem Landkreis Böblingen.",
    defaultLocale: "de"
  },
  robots: {
    disallow: process.env.NODE_ENV === "production" ? [] : ["/"],
    sitemap: "/sitemap.xml"
  },
  sitemap: {
    autoLastmod: true,
    sources: ["/api/sitemap-urls"]
  },
  routeRules: {
    "/": { ssr: true },
    "/ueber-uns": { ssr: true },
    "/kontakt": { ssr: true },
    "/haeufige-fragen": { ssr: true },
    "/datenschutz": { ssr: true },
    "/agb": { ssr: true },
    "/impressum": { ssr: true },
    "/admin/**": { ssr: false }
  },
  nitro: {
    prerender: {
      routes: ["/robots.txt"]
    }
  }
})
