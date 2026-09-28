<script setup lang="ts">
import type { z } from 'zod'
import type { richTextBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof richTextBlockSchema>['data'] }>()
const { locale } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12">
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized server-side before storage (server/services/pages.service.ts) -->
    <div class="prose max-w-none text-text" v-html="pickTranslated(data.content, locale)" />
  </section>
</template>
