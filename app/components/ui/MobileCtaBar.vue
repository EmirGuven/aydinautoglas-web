<script setup lang="ts">
const { data: settings } = await usePublicSettings()
const localePath = useLocalePath()
</script>

<template>
  <div
    v-if="settings?.contact?.phone || settings?.contact?.whatsapp"
    class="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-background sm:hidden"
  >
    <a
      v-if="settings.contact.phone"
      :href="`tel:${settings.contact.phone}`"
      class="flex min-h-14 flex-1 items-center justify-center text-sm font-semibold text-text"
    >
      Call
    </a>
    <NuxtLink
      :to="localePath('/appointment')"
      class="flex min-h-14 flex-1 items-center justify-center bg-primary text-sm font-semibold text-white"
    >
      Book appointment
    </NuxtLink>
    <a
      v-if="settings.contact.whatsapp"
      :href="`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`"
      target="_blank"
      rel="noopener"
      class="flex min-h-14 flex-1 items-center justify-center text-sm font-semibold text-emerald-600"
    >
      WhatsApp
    </a>
  </div>
</template>
