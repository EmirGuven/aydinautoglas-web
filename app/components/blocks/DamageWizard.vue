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
const { locale, t } = useI18n()
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
      <h2 class="font-heading text-fluid-h2 font-bold text-text">{{ pickTranslated(data.heading, locale) }}</h2>
      <p v-if="pickTranslated(data.subheading, locale)" class="mt-3 text-text/70">
        {{ pickTranslated(data.subheading, locale) }}
      </p>
    </div>

    <!-- Step indicator: a row of filled/unfilled dots, one per question, so the visitor
         always has a sense of progress through the wizard. -->
    <div v-if="questions?.length && !result" class="mt-6 flex items-center justify-center gap-2">
      <span
        v-for="(_, index) in questions"
        :key="index"
        class="h-2 w-8 rounded-full transition-colors"
        :class="index <= currentStep ? 'bg-primary' : 'bg-border'"
      />
    </div>

    <div v-if="!questions?.length" class="mt-8 rounded-card border border-dashed border-border p-8 text-center text-sm text-muted">
      {{ t('damageWizard.notConfigured') }}
    </div>

    <div v-else-if="result" class="mt-8 rounded-card border border-border bg-surface p-6 text-center shadow-card">
      <p class="font-heading text-lg font-semibold text-text">
        {{ result.recommendation === 'replace' ? t('damageWizard.replaceTitle') : t('damageWizard.repairTitle') }}
      </p>
      <p class="mt-2 text-text/70">{{ pickTranslated(result.message, locale) }}</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink
          :to="localePath('/appointment')"
          class="inline-flex min-h-12 items-center justify-center rounded-button bg-accent px-6 text-sm font-bold uppercase tracking-wide text-secondary shadow-card"
        >
          {{ t('damageWizard.bookAppointment') }}
        </NuxtLink>
        <button type="button" class="min-h-12 rounded-button border border-border px-6 text-sm" @click="restart">
          {{ t('damageWizard.startOver') }}
        </button>
      </div>
    </div>

    <div v-else-if="currentQuestion" class="mt-8">
      <p class="mb-2 text-center text-xs text-muted">{{ t('damageWizard.questionOf', { current: currentStep + 1, total: questions.length }) }}</p>
      <h3 class="text-center font-heading font-semibold text-text">{{ pickTranslated(currentQuestion.text, locale) }}</h3>
      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          type="button"
          class="min-h-12 rounded-button border border-border px-4 py-3 text-sm transition hover:border-primary disabled:opacity-50"
          :disabled="evaluating"
          @click="selectOption(currentQuestion!.id, option.id)"
        >
          {{ pickTranslated(option.label, locale) }}
        </button>
      </div>
    </div>
  </section>
</template>
