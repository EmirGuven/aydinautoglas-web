/**
 * Generic service-business sector template — a lighter skeleton (per prompt.md §6: "jenerik
 * hizmet firması iskeleti") that proves the same codebase adapts to a completely different
 * sector just by applying a different template. Modeled as a generic cleaning/maintenance
 * services company — deliberately unlike the auto-glass template — with placeholder DE/EN/TR
 * content an admin replaces with their own. No branches, blog, testimonials or damage wizard
 * config are seeded (those are auto-glass-specific / optional per sector); a real deployment
 * of this template adds whichever of those modules its sector actually needs via the admin.
 */
import { setTheme } from '../../../services/theme.service'
import { createMenuItem } from '../../../services/menus.service'
import { createPage, createBlock, updatePage } from '../../../services/pages.service'
import { createService } from '../../../services/services.service'
import { createFaq } from '../../../services/faqs.service'
import { setSetting } from '../../../services/site-settings.service'
import type { Block } from '../../../../shared/schemas/blocks'

export async function seedGenericServiceTemplate(): Promise<void> {
  console.log('[seed] generic-service: theme, settings...')
  // A deliberately different brand-token set from `autoglass` (warm/rounded vs.
  // technical/sharp) using the SAME design-system architecture, proving it
  // generalizes across sector templates — see docs/design-system.md. Sticks to
  // system font stacks (no @fontsource package needed here) since a rounded
  // UI-native heading face already fits a soft, approachable service brand.
  await setTheme({
    colorPrimary: '#15803d',
    colorSecondary: '#14532d',
    colorAccent: '#facc15',
    colorBackground: '#F6FAF7',
    colorText: '#14532d',
    colorSurface: '#ffffff',
    colorBorder: '#D9E5DC',
    colorMuted: '#5B6B60',
    fontFamily: 'system-ui, sans-serif',
    fontFamilyHeading: 'ui-rounded, system-ui, sans-serif',
    borderRadius: '0.75rem',
    radiusCard: '1rem',
    shadowCard: '0 2px 6px rgba(20, 83, 45, 0.10)',
    shadowElevated: '0 16px 32px rgba(20, 83, 45, 0.20)',
    buttonStyle: 'pill',
  })

  await setSetting('general', { companyName: 'Ihr Service GmbH', activeSectorTemplate: 'generic-service' })
  await setSetting('contact', {
    email: 'info@ihr-service.example',
    phone: '+49 30 9876543',
    address: { de: 'Beispielallee 5, 12345 Musterstadt', en: 'Beispielallee 5, 12345 Musterstadt, Germany', tr: 'Beispielallee 5, 12345 Musterstadt, Almanya' },
  })

  console.log('[seed] generic-service: menus...')
  const navItems: { label: Record<string, string>; linkValue: string }[] = [
    { label: { de: 'Startseite', en: 'Home', tr: 'Anasayfa' }, linkValue: '/' },
    { label: { de: 'Leistungen', en: 'Services', tr: 'Hizmetler' }, linkValue: '/services' },
    { label: { de: 'Termin buchen', en: 'Book an appointment', tr: 'Randevu al' }, linkValue: '/appointment' },
  ]
  for (const item of navItems) {
    await createMenuItem('header', { label: item.label, linkType: 'url', linkValue: item.linkValue })
    await createMenuItem('footer', { label: item.label, linkType: 'url', linkValue: item.linkValue })
  }

  console.log('[seed] generic-service: services...')
  await createService({
    slug: { de: 'grundreinigung', en: 'deep-cleaning', tr: 'detayli-temizlik' },
    title: { de: 'Grundreinigung', en: 'Deep Cleaning', tr: 'Detaylı Temizlik' },
    shortDescription: {
      de: 'Gründliche Reinigung für Wohnungen und Büros — einmalig oder regelmäßig.',
      en: 'Thorough cleaning for homes and offices — one-time or recurring.',
      tr: 'Ev ve ofisler için kapsamlı temizlik — tek seferlik veya düzenli.',
    },
    content: {
      de: '<p>Wir übernehmen die gründliche Reinigung Ihrer Räume — von Fenstern bis Fußböden — mit umweltfreundlichen Reinigungsmitteln.</p>',
      en: '<p>We handle the thorough cleaning of your spaces — from windows to floors — using eco-friendly cleaning products.</p>',
      tr: '<p>Mekanlarınızın kapsamlı temizliğini — pencerelerden zeminlere kadar — çevre dostu temizlik ürünleriyle üstleniyoruz.</p>',
    },
    isFeatured: true,
    shortAnswer: {
      de: 'Eine Grundreinigung dauert je nach Größe der Räume ca. 2-4 Stunden und beginnt ab 89 €.',
      en: 'A deep cleaning takes about 2-4 hours depending on room size, and starts from €89.',
      tr: 'Detaylı temizlik, mekanın büyüklüğüne göre yaklaşık 2-4 saat sürer ve 89 €\'dan başlar.',
    },
    priceFromCents: 8900,
    durationMinutes: 180,
    warranty: { de: '', en: '', tr: '' },
    insuranceInfo: { de: '', en: '', tr: '' },
    seo: {},
  })

  await createService({
    slug: { de: 'unterhaltsreinigung', en: 'maintenance-cleaning', tr: 'periyodik-temizlik' },
    title: { de: 'Unterhaltsreinigung', en: 'Maintenance Cleaning', tr: 'Periyodik Temizlik' },
    shortDescription: {
      de: 'Regelmäßige Reinigung nach individuellem Plan.',
      en: 'Recurring cleaning on a schedule that fits you.',
      tr: 'Size uygun bir programda düzenli temizlik.',
    },
    content: {
      de: '<p>Ob wöchentlich oder monatlich — wir erstellen einen Reinigungsplan, der zu Ihrem Alltag passt.</p>',
      en: '<p>Whether weekly or monthly — we build a cleaning schedule that fits your routine.</p>',
      tr: '<p>İster haftalık ister aylık olsun — günlük düzeninize uygun bir temizlik planı oluşturuyoruz.</p>',
    },
    isFeatured: true,
    shortAnswer: {
      de: 'Ja, wir bieten wöchentliche, zweiwöchentliche oder monatliche Reinigungstermine nach Ihrem individuellen Plan.',
      en: 'Yes, we offer weekly, bi-weekly, or monthly cleaning appointments on a schedule that fits you.',
      tr: 'Evet, size uygun bir programda haftalık, iki haftalık veya aylık temizlik randevuları sunuyoruz.',
    },
    priceFromCents: 4900,
    durationMinutes: 90,
    warranty: { de: '', en: '', tr: '' },
    insuranceInfo: { de: '', en: '', tr: '' },
    seo: {},
  })

  console.log('[seed] generic-service: FAQs...')
  const faqs: { question: Record<string, string>; answer: Record<string, string> }[] = [
    {
      question: { de: 'Bringen Sie Ihre eigenen Reinigungsmittel mit?', en: 'Do you bring your own cleaning supplies?', tr: 'Kendi temizlik malzemelerinizi mi getiriyorsunuz?' },
      answer: { de: 'Ja, alle Materialien sind im Preis inbegriffen.', en: 'Yes, all materials are included in the price.', tr: 'Evet, tüm malzemeler fiyata dahildir.' },
    },
    {
      question: { de: 'Kann ich einen festen Termin vereinbaren?', en: 'Can I book a recurring slot?', tr: 'Sabit bir randevu ayarlayabilir miyim?' },
      answer: { de: 'Ja, wählen Sie einfach Ihren Wunschrhythmus im Buchungsformular.', en: 'Yes, just pick your preferred frequency in the booking form.', tr: 'Evet, rezervasyon formunda tercih ettiğiniz sıklığı seçmeniz yeterli.' },
    },
    {
      question: { de: 'In welchen Städten sind Sie tätig?', en: 'Which cities do you serve?', tr: 'Hangi şehirlerde hizmet veriyorsunuz?' },
      answer: { de: 'Aktuell in Musterstadt und Umgebung — weitere Standorte folgen.', en: 'Currently in Musterstadt and the surrounding area — more locations coming soon.', tr: 'Şu anda Musterstadt ve çevresinde — yeni şubeler yakında.' },
    },
  ]
  for (const faq of faqs) {
    await createFaq({ question: faq.question, answer: faq.answer })
  }

  console.log('[seed] generic-service: homepage...')
  const homepage = await createPage({
    slug: { de: '', en: '', tr: '' },
    title: { de: 'Startseite', en: 'Home', tr: 'Anasayfa' },
    seo: {
      de: { metaTitle: 'Ihr Service GmbH — Reinigung & Unterhalt', metaDescription: 'Zuverlässige Reinigungs- und Unterhaltsdienste für Wohnungen und Büros.' },
      en: { metaTitle: 'Ihr Service GmbH — Cleaning & Maintenance', metaDescription: 'Reliable cleaning and maintenance services for homes and offices.' },
      tr: { metaTitle: 'Ihr Service GmbH — Temizlik & Bakım', metaDescription: 'Ev ve ofisler için güvenilir temizlik ve bakım hizmetleri.' },
    },
  })

  const homeBlocks: Block[] = [
    {
      type: 'hero',
      data: {
        heading: { de: 'Reinigung, der Sie vertrauen können', en: 'Cleaning You Can Trust', tr: 'Güvenebileceğiniz Temizlik' },
        subheading: { de: 'Zuverlässig, gründlich, flexibel', en: 'Reliable, thorough, flexible', tr: 'Güvenilir, kapsamlı, esnek' },
        ctaLabel: { de: 'Termin buchen', en: 'Book an appointment', tr: 'Randevu al' },
        ctaHref: '/appointment',
        badges: [
          { de: 'Alle Materialien inklusive', en: 'All materials included', tr: 'Tüm malzemeler dahil' },
          { de: 'Flexible Terminplanung', en: 'Flexible scheduling', tr: 'Esnek randevu planlama' },
        ],
      },
    },
    {
      type: 'service-cards',
      data: { heading: { de: 'Unsere Leistungen', en: 'Our Services', tr: 'Hizmetlerimiz' }, subheading: {}, limit: 6, onlyFeatured: false },
    },
    {
      type: 'why-us',
      data: {
        heading: { de: 'Warum Ihr Service GmbH?', en: 'Why Ihr Service GmbH?', tr: 'Neden Ihr Service GmbH?' },
        subheading: {},
        features: [
          { title: { de: 'Flexible Termine', en: 'Flexible scheduling', tr: 'Esnek randevu' }, description: { de: 'Wir richten uns nach Ihrem Zeitplan.', en: 'We work around your schedule.', tr: 'Programınıza göre çalışıyoruz.' }, icon: 'clock' },
          { title: { de: 'Geprüftes Personal', en: 'Vetted staff', tr: 'Güvenilir personel' }, description: { de: 'Alle Mitarbeitenden sind geschult und versichert.', en: 'All staff are trained and insured.', tr: 'Tüm personel eğitimli ve sigortalıdır.' }, icon: 'shield' },
          { title: { de: 'Umweltfreundlich', en: 'Eco-friendly', tr: 'Çevre dostu' }, description: { de: 'Wir setzen auf nachhaltige Reinigungsmittel.', en: 'We use sustainable cleaning products.', tr: 'Sürdürülebilir temizlik ürünleri kullanıyoruz.' }, icon: 'sparkles' },
        ],
      },
    },
    {
      type: 'faq-accordion',
      data: { heading: { de: 'Häufige Fragen', en: 'Frequently Asked Questions', tr: 'Sıkça Sorulan Sorular' }, subheading: {} },
    },
    {
      type: 'cta-band',
      data: {
        heading: { de: 'Bereit loszulegen?', en: 'Ready to get started?', tr: 'Başlamaya hazır mısınız?' },
        subheading: {},
        ctaLabel: { de: 'Jetzt Termin buchen', en: 'Book now', tr: 'Şimdi randevu al' },
        ctaHref: '/appointment',
      },
    },
    {
      type: 'contact-form',
      data: { heading: { de: 'Kontaktieren Sie uns', en: 'Contact us', tr: 'Bize ulaşın' }, subheading: {} },
    },
  ]

  for (const block of homeBlocks) {
    await createBlock(homepage.id, block)
  }
  await updatePage(homepage.id, { status: 'published' })

  console.log('[seed] generic-service template seeded.')
}
