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
const { locale } = useI18n()
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
  <main class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">{{ pickTranslated(location?.name, locale) }}</h1>
    <p class="mt-4 text-text/70">{{ pickTranslated(location?.address, locale) }}</p>
    <p v-if="location?.phone" class="mt-2 text-text/70">{{ location.phone }}</p>
    <p v-if="location?.email" class="mt-2 text-text/70">{{ location.email }}</p>
    <UiLazyMap
      class="mt-6"
      :latitude="location?.latitude"
      :longitude="location?.longitude"
      :label="pickTranslated(location?.name, locale)"
    />
  </main>
</template>
