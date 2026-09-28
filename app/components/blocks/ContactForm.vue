<script setup lang="ts">
import type { z } from 'zod'
import type { contactFormBlockSchema } from '#shared/schemas/blocks'

const { data } = defineProps<{ data: z.infer<typeof contactFormBlockSchema>['data'] }>()
const { locale, t } = useI18n()
const formId = useId()

const form = reactive({ name: '', email: '', phone: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form, locale: locale.value } })
    submitted.value = true
  } catch {
    error.value = t('contactForm.error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-xl px-4 py-12">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <p v-if="submitted" class="mt-8 rounded-button bg-emerald-50 p-4 text-center text-emerald-700">
      {{ t('contactForm.success') }}
    </p>
    <form v-else class="mt-8 flex flex-col gap-4" @submit.prevent="onSubmit">
      <label :for="`${formId}-name`" class="sr-only">{{ t('contactForm.nameLabel') }}</label>
      <input
        :id="`${formId}-name`"
        v-model="form.name"
        required
        :placeholder="t('contactForm.nameLabel')"
        class="min-h-11 rounded-button border border-slate-300 px-3 text-sm"
      >
      <label :for="`${formId}-email`" class="sr-only">{{ t('contactForm.emailLabel') }}</label>
      <input
        :id="`${formId}-email`"
        v-model="form.email"
        type="email"
        required
        :placeholder="t('contactForm.emailLabel')"
        class="min-h-11 rounded-button border border-slate-300 px-3 text-sm"
      >
      <label :for="`${formId}-phone`" class="sr-only">{{ t('contactForm.phoneLabel') }}</label>
      <input
        :id="`${formId}-phone`"
        v-model="form.phone"
        :placeholder="t('contactForm.phoneLabel')"
        class="min-h-11 rounded-button border border-slate-300 px-3 text-sm"
      >
      <label :for="`${formId}-message`" class="sr-only">{{ t('contactForm.messageLabel') }}</label>
      <textarea
        :id="`${formId}-message`"
        v-model="form.message"
        required
        rows="4"
        :placeholder="t('contactForm.messageLabel')"
        class="rounded-button border border-slate-300 px-3 py-2 text-sm"
      />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button
        type="submit"
        class="min-h-11 rounded-button bg-primary text-sm font-semibold text-white disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? t('contactForm.sending') : t('contactForm.send') }}
      </button>
    </form>
  </section>
</template>
