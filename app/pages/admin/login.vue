<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login } = useAuth()
// No logged-in user yet on this page, so useAdminI18n() falls back to 'de' — there's no
// per-user preference to read before they've authenticated.
const { t } = useAdminI18n()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    await router.push(redirect)
  } catch {
    error.value = t('login.invalidCredentials')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h1 class="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">{{ t('login.title') }}</h1>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <AdminFormField :label="t('login.email')" for="email">
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
      </AdminFormField>
      <AdminFormField :label="t('login.password')" for="password" :error="error">
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
      </AdminFormField>
      <button
        type="submit"
        class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? t('login.signingIn') : t('login.signIn') }}
      </button>
    </form>
  </div>
</template>
