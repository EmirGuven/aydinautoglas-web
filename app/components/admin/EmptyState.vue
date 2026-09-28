<script setup lang="ts">
import { Inbox } from '@lucide/vue'

withDefaults(defineProps<{ message: string, icon?: unknown }>(), { icon: () => Inbox })
</script>

<template>
  <div class="flex flex-col items-center gap-2 px-4 py-10 text-center">
    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
      <component :is="icon" class="h-5 w-5" />
    </span>
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
  </div>
</template>
