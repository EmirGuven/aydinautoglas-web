import { z } from 'zod'
import { translatableOptionalText } from './i18n'

/**
 * site_settings is stored as key-value JSONB rows (see server/db/schema/site-settings.ts)
 * so new settings can be introduced without a migration. Each known key gets a schema here
 * for validation; unknown keys are rejected at the service layer.
 */
export const siteSettingsSchemas = {
  general: z.object({
    companyName: z.string().min(1),
    activeSectorTemplate: z.string().min(1),
  }),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: translatableOptionalText(),
  }),
  social: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }),
  seoDefaults: z.object({
    titleSuffix: translatableOptionalText(),
    defaultDescription: translatableOptionalText(),
    ogImageMediaId: z.string().uuid().optional(),
    /** Serves a clean Markdown version of pages/services/blog posts via `Accept: text/markdown` (prompt.md §15.4). */
    markdownExportEnabled: z.boolean().default(true),
  }),
  cookieBanner: z.object({
    text: translatableOptionalText(),
    categories: z.array(z.enum(['necessary', 'functional', 'analytics', 'marketing'])),
  }),
  smtp: z.object({
    host: z.string().optional(),
    port: z.number().int().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    from: z.string().optional(),
  }),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
    turnstileEnabled: z.boolean().default(false),
  }),
  logo: z.object({
    logoMediaId: z.string().uuid().optional(),
    faviconMediaId: z.string().uuid().optional(),
  }),
  emailTemplates: z.object({
    appointmentAdminNotification: z.object({ subject: translatableOptionalText(), body: translatableOptionalText() }),
    appointmentCustomerConfirmation: z.object({ subject: translatableOptionalText(), body: translatableOptionalText() }),
    contactAdminNotification: z.object({ subject: translatableOptionalText(), body: translatableOptionalText() }),
    contactCustomerConfirmation: z.object({ subject: translatableOptionalText(), body: translatableOptionalText() }),
  }),
  forms: z.object({
    honeypotEnabled: z.boolean().default(true),
    turnstileEnabledOnForms: z.boolean().default(false),
  }),
  /** Single-slot safety-net snapshot written by applySectorTemplate() before it clears content tables — not a general-purpose backup system (see docs/deployment.md, Phase 10). */
  lastTemplateBackup: z.object({
    takenAt: z.string(),
    tables: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
  }),
  indexNow: z.object({
    enabled: z.boolean().default(false),
    /** Auto-generated on first enable (server/services/indexnow.service.ts); also served verbatim at /{key}.txt. */
    key: z.string().default(''),
  }),
  robots: z.object({
    /**
     * Freeform lines appended to the generated robots.txt, for anything not covered by
     * `botRules` below. /admin and /api are always disallowed regardless of this setting —
     * see server/routes/robots.txt.get.ts.
     */
    extraRules: z.string().default(''),
    /** Per-bot allow/disallow toggle for the well-known AI crawlers in shared/constants/ai-bots.ts. Omitted = default (allowed). */
    botRules: z.record(z.string(), z.enum(['allow', 'disallow'])).default({}),
  }),
} as const

export type SiteSettingsKey = keyof typeof siteSettingsSchemas
