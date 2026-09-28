export function useSetting<T extends Record<string, unknown>>(key: string, defaults: T) {
  const value = reactive({ ...defaults }) as T
  const loading = ref(true)
  const saving = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await $fetch<Partial<T>>(`/api/admin/settings/${key}`)
      Object.assign(value, defaults, data)
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      await $fetch(`/api/admin/settings/${key}`, { method: 'PUT', body: value })
    } finally {
      saving.value = false
    }
  }

  return { value, loading, saving, load, save }
}
