<script setup lang="ts">
interface ServiceSeoValue {
  metaTitle?: string
  metaDescription?: string
  noindex?: boolean
  shortAnswer?: string
}

interface ServiceDetail {
  id: string
  slug: Record<string, string>
  title: Record<string, string>
  content: Record<string, string>
  shortAnswer: Record<string, string>
  priceFromCents: number | null
  durationMinutes: number | null
  warranty: Record<string, string>
  insuranceInfo: Record<string, string>
  seo: Record<string, ServiceSeoValue>
}

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

const { data: service, error } = await useFetch<ServiceDetail>(`/api/services/${slug}`, {
  query: { locale },
  key: () => `service-${locale.value}-${slug}`,
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true })
}

const seo = computed(() => service.value?.seo[locale.value] ?? {})
const shortAnswer = computed(() => seo.value.shortAnswer || pickTranslated(service.value?.shortAnswer, locale.value))
const priceFromLabel = computed(() =>
  service.value?.priceFromCents != null
    ? new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(service.value.priceFromCents / 100)
    : undefined,
)
const warrantyText = computed(() => pickTranslated(service.value?.warranty, locale.value))
const insuranceInfoText = computed(() => pickTranslated(service.value?.insuranceInfo, locale.value))
const hasFacts = computed(() => !!(priceFromLabel.value || service.value?.durationMinutes || warrantyText.value || insuranceInfoText.value))

useSeoMeta({
  title: () => seo.value.metaTitle || pickTranslated(service.value?.title, locale.value),
  description: () => seo.value.metaDescription,
  robots: () => (seo.value.noindex ? 'noindex' : undefined),
})

const localizedPaths = computed(() =>
  service.value
    ? Object.fromEntries(
        Object.entries(service.value.slug)
          .filter(([, s]) => s)
          .map(([code, s]) => [code, localePath(`/services/${s}`, code as never)]),
      )
    : undefined,
)
useLocaleSeo(localizedPaths)
syncContentLocalePaths(localizedPaths)

const { data: organization } = await useFetch('/api/json-ld/organization', { key: 'organization-json-ld' })
useJsonLd(() =>
  service.value
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pickTranslated(service.value.title, locale.value),
        provider: Array.isArray(organization.value) ? organization.value[0] : undefined,
        ...(service.value.priceFromCents != null
          ? { offers: { '@type': 'Offer', price: (service.value.priceFromCents / 100).toFixed(2), priceCurrency: 'EUR' } }
          : {}),
      }
    : null,
)
useBreadcrumbJsonLd(() =>
  service.value
    ? [
        { name: 'Services', path: localePath('/services') },
        { name: pickTranslated(service.value.title, locale.value), path: localePath(`/services/${slug}`) },
      ]
    : undefined,
)
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">{{ pickTranslated(service?.title, locale) }}</h1>
    <p v-if="shortAnswer" class="mt-4 text-lg text-text/80">{{ shortAnswer }}</p>

    <dl v-if="hasFacts" class="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-text/10 p-4 sm:grid-cols-4">
      <div v-if="priceFromLabel">
        <dt class="text-xs uppercase tracking-wide text-text/50">{{ t('servicePage.priceFrom') }}</dt>
        <dd class="font-semibold text-text">{{ priceFromLabel }}</dd>
      </div>
      <div v-if="service?.durationMinutes">
        <dt class="text-xs uppercase tracking-wide text-text/50">{{ t('servicePage.duration') }}</dt>
        <dd class="font-semibold text-text">{{ t('servicePage.durationMinutes', { count: service.durationMinutes }) }}</dd>
      </div>
      <div v-if="warrantyText">
        <dt class="text-xs uppercase tracking-wide text-text/50">{{ t('servicePage.warranty') }}</dt>
        <dd class="font-semibold text-text">{{ warrantyText }}</dd>
      </div>
      <div v-if="insuranceInfoText">
        <dt class="text-xs uppercase tracking-wide text-text/50">{{ t('servicePage.insuranceInfo') }}</dt>
        <dd class="font-semibold text-text">{{ insuranceInfoText }}</dd>
      </div>
    </dl>

    <!-- eslint-disable-next-line vue/no-v-html -- sanitized server-side before storage -->
    <div class="prose mt-6 max-w-none text-text" v-html="pickTranslated(service?.content, locale)" />
  </main>
</template>
