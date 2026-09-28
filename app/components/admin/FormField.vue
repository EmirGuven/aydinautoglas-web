<script setup lang="ts">
defineProps<{ label: string; error?: string; hint?: string; for?: string }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="$props.for" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
