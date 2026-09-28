<script setup lang="ts">
interface LocationDetail {
  id: string
  slug: Record<string, string>
  name: Record<string, string>
  address: Record<string, string>
  phone?: string
  email?: string
  latitude?: string
  longitude?: string
  openingHours: Record<string, string>
}

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

const { data: location, error } = await useFetch<LocationDetail>(`/api/locations/${slug}`, {
  query: { locale },
  key: () => `location-${locale.value}-${slug}`,
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Branch not found', fatal: true })
}

useSeoMeta({ title: () => pickTranslated(location.value?.name, locale.value) })

const localizedPaths = computed(() =>
  location.value
    ? Object.fromEntries(
        Object.entries(location.value.slug)
          .filter(([, s]) => s)
          .map(([code, s]) => [code, localePath(`/branches/${s}`, code as never)]),
      )
    : undefined,
)
useLocaleSeo(localizedPaths)
syncContentLocalePaths(localizedPaths)

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

useJsonLd(() => {
  if (!location.value) return null
  const openingHoursSpecification = Object.entries(location.value.openingHours)
    .filter(([day, hours]) => DAY_NAMES[day] && hours?.includes('-'))
    .map(([day, hours]) => {
      const [opens, closes] = hours.split('-')
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_NAMES[day], opens, closes }
    })
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: pickTranslated(location.value.name, locale.value),
    address: { '@type': 'PostalAddress', streetAddress: pickTranslated(location.value.address, locale.value) },
    ...(location.value.phone ? { telephone: location.value.phone } : {}),
    ...(location.value.latitude && location.value.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: location.value.latitude, longitude: location.value.longitude } }
      : {}),
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
  }
})
useBreadcrumbJsonLd(() =>
  location.value
    ? [
        { name: 'Branches', path: localePath('/branches') },
        { name: pickTranslated(location.value.name, locale.value), path: localePath(`/branches/${slug}`) },
      ]
    : undefined,
)
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-12">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div class="min-w-0">
        <h1 class="font-heading text-fluid-h1 font-bold text-text">{{ pickTranslated(location?.name, locale) }}</h1>
        <p class="mt-4 text-text/70">{{ pickTranslated(location?.address, locale) }}</p>
        <p v-if="location?.phone" class="mt-2 text-text/70">{{ location.phone }}</p>
        <p v-if="location?.email" class="mt-2 text-text/70">{{ location.email }}</p>
        <UiLazyMap
          class="mt-6"
          :latitude="location?.latitude"
          :longitude="location?.longitude"
          :label="pickTranslated(location?.name, locale)"
        />
      </div>

      <aside class="h-fit rounded-card border border-border bg-surface p-6 shadow-card lg:sticky lg:top-24">
        <p class="font-heading text-lg font-semibold text-text">{{ t('branchPage.ctaHeading') }}</p>
        <a
          v-if="location?.phone"
          :href="`tel:${location.phone}`"
          class="mt-4 flex min-h-12 w-full items-center justify-center rounded-button border border-border px-6 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
        >
          {{ location.phone }}
        </a>
        <NuxtLink
          :to="localePath('/appointment')"
          class="mt-3 flex min-h-12 w-full items-center justify-center rounded-button bg-accent px-6 text-sm font-bold uppercase tracking-wide text-secondary shadow-card transition hover:brightness-105"
        >
          {{ t('branchPage.ctaButton') }}
        </NuxtLink>
      </aside>
    </div>
  </main>
</template>
