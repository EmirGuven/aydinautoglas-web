<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({ robots: 'noindex, nofollow' })

function handleRetry() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-text">
    <UiHeader />
    <main class="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p class="text-sm font-semibold text-primary">{{ props.error.statusCode }}</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">
        {{ props.error.statusCode === 404 ? t('errorPage.notFoundTitle') : t('errorPage.genericTitle') }}
      </h1>
      <p class="mt-4 max-w-md text-text/70">
        {{ props.error.statusCode === 404 ? t('errorPage.notFoundBody') : t('errorPage.genericBody') }}
      </p>
      <button
        type="button"
        class="mt-8 min-h-11 rounded-button bg-primary px-6 text-sm font-semibold text-white"
        @click="handleRetry"
      >
        {{ t('errorPage.backToHome') }}
      </button>
    </main>
    <UiFooter />
  </div>
</template>
