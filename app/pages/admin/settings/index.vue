<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useAdminI18n()

const tabKeys = ['general', 'contact', 'social', 'seo', 'languages', 'smtp', 'emailTemplates', 'forms', 'cookie', 'analytics', 'robots'] as const
const tabs = computed(() => tabKeys.map((key) => ({ key, label: t(`settings.tabs.${key}`) })))

const activeTab = ref<(typeof tabKeys)[number]>('general')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('settings.title') }}</h1>

    <div class="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium"
        :class="activeTab === tab.key
          ? 'border-primary text-primary'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-6">
      <AdminSettingsGeneralTab v-if="activeTab === 'general'" />
      <AdminSettingsContactTab v-else-if="activeTab === 'contact'" />
      <AdminSettingsSocialTab v-else-if="activeTab === 'social'" />
      <AdminSettingsSeoTab v-else-if="activeTab === 'seo'" />
      <AdminSettingsLanguagesTab v-else-if="activeTab === 'languages'" />
      <AdminSettingsSmtpTab v-else-if="activeTab === 'smtp'" />
      <AdminSettingsEmailTemplatesTab v-else-if="activeTab === 'emailTemplates'" />
      <AdminSettingsFormsTab v-else-if="activeTab === 'forms'" />
      <AdminSettingsCookieTab v-else-if="activeTab === 'cookie'" />
      <AdminSettingsAnalyticsTab v-else-if="activeTab === 'analytics'" />
      <AdminSettingsRobotsTab v-else-if="activeTab === 'robots'" />
    </div>
  </div>
</template>
