<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useAdminI18n()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 v-if="title" class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
          <button
            type="button"
            class="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            :aria-label="t('common.close')"
            @click="emit('close')"
          >
            &times;
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
