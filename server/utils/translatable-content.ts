// Çevrilebilir içerik kayıtlarının merkezi kayıt defteri.
// Her giriş: hangi tablo, hangi metin alanları çevrilebilir, admin panelde nasıl listelenir.
export interface TranslatableContentConfig {
  table: string
  fields: string[]
  label: string
  // Birden fazla kayıt varsa (blog, hizmet, SSS gibi) — listelemek için:
  listable?: boolean
  titleField?: string
}

export const MENU_ARRAY_FIELDS = ["header_menu_items", "footer_menu_items", "footer_legal_links"] as const

export const TRANSLATABLE_CONTENT: Record<string, TranslatableContentConfig> = {
  site_settings: {
    table: "site_settings",
    label: "Site Ayarları (Menü ve Başlıklar)",
    fields: [
      "logo_tagline", "footer_tagline", "header_cta_label",
      "footer_services_title", "footer_menu_title", "footer_contact_title", "footer_bottom_text",
    ],
  },
  homepage: {
    table: "homepage",
    label: "Anasayfa",
    fields: [
      "hero_eyebrow", "hero_title", "hero_description", "hero_badge1", "hero_badge2", "hero_badge3",
      "hero_primary_label", "hero_secondary_label",
      "about_eyebrow", "about_title", "about_role", "about_paragraph1", "about_paragraph2",
      "services_eyebrow", "services_title", "services_description",
      "process_eyebrow", "process_title", "process_description",
      "testimonials_eyebrow", "testimonials_title", "testimonials_description",
      "cta_title", "cta_description", "cta_primary_label", "cta_secondary_label",
    ],
  },
  about_page: {
    table: "about_page",
    label: "Kurumsal Sayfa",
    fields: [
      "hero_eyebrow", "hero_title", "hero_lead", "bio_title", "bio_badge_label",
      "approach_title", "approach_lead", "cta_title", "cta_text",
      "cta_primary_label", "cta_secondary_label",
    ],
  },
  contact_page: {
    table: "contact_page",
    label: "İletişim Sayfası",
    fields: [
      "hero_eyebrow", "hero_title", "hero_lead", "info_title", "info_lead",
      "form_title", "form_lead", "cta_title", "cta_lead",
      "cta_primary_label", "cta_secondary_label",
    ],
  },
  services_page: {
    table: "services_page",
    label: "Hizmetler Ana Sayfası",
    fields: ["hero_eyebrow", "hero_title", "hero_lead", "intro_title", "intro_lead", "cta_title", "cta_lead"],
  },
  sss_page: {
    table: "sss_page",
    label: "SSS Sayfası",
    fields: ["hero_eyebrow", "hero_title", "hero_lead", "cta_title", "cta_lead", "cta_primary_label", "cta_secondary_label"],
  },
  blog_page: {
    table: "blog_page",
    label: "Blog Sayfası",
    fields: ["hero_eyebrow", "hero_title", "hero_lead"],
  },
  blog_post: {
    table: "blog_posts",
    label: "Blog Yazıları",
    fields: ["title", "excerpt", "content", "category", "quote", "read_time"],
    listable: true,
    titleField: "title",
  },
  service_page: {
    table: "service_pages",
    label: "Hizmet Sayfaları",
    fields: [
      "hero_eyebrow", "hero_title", "hero_lead", "what_title", "what_lead",
      "issues_title", "issues_lead", "process_title", "process_lead",
      "cta_title", "cta_lead", "cta_primary_label", "cta_secondary_label",
    ],
    listable: true,
    titleField: "hero_title",
  },
  faq_item: {
    table: "faq_items",
    label: "SSS Soruları",
    fields: ["question", "answer"],
    listable: true,
    titleField: "question",
  },
  faq_group: {
    table: "faq_groups",
    label: "SSS Kategorileri",
    fields: ["category"],
    listable: true,
    titleField: "category",
  },
}
