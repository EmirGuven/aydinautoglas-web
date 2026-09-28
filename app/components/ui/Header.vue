<script setup lang="ts">
interface MenuItemNode {
  id: string
  label: Record<string, string>
  linkType: string
  linkValue: string
  children: MenuItemNode[]
}

const { locale } = useI18n()
const localePath = useLocalePath()
const { data: settings } = await usePublicSettings()
const { data: menu } = await useFetch<MenuItemNode[]>('/api/menus/header', { key: 'header-menu' })

const logoMediaId = computed(() => settings.value?.logo?.logoMediaId)
const { data: logoMedia } = await useAsyncData(
  'header-logo-media',
  (): Promise<Awaited<ReturnType<typeof fetchMediaMap>>> =>
    logoMediaId.value ? fetchMediaMap([logoMediaId.value]) : Promise.resolve({}),
  { watch: [logoMediaId] },
)
const logoUrl = computed(() => mediaUrl(logoMedia.value?.[logoMediaId.value ?? ''], 'medium'))
const logoAlt = computed(() => mediaAlt(logoMedia.value?.[logoMediaId.value ?? ''], locale.value) || settings.value?.general?.companyName || '')

const mobileOpen = ref(false)

function hrefFor(item: MenuItemNode): string {
  return item.linkValue.startsWith('/') ? localePath(item.linkValue) : item.linkValue
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-border bg-surface">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <NuxtLink :to="localePath('/')" class="flex items-center font-heading text-lg font-bold text-text">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="logoAlt"
          width="160"
          height="40"
          class="h-10 w-auto object-contain"
        >
        <span v-else>{{ settings?.general?.companyName || 'Company' }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 sm:flex">
        <NuxtLink
          v-for="item in menu"
          :key="item.id"
          :to="hrefFor(item)"
          class="text-sm font-medium text-text hover:text-primary"
        >
          {{ pickTranslated(item.label, locale) }}
        </NuxtLink>
        <UiLanguageSwitcher />
      </nav>

      <div class="flex items-center gap-2 sm:hidden">
        <UiLanguageSwitcher />
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span class="block h-0.5 w-6 bg-text" />
        </button>
      </div>
    </div>

    <!-- Mobile off-canvas menu -->
    <div v-if="mobileOpen" class="border-t border-border sm:hidden">
      <nav class="flex flex-col px-4 py-2">
        <NuxtLink
          v-for="item in menu"
          :key="item.id"
          :to="hrefFor(item)"
          class="min-h-11 py-2 text-sm font-medium text-text"
          @click="mobileOpen = false"
        >
          {{ pickTranslated(item.label, locale) }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
