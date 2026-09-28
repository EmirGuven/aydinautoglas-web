<script setup lang="ts">
interface ServiceOption {
  id: string
  title: Record<string, string>
}
interface LocationOption {
  id: string
  name: Record<string, string>
}

const { locale, t } = useI18n()
useSeoMeta({ title: () => t('appointmentForm.title') })
useLocaleSeo()

const { data: services } = await useFetch<ServiceOption[]>('/api/content/services', { query: { limit: 100 } })
const { data: locationOptions } = await useFetch<LocationOption[]>('/api/content/locations')

const STEPS = ['vehicle', 'service', 'schedule', 'insurance', 'contact'] as const
const step = ref(0)

const form = reactive({
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  licensePlate: '',
  serviceId: '',
  locationId: '',
  preferredDate: '',
  preferredTime: '',
  insuranceCompany: '',
  insuranceNumber: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  consent: false,
  companyWebsite: '', // honeypot, left empty by real users
})

const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

function next() {
  if (step.value < STEPS.length - 1) step.value += 1
}
function back() {
  if (step.value > 0) step.value -= 1
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/appointments', { method: 'POST', body: { ...form, locale: locale.value } })
    submitted.value = true
  } catch (err) {
    error.value = getErrorMessage(err, t('appointmentForm.error'))
  } finally {
    submitting.value = false
  }
}

const inputClass = 'min-h-12 rounded-button border border-border bg-surface px-3 text-sm text-text'
</script>

<template>
  <main class="bg-secondary/5 px-4 py-12">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-center font-heading text-fluid-h1 font-bold text-text">{{ t('appointmentForm.title') }}</h1>

      <p v-if="submitted" class="mt-8 rounded-card border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700">
        {{ t('appointmentForm.success') }}
      </p>

      <form
        v-else
        class="mt-8 rounded-card border border-border bg-surface p-6 shadow-card sm:p-8"
        @submit.prevent="step === STEPS.length - 1 ? submit() : next()"
      >
      <!-- Step indicator: progress bar + numeric label, so the form never feels like an
           open-ended list of questions. -->
      <div class="mb-6">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div class="h-full rounded-full bg-primary transition-[width]" :style="{ width: `${((step + 1) / STEPS.length) * 100}%` }" />
        </div>
        <p class="mt-2 text-xs text-muted">{{ t('appointmentForm.stepOf', { current: step + 1, total: STEPS.length }) }}</p>
      </div>

      <div v-if="STEPS[step] === 'vehicle'" class="flex flex-col gap-4">
        <h2 class="font-heading font-semibold text-text">{{ t('appointmentForm.stepVehicle') }}</h2>
        <input v-model="form.vehicleMake" :placeholder="t('appointmentForm.make')" :class="inputClass">
        <input v-model="form.vehicleModel" :placeholder="t('appointmentForm.model')" :class="inputClass">
        <input v-model="form.vehicleYear" :placeholder="t('appointmentForm.year')" :class="inputClass">
        <input v-model="form.licensePlate" :placeholder="t('appointmentForm.licensePlate')" :class="inputClass">
      </div>

      <div v-else-if="STEPS[step] === 'service'" class="flex flex-col gap-4">
        <h2 class="font-heading font-semibold text-text">{{ t('appointmentForm.stepService') }}</h2>
        <select v-model="form.serviceId" :class="inputClass">
          <option value="">{{ t('appointmentForm.selectService') }}</option>
          <option v-for="s in services" :key="s.id" :value="s.id">{{ pickTranslated(s.title, locale) }}</option>
        </select>
        <select v-model="form.locationId" :class="inputClass">
          <option value="">{{ t('appointmentForm.selectBranch') }}</option>
          <option v-for="l in locationOptions" :key="l.id" :value="l.id">{{ pickTranslated(l.name, locale) }}</option>
        </select>
      </div>

      <div v-else-if="STEPS[step] === 'schedule'" class="flex flex-col gap-4">
        <h2 class="font-heading font-semibold text-text">{{ t('appointmentForm.stepSchedule') }}</h2>
        <input v-model="form.preferredDate" type="date" :class="inputClass">
        <input v-model="form.preferredTime" type="time" :class="inputClass">
      </div>

      <div v-else-if="STEPS[step] === 'insurance'" class="flex flex-col gap-4">
        <h2 class="font-heading font-semibold text-text">{{ t('appointmentForm.stepInsurance') }}</h2>
        <input v-model="form.insuranceCompany" :placeholder="t('appointmentForm.insuranceCompany')" :class="inputClass">
        <input v-model="form.insuranceNumber" :placeholder="t('appointmentForm.policyNumber')" :class="inputClass">
      </div>

      <div v-else class="flex flex-col gap-4">
        <h2 class="font-heading font-semibold text-text">{{ t('appointmentForm.stepContact') }}</h2>
        <input v-model="form.contactName" required :placeholder="t('appointmentForm.name')" :class="inputClass">
        <input v-model="form.contactEmail" required type="email" :placeholder="t('appointmentForm.email')" :class="inputClass">
        <input v-model="form.contactPhone" :placeholder="t('appointmentForm.phone')" :class="inputClass">
        <input v-model="form.companyWebsite" type="text" class="hidden" tabindex="-1" autocomplete="off">
        <label class="flex items-start gap-2 text-sm text-text/70">
          <input v-model="form.consent" required type="checkbox" class="mt-1">
          {{ t('appointmentForm.consent') }}
        </label>
      </div>

      <p v-if="error" class="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-8 flex justify-between">
        <button v-if="step > 0" type="button" class="min-h-12 rounded-button border border-border px-4 text-sm" @click="back">
          {{ t('appointmentForm.back') }}
        </button>
        <span v-else />
        <button type="submit" class="min-h-12 rounded-button bg-accent px-6 text-sm font-bold uppercase tracking-wide text-secondary shadow-card disabled:opacity-60" :disabled="submitting">
          {{ step === STEPS.length - 1 ? (submitting ? t('appointmentForm.sending') : t('appointmentForm.submit')) : t('appointmentForm.next') }}
        </button>
      </div>
      </form>
    </div>
  </main>
</template>
