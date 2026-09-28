<script setup lang="ts">
const route = useRoute()
const { t } = useAdminI18n()

/** URL segment -> nav.* translation key, for the segments that have a sidebar entry. Anything else falls back to a capitalized version of the raw segment. */
const SEGMENT_KEYS: Record<string, string> = {
  pages: 'nav.pages',
  appointments: 'nav.appointments',
  services: 'nav.services',
  locations: 'nav.branches',
  blog: 'nav.blog',
  faqs: 'nav.faqs',
  'damage-wizard': 'nav.damageWizard',
  testimonials: 'nav.testimonials',
  partners: 'nav.partners',
  media: 'nav.media',
  menus: 'nav.menus',
  redirects: 'nav.redirects',
  translations: 'nav.translations',
  appearance: 'nav.appearance',
  settings: 'nav.settings',
  users: 'nav.users',
  'seo-report': 'nav.seoReport',
  'bulk-seo': 'nav.bulkSeo',
}

const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean) // e.g. ['admin', 'users']
  let path = ''
  return segments.map((segment) => {
    path += `/${segment}`
    const key = SEGMENT_KEYS[segment]
    const label = segment === 'admin' ? t('nav.dashboard') : key ? t(key) : segment.charAt(0).toUpperCase() + segment.slice(1)
    return { label, path }
  })
})
</script>

<template>
  <nav class="mb-4 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
    <template v-for="(crumb, index) in crumbs" :key="crumb.path">
      <span v-if="index > 0" class="mx-1">/</span>
      <NuxtLink v-if="index < crumbs.length - 1" :to="crumb.path" class="hover:text-primary">
        {{ crumb.label }}
      </NuxtLink>
      <span v-else class="font-medium text-slate-700 dark:text-slate-200">{{ crumb.label }}</span>
    </template>
  </nav>
</template>
