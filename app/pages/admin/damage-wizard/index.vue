<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface OptionRow {
  id: string
  questionId: string
  label: Record<string, string>
  value: { score?: number }
}

interface QuestionRow {
  id: string
  text: Record<string, string>
  sortOrder: number
}

interface RuleRow {
  id: string
  condition: { minScore: number }
  result: { recommendation: 'repair' | 'replace'; message: Record<string, string> }
}

const toast = useToast()
const { t } = useAdminI18n()
const tab = ref<'questions' | 'rules'>('questions')

const { data: questions, refresh: refreshQuestions } = await useFetch<QuestionRow[]>('/api/admin/damage-wizard/questions')
const optionsByQuestion = ref<Record<string, OptionRow[]>>({})

// Fetch all options once via the public wizard config endpoint (already joins options per question).
async function loadAllOptions() {
  const config = await $fetch<(QuestionRow & { options: OptionRow[] })[]>('/api/damage-wizard/config')
  const map: Record<string, OptionRow[]> = {}
  for (const q of config) map[q.id] = q.options
  optionsByQuestion.value = map
}
await loadAllOptions()

const { data: rules, refresh: refreshRules } = await useFetch<RuleRow[]>('/api/admin/damage-wizard/rules')

// Question form
const isQuestionFormOpen = ref(false)
const questionText = ref('')

async function submitQuestion() {
  try {
    await $fetch('/api/admin/damage-wizard/questions', { method: 'POST', body: { text: { de: questionText.value } } })
    toast.success(t('damageWizard.questionAdded'))
    questionText.value = ''
    isQuestionFormOpen.value = false
    await refreshQuestions()
    await loadAllOptions()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.questionAddFailed')))
  }
}

async function deleteQuestion(row: QuestionRow) {
  try {
    await $fetch(`/api/admin/damage-wizard/questions/${row.id}`, { method: 'DELETE' })
    toast.success(t('damageWizard.questionDeleted'))
    await refreshQuestions()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.questionDeleteFailed')))
  }
}

// Option form
const isOptionFormOpen = ref(false)
const optionQuestionId = ref('')
const optionLabel = ref('')
const optionScore = ref(0)

function openAddOption(questionId: string) {
  optionQuestionId.value = questionId
  optionLabel.value = ''
  optionScore.value = 0
  isOptionFormOpen.value = true
}

async function submitOption() {
  try {
    await $fetch('/api/admin/damage-wizard/options', {
      method: 'POST',
      body: { questionId: optionQuestionId.value, label: { de: optionLabel.value }, score: optionScore.value },
    })
    toast.success(t('damageWizard.optionAdded'))
    isOptionFormOpen.value = false
    await loadAllOptions()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.optionAddFailed')))
  }
}

async function deleteOption(row: OptionRow) {
  try {
    await $fetch(`/api/admin/damage-wizard/options/${row.id}`, { method: 'DELETE' })
    toast.success(t('damageWizard.optionDeleted'))
    await loadAllOptions()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.optionDeleteFailed')))
  }
}

// Rule form
const isRuleFormOpen = ref(false)
const ruleMinScore = ref(0)
const ruleRecommendation = ref<'repair' | 'replace'>('repair')
const ruleMessage = ref('')

function openAddRule() {
  ruleMinScore.value = 0
  ruleRecommendation.value = 'repair'
  ruleMessage.value = ''
  isRuleFormOpen.value = true
}

async function submitRule() {
  try {
    await $fetch('/api/admin/damage-wizard/rules', {
      method: 'POST',
      body: { minScore: ruleMinScore.value, recommendation: ruleRecommendation.value, message: { de: ruleMessage.value } },
    })
    toast.success(t('damageWizard.ruleAdded'))
    isRuleFormOpen.value = false
    await refreshRules()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.ruleAddFailed')))
  }
}

