import { Pool } from "pg"
import type { PoolClient } from "pg"
import { AsyncLocalStorage } from "node:async_hooks"
import {
  defaultFooterContactTitle,
  defaultFooterLegalLinks,
  defaultFooterMenuItems,
  defaultFooterMenuTitle,
  defaultFooterServicesTitle,
  defaultHeaderCtaLabel,
  defaultHeaderCtaUrl,
  defaultHeaderMenuItems,
  defaultLogoType,
} from "../../utils/site-settings"
import { defaultThemePaletteId } from "../../utils/theme-palettes"

const DEFAULT_HEADER_MENU_ITEMS_JSON = JSON.stringify(defaultHeaderMenuItems)
const DEFAULT_FOOTER_MENU_ITEMS_JSON = JSON.stringify(defaultFooterMenuItems)
const DEFAULT_FOOTER_LEGAL_LINKS_JSON = JSON.stringify(defaultFooterLegalLinks)

// ─────────────────────────────────────────────
// PostgreSQL bağlantı havuzu
// DATABASE_URL örn: postgresql://user:password@host:5432/dbname
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const txContext = new AsyncLocalStorage<PoolClient>()

function toPgSql(sql: string): string {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

async function rawQuery(sql: string, params: any[] = []) {
  const client = txContext.getStore()
  if (client) return client.query(sql, params)
  return pool.query(sql, params)
}

interface Stmt {
  run(...params: any[]): Promise<{ lastInsertRowid: number; changes: number }>
  get<T = any>(...params: any[]): Promise<T | undefined>
  all<T = any>(...params: any[]): Promise<T[]>
}

function prepare(sql: string): Stmt {
  const pgSql = toPgSql(sql)
  const isInsert = /^\s*insert/i.test(sql) && !/returning/i.test(sql)
  const runSql = isInsert ? `${pgSql} RETURNING id` : pgSql

  return {
    async run(...params: any[]) {
      const res = await rawQuery(runSql, params)
      return {
        lastInsertRowid: res.rows[0]?.id ?? 0,
        changes: res.rowCount ?? 0,
      }
    },
    async get<T = any>(...params: any[]): Promise<T | undefined> {
      const res = await rawQuery(pgSql, params)
      return res.rows[0] as T | undefined
    },
    async all<T = any>(...params: any[]): Promise<T[]> {
      const res = await rawQuery(pgSql, params)
      return res.rows as T[]
    },
  }
}

async function exec(sql: string): Promise<void> {
  await rawQuery(sql)
}

function transaction<T>(fn: () => Promise<T> | T): () => Promise<T> {
  return async () => {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const result = await txContext.run(client, fn)
      await client.query("COMMIT")
      return result
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  }
}

export interface Db {
  prepare(sql: string): Stmt
  exec(sql: string): Promise<void>
  transaction<T>(fn: () => Promise<T> | T): () => Promise<T>
}

const db: Db = { prepare, exec, transaction }

let ready: Promise<void> | null = null

export async function getDb(): Promise<Db> {
  if (!ready) ready = initSchema(db)
  await ready
  return db
}

async function initSchema(db: Db) {
  await db.exec(`
    -- Site ayarları (tek satır)
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Aydin Autoglas',
      title_suffix TEXT NOT NULL DEFAULT 'Aydin Autoglas',
      description TEXT NOT NULL DEFAULT '',
      logo_tagline TEXT NOT NULL DEFAULT 'Steinschlagreparatur · Scheibenaustausch · Mobiler Service',
      footer_tagline TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      phone_display TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      extra_phones TEXT NOT NULL DEFAULT '[]',
      extra_emails TEXT NOT NULL DEFAULT '[]',
      address_street TEXT NOT NULL DEFAULT '',
      address_region TEXT NOT NULL DEFAULT '',
      address_city TEXT NOT NULL DEFAULT '',
      working_hours TEXT NOT NULL DEFAULT '',
      maps_url TEXT NOT NULL DEFAULT '',
      social_instagram TEXT NOT NULL DEFAULT '',
      social_linkedin TEXT NOT NULL DEFAULT '',
      theme_palette TEXT NOT NULL DEFAULT 'gold',
      custom_theme_enabled INTEGER NOT NULL DEFAULT 0,
      custom_primary TEXT NOT NULL DEFAULT '#c9a35a',
      custom_primary_deep TEXT NOT NULL DEFAULT '#9a7030',
      custom_surface_dark TEXT NOT NULL DEFAULT '#2a3347',
      custom_accent_contrast TEXT NOT NULL DEFAULT '#1a1209',
      hero_image TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      favicon TEXT NOT NULL DEFAULT '',
      logo_type TEXT NOT NULL DEFAULT 'text',
      logo_image TEXT NOT NULL DEFAULT '',
      header_cta_label TEXT NOT NULL DEFAULT 'Termin vereinbaren',
      header_cta_url TEXT NOT NULL DEFAULT '/kontakt',
      header_menu_items TEXT NOT NULL DEFAULT '[{"label":"Startseite","to":"/","type":"link"},{"label":"Über uns","to":"/ueber-uns","type":"link"},{"label":"Leistungen","to":"","type":"services"},{"label":"Blog","to":"/blog","type":"link"},{"label":"FAQ","to":"/haeufige-fragen","type":"link"},{"label":"Kontakt","to":"/kontakt","type":"link"}]',
      footer_services_title TEXT NOT NULL DEFAULT 'Leistungen',
      footer_menu_title TEXT NOT NULL DEFAULT 'Unternehmen',
      footer_menu_items TEXT NOT NULL DEFAULT '[{"label":"Über uns","to":"/ueber-uns"},{"label":"Blog","to":"/blog"},{"label":"Häufige Fragen","to":"/haeufige-fragen"},{"label":"Termin vereinbaren","to":"/kontakt"}]',
      footer_contact_title TEXT NOT NULL DEFAULT 'Kontakt',
      footer_bottom_text TEXT NOT NULL DEFAULT '',
      footer_legal_links TEXT NOT NULL DEFAULT '[{"label":"Datenschutzerklärung","to":"/datenschutz"},{"label":"AGB","to":"/agb"},{"label":"Impressum","to":"/impressum"}]'
    );

    -- SSS kategorileri
    CREATE TABLE IF NOT EXISTS faq_groups (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- SSS soruları
    CREATE TABLE IF NOT EXISTS faq_items (
      id SERIAL PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES faq_groups(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Yasal sayfalar (slug: gizlilik, kullanim-kosullari, kvkk)
    CREATE TABLE IF NOT EXISTS legal_pages (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (now()::text)
    );

    -- Hakkımda sayfası (tek satır)
    CREATE TABLE IF NOT EXISTS about_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Wer wir sind',
      hero_title TEXT NOT NULL DEFAULT 'Über uns',
      hero_lead TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '',
      bio_title TEXT NOT NULL DEFAULT 'Aydin Autoglas',
      bio_paragraphs TEXT NOT NULL DEFAULT '[]',
      bio_badge_value TEXT NOT NULL DEFAULT '',
      bio_badge_label TEXT NOT NULL DEFAULT '',
      specialties TEXT NOT NULL DEFAULT '[]',
      hero_badges TEXT NOT NULL DEFAULT '[]',
      timeline TEXT NOT NULL DEFAULT '[]',
      approach_title TEXT NOT NULL DEFAULT 'So arbeiten wir',
      approach_lead TEXT NOT NULL DEFAULT '',
      approach_values TEXT NOT NULL DEFAULT '[]',
      cta_title TEXT NOT NULL DEFAULT 'Termin für Ihre Scheibe vereinbaren?',
      cta_text TEXT NOT NULL DEFAULT '',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Termin anfragen',
      cta_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Mobiler Service',
      cta_secondary_url TEXT NOT NULL DEFAULT '/mobiler-service'
    );

    -- Blog yazıları
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL DEFAULT '',
      read_time TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (now()::text),
      updated_at TEXT NOT NULL DEFAULT (now()::text)
    );

    -- Anasayfa içeriği (tek satır)
    CREATE TABLE IF NOT EXISTS homepage (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Autoglas-Fachbetrieb',
      hero_title TEXT NOT NULL DEFAULT 'Ihre Scheibe. Schnell und fachgerecht repariert.',
      hero_description TEXT NOT NULL DEFAULT 'Steinschlagreparatur, Frontscheibenaustausch, Seiten- und Heckscheiben sowie mobiler Service für Ihr Fahrzeug.',
      hero_badge1 TEXT NOT NULL DEFAULT 'Steinschlagreparatur oft ohne Kosten für Sie',
      hero_badge2 TEXT NOT NULL DEFAULT 'Direkte Abrechnung mit Ihrer Versicherung',
      hero_badge3 TEXT NOT NULL DEFAULT 'Mobiler Service vor Ort',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      hero_images TEXT NOT NULL DEFAULT '[]',
      hero_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren',
      hero_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      hero_primary_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      hero_secondary_label TEXT NOT NULL DEFAULT 'Über uns',
      hero_secondary_url TEXT NOT NULL DEFAULT '/ueber-uns',
      hero_secondary_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      accreditations TEXT NOT NULL DEFAULT '[]',
      about_eyebrow TEXT NOT NULL DEFAULT 'Über uns',
      about_title TEXT NOT NULL DEFAULT 'Familienbetrieb mit Fachwissen für Fahrzeugverglasung',
      about_role TEXT NOT NULL DEFAULT 'Steinschlagreparatur, Scheibenaustausch & mobiler Service',
      about_paragraph1 TEXT NOT NULL DEFAULT '',
      about_paragraph2 TEXT NOT NULL DEFAULT '',
      about_photo TEXT NOT NULL DEFAULT '',
      services_eyebrow TEXT NOT NULL DEFAULT 'Leistungen',
      services_title TEXT NOT NULL DEFAULT 'Rund um Ihre Fahrzeugscheibe',
      services_description TEXT NOT NULL DEFAULT 'Von der Steinschlagreparatur bis zum mobilen Service — alles rund um Ihre Fahrzeugverglasung.',
      services_bg_image TEXT NOT NULL DEFAULT '',
      process_eyebrow TEXT NOT NULL DEFAULT 'Ablauf',
      process_title TEXT NOT NULL DEFAULT 'Von der Anfrage bis zur reparierten Scheibe',
      process_description TEXT NOT NULL DEFAULT 'Kurzer Kontakt, klare Einschätzung, schneller Termin.',
      process_steps TEXT NOT NULL DEFAULT '[]',
      testimonials_eyebrow TEXT NOT NULL DEFAULT 'Warum Aydin Autoglas',
      testimonials_title TEXT NOT NULL DEFAULT 'Warum Aydin Autoglas?',
      testimonials_description TEXT NOT NULL DEFAULT 'Familiengeführt, persönlich erreichbar und fachgerechte Montage nach Herstellervorgaben.',
      cta_title TEXT NOT NULL DEFAULT 'Jetzt Termin für Ihre Scheibe sichern',
      cta_description TEXT NOT NULL DEFAULT 'Schildern Sie uns Ihren Schaden, wir kümmern uns um den Rest.',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren',
      cta_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Mobiler Service',
      cta_secondary_url TEXT NOT NULL DEFAULT '/mobiler-service',
      services_items TEXT NOT NULL DEFAULT '[]'
    );

    -- Randevular / İletişim formları
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      service TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (now()::text)
    );

    -- Admin kullanıcı (tek kullanıcı)
    CREATE TABLE IF NOT EXISTS admin_user (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL DEFAULT ''
    );
  `)

  // Varsayılan site ayarlarını ekle
  const existing = await db.prepare("SELECT id FROM site_settings WHERE id = 1").get()
  if (!existing) {
    await db.prepare(`
      INSERT INTO site_settings (id, name, title_suffix, description, logo_tagline, footer_tagline, phone, phone_display, email,
        address_street, address_region, address_city, working_hours, maps_url,
        social_instagram, social_linkedin, hero_image, og_image)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Aydin Autoglas",
      "Aydin Autoglas",
      "Aydin Autoglas; Steinschlagreparatur, Frontscheibenaustausch, Seiten- und Heckscheibenaustausch sowie mobilem Service in Hildrizhausen und dem Landkreis Böblingen.",
      "Steinschlagreparatur · Scheibenaustausch · Mobiler Service",
      "Von der schnellen Steinschlagreparatur bis zum kompletten Scheibenaustausch — Ihr Fachbetrieb für Autoglas.",
      "",
      "",
      "Autoglas@auto-bb.de",
      "Hans Klemm Straße 2",
      "Hildrizhausen",
      "71157 Hildrizhausen",
      "Mo–Fr 08:00–18:00 Uhr · Sa nach Vereinbarung",
      "https://www.google.com/maps/search/?api=1&query=Hans+Klemm+Stra%C3%9Fe+2%2C+71157+Hildrizhausen",
      "",
      "",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80"
    )
  } else {
    // Mevcut kayıt varsa yeni sütunları eksikse ekle (migration)
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_tagline TEXT NOT NULL DEFAULT 'Steinschlagreparatur · Scheibenaustausch · Mobiler Service'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_tagline TEXT NOT NULL DEFAULT ''")
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_type TEXT NOT NULL DEFAULT '${defaultLogoType}'`)
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_image TEXT NOT NULL DEFAULT ''")
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS header_cta_label TEXT NOT NULL DEFAULT '${defaultHeaderCtaLabel}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS header_cta_url TEXT NOT NULL DEFAULT '${defaultHeaderCtaUrl}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS header_menu_items TEXT NOT NULL DEFAULT '${DEFAULT_HEADER_MENU_ITEMS_JSON}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_services_title TEXT NOT NULL DEFAULT '${defaultFooterServicesTitle}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_menu_title TEXT NOT NULL DEFAULT '${defaultFooterMenuTitle}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_menu_items TEXT NOT NULL DEFAULT '${DEFAULT_FOOTER_MENU_ITEMS_JSON}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_contact_title TEXT NOT NULL DEFAULT '${defaultFooterContactTitle}'`)
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_bottom_text TEXT NOT NULL DEFAULT ''")
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_legal_links TEXT NOT NULL DEFAULT '${DEFAULT_FOOTER_LEGAL_LINKS_JSON}'`)
    await db.exec(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS theme_palette TEXT NOT NULL DEFAULT '${defaultThemePaletteId}'`)
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_theme_enabled INTEGER NOT NULL DEFAULT 0")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_primary TEXT NOT NULL DEFAULT '#c9a35a'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_primary_deep TEXT NOT NULL DEFAULT '#9a7030'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_surface_dark TEXT NOT NULL DEFAULT '#2a3347'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_accent_contrast TEXT NOT NULL DEFAULT '#1a1209'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS extra_phones TEXT NOT NULL DEFAULT '[]'")
    await db.exec("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS extra_emails TEXT NOT NULL DEFAULT '[]'")
  }

  // Varsayılan admin kullanıcısı (şifre: admin123 — ilk girişte değiştirilmeli)
  const adminExists = await db.prepare("SELECT id FROM admin_user WHERE id = 1").get()
  if (!adminExists) {
    // bcrypt yerine basit hash — production'da değiştirin
    await db.prepare("INSERT INTO admin_user (id, username, password_hash) VALUES (1, 'admin', 'admin123')").run()
  }

  // Varsayılan hakkımda sayfasını ekle
  const aboutExists = await db.prepare("SELECT id FROM about_page WHERE id = 1").get()
  if (!aboutExists) {
    await db.prepare(`
      INSERT INTO about_page (id, hero_eyebrow, hero_title, hero_lead, photo_url,
        bio_title, bio_paragraphs, specialties,
        timeline, approach_title, approach_lead, approach_values, cta_title, cta_text)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Wer wir sind",
      "Über uns",
      "Als familiengeführter Betrieb reparieren und ersetzen wir Fahrzeugverglasung mit Sorgfalt und Fachwissen.",
      "",
      "Aydin Autoglas",
      JSON.stringify([
        "Aydin Autoglas ist ein familiengeführter Fachbetrieb für Fahrzeugverglasung mit Sitz in Hildrizhausen.",
        "Wir kümmern uns um alles rund um Ihre Autoscheibe — von der schnellen Steinschlagreparatur bis zum fachgerechten Komplettaustausch."
      ]),
      JSON.stringify([
        { title: "Steinschlagreparatur", desc: "Schnelle Reparatur kleiner Schäden, oft ohne Kosten für Sie über die Teilkasko." },
        { title: "Frontscheibenaustausch", desc: "Fachgerechter Austausch inklusive Verklebung nach Herstellervorgabe." },
        { title: "Seiten- & Heckscheiben", desc: "Austausch von Seiten- und Heckscheiben für nahezu alle Fahrzeugmodelle." },
        { title: "Mobiler Service", desc: "Wir kommen zu Ihnen nach Hause, zur Arbeit oder auf den Parkplatz." }
      ]),
      JSON.stringify([
        { years: "Familie", title: "Familienbetrieb", desc: "Geführt von Recep Aydin und Can Aydin — persönlich und verlässlich." },
        { years: "Autoglas", title: "Spezialisiert auf Fahrzeugverglasung", desc: "Steinschlagreparatur, Scheibenaustausch und ADAS-Kalibrierung aus einer Hand." },
        { years: "BB", title: "Landkreis Böblingen", desc: "Vor Ort in Hildrizhausen und mobil im gesamten Großraum Stuttgart unterwegs." },
        { years: "KFZ", title: "Versicherungspartner", desc: "Unkomplizierte Abwicklung mit Ihrer Kaskoversicherung direkt über uns." }
      ]),
      "So arbeiten wir",
      "Ehrliches Handwerk, klare Kommunikation und eine Reparatur, die hält.",
      JSON.stringify([
        { title: "Fachwissen", desc: "Reparatur und Austausch nach aktuellen Herstellervorgaben." },
        { title: "Transparenz", desc: "Sie erfahren vorab, was gemacht wird und was es kostet." },
        { title: "Erreichbarkeit", desc: "Kurze Wege, schnelle Terminvergabe und mobiler Service." }
      ]),
      "Termin für Ihre Scheibe vereinbaren?",
      "Schildern Sie uns kurz den Schaden — wir sagen Ihnen, ob Reparatur reicht oder ein Austausch nötig ist."
    )
  } else {
    // Migration: yeni sütunlar ekle
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS hero_bg_image TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren'")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Mobiler Service'")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT '/steinschlagreparatur'")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS bio_badge_value TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS bio_badge_label TEXT NOT NULL DEFAULT ''")
    await db.exec("ALTER TABLE about_page ADD COLUMN IF NOT EXISTS hero_badges TEXT NOT NULL DEFAULT '[]'")
  }

  // Appointments migration: yeni sütunlar
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS first_visit_date TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS issue_date TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS session_count INTEGER NOT NULL DEFAULT 0")
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'request'")
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TEXT NOT NULL DEFAULT ''")

  // Blog migration: yeni sütunlar
  await db.exec("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS hero_bg_image TEXT NOT NULL DEFAULT ''")

  // İletişim sayfası (tek satır)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow    TEXT NOT NULL DEFAULT 'Kontakt',
      hero_title      TEXT NOT NULL DEFAULT 'Vereinbaren Sie Ihren Termin',
      hero_lead       TEXT NOT NULL DEFAULT 'Schildern Sie uns kurz, was passiert ist, und wir melden uns mit einem Terminvorschlag.',
      hero_bg_image   TEXT NOT NULL DEFAULT '',
      info_title      TEXT NOT NULL DEFAULT 'Kontaktdaten',
      info_lead       TEXT NOT NULL DEFAULT 'Sie erreichen uns per E-Mail oder über das Kontaktformular.',
      contact_email   TEXT NOT NULL DEFAULT '',
      form_title      TEXT NOT NULL DEFAULT 'Termin- und Kostenanfrage',
      form_lead       TEXT NOT NULL DEFAULT 'Teilen Sie uns Ihr Fahrzeug und den Schaden mit — wir melden uns mit einem Terminvorschlag.',
      cta_title       TEXT NOT NULL DEFAULT 'Direkter Kontakt',
      cta_lead        TEXT NOT NULL DEFAULT 'Sie erreichen uns auch direkt per E-Mail statt über das Formular.',
      cta_bg_image    TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'E-Mail schreiben',
      cta_primary_url TEXT NOT NULL DEFAULT '',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Anrufen',
      cta_secondary_url TEXT NOT NULL DEFAULT ''
    )
  `)
  const contactExists = await db.prepare("SELECT id FROM contact_page WHERE id = 1").get()
  if (!contactExists) {
    await db.prepare(`INSERT INTO contact_page (id) VALUES (1)`).run()
  }
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'E-Mail schreiben'")
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Anrufen'")
  await db.exec("ALTER TABLE contact_page ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT ''")

  // Blog listesi sayfası
  await db.exec(`
    CREATE TABLE IF NOT EXISTS blog_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow  TEXT NOT NULL DEFAULT 'Autoglas-Wissen',
      hero_title    TEXT NOT NULL DEFAULT 'Blog',
      hero_lead     TEXT NOT NULL DEFAULT 'Praktische Informationen rund um Steinschlagreparatur, Scheibenaustausch und Versicherungsfragen.',
      hero_bg_image TEXT NOT NULL DEFAULT ''
    )
  `)
  const blogPageExists = await db.prepare("SELECT id FROM blog_page WHERE id = 1").get()
  if (!blogPageExists) {
    await db.prepare(`INSERT INTO blog_page (id) VALUES (1)`).run()
  }

  // SSS sayfası
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sss_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow  TEXT NOT NULL DEFAULT 'Häufige Fragen',
      hero_title    TEXT NOT NULL DEFAULT 'Häufig gestellte Fragen',
      hero_lead     TEXT NOT NULL DEFAULT 'Antworten auf die häufigsten Fragen zu Steinschlagreparatur, Scheibenaustausch und Versicherung.',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      cta_title     TEXT NOT NULL DEFAULT 'Ihre Frage war nicht dabei?',
      cta_lead      TEXT NOT NULL DEFAULT 'Schreiben Sie uns direkt, wenn Ihre Frage hier nicht beantwortet wurde.',
      cta_bg_image  TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Kontakt aufnehmen',
      cta_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Termin anfragen',
      cta_secondary_url TEXT NOT NULL DEFAULT '/kontakt'
    )
  `)
  const sssPageExists = await db.prepare("SELECT id FROM sss_page WHERE id = 1").get()
  if (!sssPageExists) {
    await db.prepare(`INSERT INTO sss_page (id) VALUES (1)`).run()
  }
  await db.exec("ALTER TABLE sss_page ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE sss_page ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'Kontakt aufnehmen'")
  await db.exec("ALTER TABLE sss_page ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
  await db.exec("ALTER TABLE sss_page ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Termin anfragen'")
  await db.exec("ALTER TABLE sss_page ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT '/kontakt'")

  // Hizmet sayfaları (bireysel, çift, online)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS service_pages (
      id           SERIAL PRIMARY KEY,
      slug         TEXT NOT NULL UNIQUE,
      hero_eyebrow TEXT NOT NULL DEFAULT 'Autoglas-Leistung',
      hero_title   TEXT NOT NULL DEFAULT '',
      hero_lead    TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      what_title   TEXT NOT NULL DEFAULT '',
      what_lead    TEXT NOT NULL DEFAULT '',
      benefits     TEXT NOT NULL DEFAULT '[]',
      issues_title TEXT NOT NULL DEFAULT 'Hangi Operasyonlarda Kullanılır?',
      issues_lead  TEXT NOT NULL DEFAULT '',
      issues       TEXT NOT NULL DEFAULT '[]',
      process_title TEXT NOT NULL DEFAULT 'Operasyon Süreci Nasıl İlerler?',
      process_lead  TEXT NOT NULL DEFAULT '',
      process_steps TEXT NOT NULL DEFAULT '[]',
      cta_title    TEXT NOT NULL DEFAULT 'Hızlı teklif almak ister misiniz?',
      cta_lead     TEXT NOT NULL DEFAULT '',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren',
      cta_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Über uns',
      cta_secondary_url TEXT NOT NULL DEFAULT '/ueber-uns'
    )
  `)
  await db.exec("ALTER TABLE service_pages ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE service_pages ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren'")
  await db.exec("ALTER TABLE service_pages ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
  await db.exec("ALTER TABLE service_pages ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Über uns'")
  await db.exec("ALTER TABLE service_pages ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT '/ueber-uns'")

  // Hizmetler ana sayfası
  await db.exec(`
    CREATE TABLE IF NOT EXISTS services_page (
      id           INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Leistungen',
      hero_title   TEXT NOT NULL DEFAULT 'Taşıma Çözümlerimiz',
      hero_lead    TEXT NOT NULL DEFAULT 'Von der Steinschlagreparatur bis zum kompletten Scheibenaustausch — fachgerecht und mit Versicherungsabwicklung.',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      intro_title  TEXT NOT NULL DEFAULT 'Nasıl Yardımcı Olabiliriz?',
      intro_lead   TEXT NOT NULL DEFAULT 'Yük tipi, teslim noktası ve termin bilgisine göre size uygun taşıma çözümünü oluşturuyoruz.',
      cta_title    TEXT NOT NULL DEFAULT 'Hızlı teklif almak ister misiniz?',
      cta_lead     TEXT NOT NULL DEFAULT 'Sevkiyat detaylarınızı paylaşın, operasyon planınızı birlikte netleştirelim.',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren',
      cta_primary_url TEXT NOT NULL DEFAULT '/kontakt',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Kontakt aufnehmen',
      cta_secondary_url TEXT NOT NULL DEFAULT '/kontakt'
    )
  `)
  const servicesPageExists = await db.prepare("SELECT id FROM services_page WHERE id = 1").get()
  if (!servicesPageExists) {
    await db.prepare(`INSERT INTO services_page (id) VALUES (1)`).run()
  }
  await db.exec("ALTER TABLE services_page ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE services_page ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren'")
  await db.exec("ALTER TABLE services_page ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
  await db.exec("ALTER TABLE services_page ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Kontakt aufnehmen'")
  await db.exec("ALTER TABLE services_page ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT '/kontakt'")

  // Admin notlar tablosu (notluk / hatırlatıcı)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      remind_at TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT 'yellow',
      pinned INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (now()::text),
      updated_at TEXT NOT NULL DEFAULT (now()::text)
    )
  `)

  // Mobil story şeridi (sadece mobilde görünür, admin'den yönetilir)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      link_label TEXT NOT NULL DEFAULT '',
      link_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (now()::text)
    )
  `)

  // Varsayılan anasayfa içeriğini ekle
  const homepageExists = await db.prepare("SELECT id FROM homepage WHERE id = 1").get()
  if (!homepageExists) {
    await db.prepare(`
      INSERT INTO homepage (id,
        hero_eyebrow, hero_title, hero_description, hero_badge1, hero_badge2, hero_badge3,
        accreditations,
        about_eyebrow, about_title, about_role, about_paragraph1, about_paragraph2, about_photo,
        services_eyebrow, services_title, services_description,
        process_eyebrow, process_title, process_description, process_steps,
        testimonials_eyebrow, testimonials_title, testimonials_description,
        cta_title, cta_description
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Autoglas-Fachbetrieb",
      "Ihre Scheibe. Schnell und fachgerecht repariert.",
      "Steinschlagreparatur, Frontscheibenaustausch, Seiten- und Heckscheiben sowie mobiler Service für Ihr Fahrzeug.",
      "Steinschlagreparatur oft ohne Kosten für Sie",
      "Direkte Abrechnung mit Ihrer Versicherung",
      "Mobiler Service vor Ort",
      JSON.stringify([
        { icon: "shield", label: "Steinschlagreparatur oft ohne Kosten für Sie" },
        { icon: "tune",  label: "Direkte Abrechnung mit Ihrer Versicherung" },
        { icon: "clock", label: "Mobiler Service vor Ort" },
      ]),
      "Über uns",
      "Familienbetrieb mit Fachwissen für Fahrzeugverglasung",
      "Steinschlagreparatur, Scheibenaustausch & mobiler Service",
      "Aydin Autoglas ist ein familiengeführter Betrieb in Hildrizhausen, geleitet von Recep Aydin und Can Aydin.",
      "Wir arbeiten fachgerecht nach Herstellervorgaben und klären die Kostenübernahme direkt mit Ihrer Versicherung.",
      "",
      "Leistungen",
      "Rund um Ihre Fahrzeugscheibe",
      "Von der Steinschlagreparatur bis zum mobilen Service — alles rund um Ihre Fahrzeugverglasung.",
      "Ablauf",
      "Von der Anfrage bis zur reparierten Scheibe",
      "Kurzer Kontakt, klare Einschätzung, schneller Termin.",
      JSON.stringify([
        { number: "1", title: "Anfrage & Einschätzung", description: "Sie schildern uns den Schaden, wir sagen Ihnen, ob eine Reparatur reicht." },
        { number: "2", title: "Termin & Versicherung", description: "Wir vereinbaren einen Termin und klären die Kostenübernahme mit Ihrer Versicherung." },
        { number: "3", title: "Reparatur & Übergabe", description: "Fachgerechte Ausführung und Übergabe Ihres fahrbereiten Fahrzeugs." },
      ]),
      "Warum Aydin Autoglas",
      "Warum Aydin Autoglas?",
      "Familiengeführt, persönlich erreichbar und fachgerechte Montage nach Herstellervorgaben.",
      "Jetzt Termin für Ihre Scheibe sichern",
      "Schildern Sie uns Ihren Schaden, wir kümmern uns um den Rest."
    )
  }
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_images TEXT NOT NULL DEFAULT '[]'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_secondary_label TEXT NOT NULL DEFAULT 'Über uns'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_secondary_url TEXT NOT NULL DEFAULT '/ueber-uns'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_primary_enabled BOOLEAN NOT NULL DEFAULT TRUE")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS hero_secondary_enabled BOOLEAN NOT NULL DEFAULT TRUE")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS services_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS cta_bg_image TEXT NOT NULL DEFAULT ''")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS cta_primary_label TEXT NOT NULL DEFAULT 'Termin vereinbaren'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS cta_primary_url TEXT NOT NULL DEFAULT '/kontakt'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT NOT NULL DEFAULT 'Mobiler Service'")
  await db.exec("ALTER TABLE homepage ADD COLUMN IF NOT EXISTS cta_secondary_url TEXT NOT NULL DEFAULT '/steinschlagreparatur'")

  const legacyHeroImageRow = await db.prepare("SELECT hero_image FROM site_settings WHERE id = 1").get()
  const legacyHeroImage = legacyHeroImageRow?.hero_image || ""
  if (legacyHeroImage) {
    await db.prepare(`
      UPDATE homepage
      SET hero_bg_image = ?
      WHERE id = 1 AND TRIM(COALESCE(hero_bg_image, '')) = ''
    `).run(legacyHeroImage)
  }
  await db.prepare(`
    UPDATE homepage
    SET services_bg_image = COALESCE(NULLIF(hero_bg_image, ''), ?)
    WHERE id = 1 AND TRIM(COALESCE(services_bg_image, '')) = ''
  `).run(legacyHeroImage)
}
