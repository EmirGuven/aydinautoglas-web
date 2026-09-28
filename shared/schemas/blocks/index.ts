import { z } from 'zod'
import { blogPreviewBlockSchema } from './blog-preview'
import { branchFinderBlockSchema } from './branch-finder'
import { certificatesBlockSchema } from './certificates'
import { comparisonTableBlockSchema } from './comparison-table'
import { contactFormBlockSchema } from './contact-form'
import { ctaBandBlockSchema } from './cta-band'
import { damageWizardBlockSchema } from './damage-wizard'
import { faqAccordionBlockSchema } from './faq-accordion'
import { galleryBlockSchema } from './gallery'
import { heroBlockSchema } from './hero'
import { howItWorksBlockSchema } from './how-it-works'
import { imageTextBlockSchema } from './image-text'
import { partnersBlockSchema } from './partners'
import { richTextBlockSchema } from './rich-text'
import { serviceCardsBlockSchema } from './service-cards'
import { statsCounterBlockSchema } from './stats-counter'
import { testimonialsBlockSchema } from './testimonials'
import { whyUsBlockSchema } from './why-us'

/**
 * Page builder blocks are stored as a discriminated union so every block type
 * is fully typed end-to-end: admin editor forms, the public renderer's
 * BLOCK_REGISTRY, and the `page_blocks.data` JSONB column all share this
 * single source of truth. See docs/how-to/add-a-block-type.md before adding
 * a new one.
 */
export const blockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  serviceCardsBlockSchema,
  howItWorksBlockSchema,
  damageWizardBlockSchema,
  whyUsBlockSchema,
  statsCounterBlockSchema,
  testimonialsBlockSchema,
  partnersBlockSchema,
  branchFinderBlockSchema,
  faqAccordionBlockSchema,
  blogPreviewBlockSchema,
  ctaBandBlockSchema,
  richTextBlockSchema,
  imageTextBlockSchema,
  galleryBlockSchema,
  contactFormBlockSchema,
  comparisonTableBlockSchema,
  certificatesBlockSchema,
])

export type Block = z.infer<typeof blockSchema>
export type BlockType = Block['type']

export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'hero', label: 'Hero' },
  { type: 'service-cards', label: 'Service cards' },
  { type: 'how-it-works', label: 'How it works' },
  { type: 'damage-wizard', label: 'Damage assessment wizard' },
  { type: 'why-us', label: 'Why us / features' },
  { type: 'stats-counter', label: 'Stats counters' },
  { type: 'testimonials', label: 'Testimonials' },
  { type: 'partners', label: 'Partner logos' },
  { type: 'branch-finder', label: 'Branch finder' },
  { type: 'faq-accordion', label: 'FAQ accordion' },
  { type: 'blog-preview', label: 'Blog preview' },
  { type: 'cta-band', label: 'CTA band' },
  { type: 'rich-text', label: 'Rich text' },
  { type: 'image-text', label: 'Image + text' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'contact-form', label: 'Contact form' },
  { type: 'comparison-table', label: 'Comparison table' },
  { type: 'certificates', label: 'Certificates / awards' },
]

/** A required translatableText() field needs at least one non-empty-keyed language; an empty string value is fine. */
const REQUIRED_HEADING = { de: '' }

export function defaultBlockData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return { heading: REQUIRED_HEADING, subheading: {}, ctaLabel: {}, badges: [] }
    case 'service-cards':
      return { heading: REQUIRED_HEADING, subheading: {}, limit: 6, onlyFeatured: false }
    case 'how-it-works':
      return { heading: REQUIRED_HEADING, subheading: {}, steps: [] }
    case 'damage-wizard':
      return { heading: REQUIRED_HEADING, subheading: {} }
    case 'why-us':
      return { heading: REQUIRED_HEADING, subheading: {}, features: [] }
    case 'stats-counter':
      return { stats: [] }
    case 'testimonials':
      return { heading: REQUIRED_HEADING, subheading: {}, limit: 6 }
    case 'partners':
      return { subheading: {} }
    case 'branch-finder':
      return { heading: REQUIRED_HEADING, subheading: {} }
    case 'faq-accordion':
      return { heading: REQUIRED_HEADING, subheading: {} }
    case 'blog-preview':
      return { heading: REQUIRED_HEADING, subheading: {}, limit: 3 }
    case 'cta-band':
      return { heading: REQUIRED_HEADING, subheading: {}, ctaLabel: { de: '' }, ctaHref: '/' }
    case 'rich-text':
      return { content: {} }
    case 'image-text':
      return { heading: REQUIRED_HEADING, text: {}, imagePosition: 'left' }
    case 'gallery':
      return { subheading: {}, mediaIds: [] }
    case 'contact-form':
      return { heading: REQUIRED_HEADING, subheading: {} }
    case 'comparison-table':
      return { heading: REQUIRED_HEADING, subheading: {}, columns: [], rows: [] }
    case 'certificates':
      return { heading: REQUIRED_HEADING, subheading: {}, items: [] }
  }
}

export {
  heroBlockSchema,
  serviceCardsBlockSchema,
  howItWorksBlockSchema,
  damageWizardBlockSchema,
  whyUsBlockSchema,
  statsCounterBlockSchema,
  testimonialsBlockSchema,
  partnersBlockSchema,
  branchFinderBlockSchema,
  faqAccordionBlockSchema,
  blogPreviewBlockSchema,
  ctaBandBlockSchema,
  richTextBlockSchema,
  imageTextBlockSchema,
  galleryBlockSchema,
  contactFormBlockSchema,
  comparisonTableBlockSchema,
  certificatesBlockSchema,
}
