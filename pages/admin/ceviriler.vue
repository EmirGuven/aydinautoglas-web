<template>
  <div class="admin-page">
    <div class="admin-page__header">
      <h1>{{ $t('admin.nav.translations') }}</h1>
      <p class="admin-page__subtitle">İçeriğinizin İngilizce ve Türkçe çevirilerini buradan yönetin. Almanca (varsayılan dil) her zaman ana içerik formlarından düzenlenir.</p>
    </div>

    <div class="tr-picker">
      <div class="form-group">
        <label>İçerik Türü</label>
        <select v-model="selectedType" @change="onTypeChange">
          <option value="" disabled>Seçiniz…</option>
          <option v-for="t in contentTypes" :key="t.type" :value="t.type">{{ t.label }}</option>
        </select>
      </div>

      <div class="form-group" v-if="selectedType && items.length">
        <label>Kayıt</label>
        <select v-model.number="selectedId" @change="loadItem">
          <option value="" disabled>Seçiniz…</option>
          <option v-for="item in items" :key="item.id" :value="item.id">{{ item.title }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="admin-loading">Yükleniyor…</div>

    <div v-else-if="fields.length" class="tr-editor">
      <div class="tr-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.code"
          type="button"
          class="tr-tab"
          :class="{ 'tr-tab--active': activeTab === tab.code }"
          @click="activeTab = tab.code"
        >
          {{ tab.flag }} {{ tab.label }}
        </button>
      </div>

      <div v-for="field in fields" :key="field" class="tr-field">
        <label class="tr-field__label">{{ field }}</label>
        <textarea
          v-if="activeTab === 'de'"
          :value="localeValues.de?.[field] || ''"
          rows="2"
          disabled
          class="tr-textarea tr-textarea--readonly"
        />
        <textarea
          v-else
          v-model="draft[field]"
          rows="2"
          class="tr-textarea"
          :placeholder="localeValues.de?.[field] || ''"
        />
      </div>

      <div v-if="activeTab !== 'de'" class="tr-actions">
        <button class="btn-admin-primary" :disabled="saving" @click="save">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
        <span v-if="saved" class="tr-saved">✓ Kaydedildi</span>
      </div>
    </div>

    <p v-else-if="selectedType && !items.length" class="admin-empty">Bu türde henüz kayıt yok.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface ContentTypeRow { type: string; label: string; listable: boolean }
interface ItemRow { id: number; title: string }

const { data: contentTypesData } = await useFetch<ContentTypeRow[]>('/api/admin/translations', {
  headers: useRequestHeaders(['cookie'])
})
const contentTypes = computed(() => contentTypesData.value || [])

const selectedType = ref('')
const selectedId = ref<number | ''>('')
const items = ref<ItemRow[]>([])
const fields = ref<string[]>([])
const localeValues = ref<Record<string, Record<string, string>>>({})
const draft = reactive<Record<string, string>>({})
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)

const tabs = [
  { code: 'de', label: 'Almanca (Kaynak)', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
]
const activeTab = ref('en')

async function onTypeChange() {
  selectedId.value = ''
  fields.value = []
  items.value = []
  if (!selectedType.value) return
  const list = await $fetch<ItemRow[]>('/api/admin/translations', { query: { type: selectedType.value } })
  items.value = list
  if (list.length === 1) {
    selectedId.value = list[0].id
    await loadItem()
  }
}

async function loadItem() {
  if (!selectedType.value || !selectedId.value) return
  loading.value = true
  saved.value = false
  try {
    const res = await $fetch<{ fields: string[]; locales: Record<string, Record<string, string>> }>(
      '/api/admin/translations',
      { query: { type: selectedType.value, id: selectedId.value } }
    )
    fields.value = res.fields
    localeValues.value = res.locales
    for (const f of fields.value) {
      draft[f] = res.locales[activeTab.value]?.[f] || ''
    }
  } finally {
    loading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'de') return
  for (const f of fields.value) {
    draft[f] = localeValues.value[tab]?.[f] || ''
  }
})

async function save() {
  if (!selectedType.value || !selectedId.value) return
  saving.value = true
  saved.value = false
  try {
    const values: Record<string, string> = {}
    for (const f of fields.value) values[f] = draft[f] || ''
    await $fetch('/api/admin/translations', {
      method: 'PUT',
      query: { type: selectedType.value, id: selectedId.value },
      body: { locale: activeTab.value, values },
    })
    if (!localeValues.value[activeTab.value]) localeValues.value[activeTab.value] = {}
    Object.assign(localeValues.value[activeTab.value], values)
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.tr-picker {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  max-width: 640px;
}
.tr-picker .form-group { flex: 1; min-width: 220px; }
.tr-editor {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 820px;
}
.tr-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}
.tr-tab {
  padding: 0.45rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}
.tr-tab--active { background: #1a2b4a; color: #fff; border-color: #1a2b4a; }
.tr-field { margin-bottom: 1rem; }
.tr-field__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #6b7280;
  margin-bottom: 0.3rem;
}
.tr-textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}
.tr-textarea--readonly { background: #f9fafb; color: #6b7280; }
.tr-actions { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
.tr-saved { color: #16a34a; font-size: 0.85rem; font-weight: 600; }
</style>
