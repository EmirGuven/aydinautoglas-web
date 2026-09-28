import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'de',
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json' },
    ],
    // No automatic redirect on browser language (bad for SEO — see prompt.md §14): a
    // dismissible suggestion banner (UiLanguageSuggestionBanner) offers the switch instead.
    detectBrowserLanguage: false,
  },

  runtimeConfig: {
    databaseUrl: '',
    adminJwtSecret: '',
    public: {},
  },

  nitro: {
    // Pre-compresses built static assets (_nuxt/* JS/CSS) with gzip/brotli at build time.
    // Dynamic SSR HTML responses are NOT compressed by this — that's expected to come from
    // the Caddy reverse proxy in front of the app in production (Phase 10's deployment
    // architecture), not from Nitro itself. See docs/decisions.md ADR-0013.
    compressPublicAssets: { gzip: true, brotli: true },
  },

  routeRules: {
    // Security headers (prompt.md §9). CSP's script-src needs 'unsafe-inline' because Nuxt
    // itself embeds the hydration payload as an inline <script> on every page and the
    // Google Analytics loader (UiAnalyticsLoader) injects a short inline init script — a
    // strict nonce-based CSP would need the `nuxt-security` module (or equivalent) wired
    // through Nitro's render pipeline, which is out of scope for this pass; revisit if that
    // module is added later. style-src needs 'unsafe-inline' for the same reason (Vue's
    // `:style` bindings and the SSR theme `<style>` tag in app/composables/useTheme.ts).
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "frame-src 'self' https://www.openstreetmap.org",
          "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
          "object-src 'none'",
          "base-uri 'self'",
        ].join('; '),
      },
    },
  },
})