async function deleteRule(row: RuleRow) {
  try {
    await $fetch(`/api/admin/damage-wizard/rules/${row.id}`, { method: 'DELETE' })
    toast.success(t('damageWizard.ruleDeleted'))
    await refreshRules()
  } catch (error) {
    toast.error(getErrorMessage(error, t('damageWizard.ruleDeleteFailed')))
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('damageWizard.title') }}</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ t('damageWizard.intro') }}
    </p>

    <div class="mb-4 mt-4 flex gap-1 border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'questions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'"
        @click="tab = 'questions'"
      >
        {{ t('damageWizard.questions') }}
      </button>
      <button
        type="button"
        class="min-h-11 border-b-2 px-3 text-sm font-medium"
        :class="tab === 'rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'"
        @click="tab = 'rules'"
      >
        {{ t('damageWizard.rules') }}
      </button>
    </div>

    <div v-if="tab === 'questions'">
      <div class="mb-4 flex justify-end">
        <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="isQuestionFormOpen = true">
          {{ t('damageWizard.newQuestion') }}
        </button>
      </div>

      <div class="flex flex-col gap-4">
        <div v-for="question in questions" :key="question.id" class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ question.text.de }}</h3>
            <button type="button" class="text-xs text-red-600 underline" @click="deleteQuestion(question)">{{ t('common.delete') }}</button>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div
              v-for="option in optionsByQuestion[question.id] ?? []"
              :key="option.id"
              class="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"
            >
              <span>{{ option.label.de }} <span class="text-xs text-slate-400">({{ t('damageWizard.score').toLowerCase() }}: {{ option.value?.score ?? 0 }})</span></span>
              <button type="button" class="text-xs text-red-600 underline" @click="deleteOption(option)">{{ t('damageWizard.remove') }}</button>
            </div>
            <button type="button" class="w-fit text-xs text-indigo-600 underline" @click="openAddOption(question.id)">
              {{ t('damageWizard.addOption') }}
            </button>
          </div>
        </div>
        <p v-if="!questions?.length" class="text-sm text-slate-400">{{ t('damageWizard.noQuestionsYet') }}</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex justify-end">
        <button type="button" class="min-h-11 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white" @click="openAddRule">
          {{ t('damageWizard.newRule') }}
        </button>
      </div>
      <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
        <div
          v-for="rule in rules"
          :key="rule.id"
          class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
        >
          <span class="text-sm text-slate-700 dark:text-slate-200">
            {{ t('damageWizard.ifTotalScore', { score: rule.condition.minScore }) }}
            <strong>{{ rule.result.recommendation === 'repair' ? t('damageWizard.repair') : t('damageWizard.replace') }}</strong>
            ({{ rule.result.message.de }})
          </span>
          <button type="button" class="text-xs text-red-600 underline" @click="deleteRule(rule)">{{ t('common.delete') }}</button>
        </div>
        <p v-if="!rules?.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('damageWizard.noRulesYet') }}</p>
      </div>
    </div>

    <AdminModal :open="isQuestionFormOpen" :title="t('damageWizard.newQuestion')" @close="isQuestionFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitQuestion">
        <AdminFormField :label="t('damageWizard.questionTextDe')">
          <input v-model="questionText" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white">{{ t('faqs.add') }}</button>
      </form>
    </AdminModal>

    <AdminModal :open="isOptionFormOpen" :title="t('damageWizard.newOption')" @close="isOptionFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitOption">
        <AdminFormField :label="t('damageWizard.labelDe')">
          <input v-model="optionLabel" required class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('damageWizard.score')" :hint="t('damageWizard.scoreHint')">
          <input v-model.number="optionScore" type="number" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white">{{ t('faqs.add') }}</button>
      </form>
    </AdminModal>

    <AdminModal :open="isRuleFormOpen" :title="t('damageWizard.newRule')" @close="isRuleFormOpen = false">
      <form class="flex flex-col gap-4" @submit.prevent="submitRule">
        <AdminFormField :label="t('damageWizard.minScore')">
          <input v-model.number="ruleMinScore" type="number" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
        </AdminFormField>
        <AdminFormField :label="t('damageWizard.recommendation')">
          <select v-model="ruleRecommendation" class="min-h-11 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
            <option value="repair">{{ t('damageWizard.repair') }}</option>
            <option value="replace">{{ t('damageWizard.replace') }}</option>
          </select>
        </AdminFormField>
        <AdminFormField :label="t('damageWizard.messageDe')">
          <textarea v-model="ruleMessage" rows="2" class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
        </AdminFormField>
        <button type="submit" class="min-h-11 rounded-md bg-indigo-600 text-sm font-medium text-white">{{ t('faqs.add') }}</button>
      </form>
    </AdminModal>
  </div>
</template>
