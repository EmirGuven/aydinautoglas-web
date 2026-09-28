<script setup lang="ts">
import { KNOWN_AI_BOTS } from '#shared/constants/ai-bots'

const toast = useToast()
const { t } = useAdminI18n()
const { value, loading, saving, load, save } = useSetting('robots', {
  extraRules: '',
  botRules: {} as Record<string, 'allow' | 'disallow'>,
})

onMounted(load)

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
  <form v-if="!loading" class="flex max-w-2xl flex-col gap-4" @submit.prevent="onSave">
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ t('settings.robots.intro') }}
    </p>

    <div>
      <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('settings.robots.aiBots') }}</p>
      <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div
          v-for="bot in KNOWN_AI_BOTS"
          :key="bot"
          class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2 last:border-b-0 dark:border-slate-700 dark:bg-slate-800"
        >
          <span class="font-mono text-sm text-slate-700 dark:text-slate-200">{{ bot }}</span>
          <select
            :value="value.botRules[bot] ?? 'default'"
            class="min-h-9 rounded-md border border-slate-300 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            @change="(e) => {
              const v = (e.target as HTMLSelectElement).value
              if (v === 'default') delete value.botRules[bot]
              else value.botRules[bot] = v as 'allow' | 'disallow'
            }"
          >
            <option value="default">{{ t('settings.robots.default') }}</option>
            <option value="allow">{{ t('settings.robots.allow') }}</option>
            <option value="disallow">{{ t('settings.robots.disallow') }}</option>
          </select>
        </div>
      </div>
    </div>

    <AdminFormField :label="t('settings.robots.extraRules')">
      <textarea
        v-model="value.extraRules"
        rows="8"
        class="rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </AdminFormField>
    <p class="text-xs text-slate-400">
      {{ t('settings.robots.preview') }} <a href="/robots.txt" target="_blank" class="text-indigo-600 underline">/robots.txt</a>
    </p>
    <button type="submit" class="min-h-11 w-fit rounded-md bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60" :disabled="saving">
      {{ saving ? t('common.saving') : t('common.save') }}
    </button>
  </form>
</template>
