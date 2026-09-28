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
const { data: menu } = await useFetch<MenuItemNode[]>('/api/menus/footer', { key: 'footer-menu' })

function hrefFor(item: MenuItemNode): string {
  return item.linkValue.startsWith('/') ? localePath(item.linkValue) : item.linkValue
}
</script>

<template>
  <footer class="border-t border-white/10 bg-secondary py-10 text-white">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:justify-between">
      <div>
        <p class="font-heading text-lg font-bold">{{ settings?.general?.companyName || 'Company' }}</p>
        <p v-if="settings?.contact?.phone" class="mt-2 text-sm opacity-80">{{ settings.contact.phone }}</p>
        <p v-if="settings?.contact?.email" class="text-sm opacity-80">{{ settings.contact.email }}</p>
      </div>
      <nav class="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <NuxtLink
          v-for="item in menu"
          :key="item.id"
          :to="hrefFor(item)"
          class="text-sm opacity-80 hover:opacity-100"
        >
          {{ pickTranslated(item.label, locale) }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
