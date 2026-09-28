<script setup lang="ts">
import { MessageCircle, Phone, Wrench } from '@lucide/vue'

const { data: settings } = await usePublicSettings()
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="settings?.contact?.phone || settings?.contact?.whatsapp"
    class="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface shadow-elevated sm:hidden"
  >
    <a
      v-if="settings.contact.phone"
      :href="`tel:${settings.contact.phone}`"
      class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-text"
    >
      <Phone class="h-5 w-5 text-primary" aria-hidden="true" />
      {{ t('mobileCta.call') }}
    </a>
    <NuxtLink
      :to="localePath('/appointment')"
      class="flex min-h-14 flex-[1.4] flex-col items-center justify-center gap-0.5 bg-primary text-xs font-semibold text-white"
    >
      <Wrench class="h-5 w-5" aria-hidden="true" />
      {{ t('mobileCta.book') }}
    </NuxtLink>
    <a
      v-if="settings.contact.whatsapp"
      :href="`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`"
      target="_blank"
      rel="noopener"
      class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-text"
    >
      <MessageCircle class="h-5 w-5 text-emerald-600" aria-hidden="true" />
      {{ t('mobileCta.whatsapp') }}
    </a>
  </div>
</template>
