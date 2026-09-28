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

const mobileOpen = ref(false)

function hrefFor(item: MenuItemNode): string {
  return item.linkValue.startsWith('/') ? localePath(item.linkValue) : item.linkValue
}
</script>

<template>
  <header class="border-b border-slate-200 bg-background">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <NuxtLink :to="localePath('/')" class="text-lg font-bold text-text">
        {{ settings?.general?.companyName || 'Company' }}
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
    <div v-if="mobileOpen" class="border-t border-slate-200 sm:hidden">
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
