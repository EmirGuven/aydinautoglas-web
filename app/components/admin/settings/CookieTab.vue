<script setup lang="ts">
const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('cookieBanner', {
  text: {} as Record<string, string>,
  categories: ['necessary'] as string[],
})

const ALL_CATEGORIES = ['necessary', 'functional', 'analytics', 'marketing'] as const

onMounted(load)

function toggleCategory(category: string) {
  if (category === 'necessary') return // always required
  if (value.categories.includes(category)) {
    value.categories = value.categories.filter((c) => c !== category)
  } else {
    value.categories = [...value.categories, category]
  }
}

async function onSave() {
  try {
    await save()
    toast.success(t('common.saved'))
  } catch (error) {
    toast.error(getErrorMessage(error, t('common.saveFailed')))
  }
}
</script>

<template>
  <form v-if="!loading" class="flex max-w-lg flex-col gap-4" @submit.prevent="onSave">
    <AdminFormField :label="t('settings.cookie.bannerTextDe')">
      <textarea
        v-model="value.text.de"
        rows="3"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </AdminFormField>
    <AdminFormField :label="t('settings.cookie.categoriesOffered')">
      <div class="flex flex-col gap-2">
        <label v-for="category in ALL_CATEGORIES" :key="category" class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            :checked="value.categories.includes(category)"
            :disabled="category === 'necessary'"
            @change="toggleCategory(category)"
          >
          {{ t(`settings.cookie.categories.${category}`) }}
        </label>
      </div>
    </AdminFormField>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-primary px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
