<script setup lang="ts">
import type { Component } from 'vue'
import type { Block, BlockType } from '#shared/schemas/blocks'
import BlockHero from './Hero.vue'
import BlockServiceCards from './ServiceCards.vue'
import BlockHowItWorks from './HowItWorks.vue'
import BlockDamageWizard from './DamageWizard.vue'
import BlockWhyUs from './WhyUs.vue'
import BlockStatsCounter from './StatsCounter.vue'
import BlockTestimonials from './Testimonials.vue'
import BlockPartners from './Partners.vue'
import BlockBranchFinder from './BranchFinder.vue'
import BlockFaqAccordion from './FaqAccordion.vue'
import BlockBlogPreview from './BlogPreview.vue'
import BlockCtaBand from './CtaBand.vue'
import BlockRichText from './RichText.vue'
import BlockImageText from './ImageText.vue'
import BlockGallery from './Gallery.vue'
import BlockContactForm from './ContactForm.vue'
import BlockComparisonTable from './ComparisonTable.vue'
import BlockCertificates from './Certificates.vue'

defineProps<{ blocks: Block[] }>()

const BLOCK_REGISTRY: Record<BlockType, Component> = {
  hero: BlockHero,
  'service-cards': BlockServiceCards,
  'how-it-works': BlockHowItWorks,
  'damage-wizard': BlockDamageWizard,
  'why-us': BlockWhyUs,
  'stats-counter': BlockStatsCounter,
  testimonials: BlockTestimonials,
  partners: BlockPartners,
  'branch-finder': BlockBranchFinder,
  'faq-accordion': BlockFaqAccordion,
  'blog-preview': BlockBlogPreview,
  'cta-band': BlockCtaBand,
  'rich-text': BlockRichText,
  'image-text': BlockImageText,
  gallery: BlockGallery,
  'contact-form': BlockContactForm,
  'comparison-table': BlockComparisonTable,
  certificates: BlockCertificates,
}
</script>

<template>
  <component :is="BLOCK_REGISTRY[block.type]" v-for="(block, index) in blocks" :key="index" :data="block.data" />
</template>
