<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
    danger?: boolean
  }>(),
  { title: undefined, confirmLabel: undefined, danger: false },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const { t } = useAdminI18n()

const resolvedTitle = computed(() => props.title ?? t('common.areYouSure'))
const resolvedConfirmLabel = computed(() => props.confirmLabel ?? t('common.confirm'))
</script>

<template>
  <AdminModal :open="open" :title="resolvedTitle" @close="emit('cancel')">
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
    <div class="mt-6 flex justify-end gap-3">
      <button
        type="button"
        class="min-h-11 rounded-md px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="button"
        class="min-h-11 rounded-md px-4 text-sm font-medium text-white"
        :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:opacity-90'"
        @click="emit('confirm')"
      >
        {{ resolvedConfirmLabel }}
      </button>
    </div>
  </AdminModal>
</template>
