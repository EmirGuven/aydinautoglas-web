<script setup lang="ts">
import type { z } from 'zod'
import type { damageWizardBlockSchema } from '#shared/schemas/blocks'

interface OptionRow {
  id: string
  label: Record<string, string>
}
interface QuestionRow {
  id: string
  text: Record<string, string>
  options: OptionRow[]
}
interface EvaluationResult {
  recommendation: 'repair' | 'replace'
  message: Record<string, string>
}

const { data } = defineProps<{ data: z.infer<typeof damageWizardBlockSchema>['data'] }>()
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: questions } = await useFetch<QuestionRow[]>('/api/damage-wizard/config')

const currentStep = ref(0)
const answers = ref<Record<string, string>>({})
const result = ref<EvaluationResult | null>(null)
const evaluating = ref(false)

const currentQuestion = computed(() => questions.value?.[currentStep.value])
const isLastStep = computed(() => currentStep.value === (questions.value?.length ?? 0) - 1)

async function selectOption(questionId: string, optionId: string) {
  answers.value[questionId] = optionId

  if (isLastStep.value) {
    evaluating.value = true
    try {
      const payload = Object.entries(answers.value).map(([qId, oId]) => ({ questionId: qId, optionId: oId }))
      result.value = await $fetch<EvaluationResult>('/api/damage-wizard/evaluate', { method: 'POST', body: payload })
    } finally {
      evaluating.value = false
    }
  } else {
    currentStep.value += 1
  }
}

function restart() {
  currentStep.value = 0
  answers.value = {}
  result.value = null
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-12">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-text sm:text-3xl">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <div v-if="!questions?.length" class="mt-8 rounded-button border border-dashed border-slate-300 p-8 text-center text-sm text-text/50">
      The wizard has not been configured yet.
    </div>

    <div v-else-if="result" class="mt-8 rounded-button border border-slate-200 p-6 text-center">
      <p class="text-lg font-semibold text-text">
        {{ result.recommendation === 'replace' ? 'Windshield replacement recommended' : 'Repair should be sufficient' }}
      </p>
      <p class="mt-2 text-text/70">{{ pickTranslated(result.message, locale) }}</p>
      <div class="mt-6 flex justify-center gap-3">
        <NuxtLink
          :to="localePath('/appointment')"
          class="inline-flex min-h-11 items-center justify-center rounded-button bg-primary px-6 text-sm font-semibold text-white"
        >
          Book appointment
        </NuxtLink>
        <button type="button" class="min-h-11 rounded-button border border-slate-300 px-6 text-sm" @click="restart">
          Start over
        </button>
      </div>
    </div>

    <div v-else-if="currentQuestion" class="mt-8">
      <p class="mb-2 text-center text-xs text-text/50">Question {{ currentStep + 1 }} / {{ questions.length }}</p>
      <h3 class="text-center font-semibold text-text">{{ pickTranslated(currentQuestion.text, locale) }}</h3>
      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          type="button"
          class="min-h-11 rounded-button border border-slate-300 px-4 py-3 text-sm hover:border-primary disabled:opacity-50"
          :disabled="evaluating"
          @click="selectOption(currentQuestion!.id, option.id)"
        >
          {{ pickTranslated(option.label, locale) }}
        </button>
      </div>
    </div>
  </section>
</template>
