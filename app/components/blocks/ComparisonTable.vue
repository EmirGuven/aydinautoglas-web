<script setup lang="ts">
import type { z } from 'zod'
import type { comparisonTableBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof comparisonTableBlockSchema>['data'] }>()
const { locale } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>
    <div v-if="data.rows.length" class="mt-8 overflow-x-auto">
      <table class="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-text/10">
            <th class="py-3 pr-4 font-semibold text-text" />
            <th v-for="(column, index) in data.columns" :key="index" class="px-4 py-3 font-semibold text-text">
              {{ pickTranslated(column, locale) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in data.rows" :key="rowIndex" class="border-b border-text/10">
            <td class="py-3 pr-4 font-medium text-text">{{ pickTranslated(row.label, locale) }}</td>
            <td v-for="(_, colIndex) in data.columns" :key="colIndex" class="px-4 py-3 text-text/80">
              {{ pickTranslated(row.cells[colIndex], locale) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
