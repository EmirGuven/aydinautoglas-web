<script setup lang="ts">
import { CircleAlert } from '@lucide/vue'

defineProps<{ label: string; error?: string; hint?: string; for?: string }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="$props.for" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
    <p v-if="error" class="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
      <CircleAlert class="h-3.5 w-3.5 shrink-0" />
      {{ error }}
    </p>
  </div>
</template>
