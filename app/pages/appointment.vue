<script setup lang="ts">
interface ServiceOption {
  id: string
  title: Record<string, string>
}
interface LocationOption {
  id: string
  name: Record<string, string>
}

const { locale } = useI18n()
useSeoMeta({ title: () => 'Book an appointment' })
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
    error.value = getErrorMessage(err, 'Something went wrong. Please try again.')
  } finally {
    submitting.value = false
  }
}

const inputClass = 'min-h-11 rounded-button border border-slate-300 px-3 text-sm'
</script>

<template>
  <main class="mx-auto max-w-xl px-4 py-12">
    <h1 class="text-3xl font-bold text-text">Book an appointment</h1>

    <p v-if="submitted" class="mt-8 rounded-button bg-emerald-50 p-6 text-center text-emerald-700">
      Thank you! We received your request and will be in touch shortly.
    </p>

    <form v-else class="mt-8" @submit.prevent="step === STEPS.length - 1 ? submit() : next()">
      <p class="mb-4 text-xs text-text/50">Step {{ step + 1 }} / {{ STEPS.length }}</p>

      <div v-if="STEPS[step] === 'vehicle'" class="flex flex-col gap-4">
        <h2 class="font-semibold text-text">Your vehicle</h2>
        <input v-model="form.vehicleMake" placeholder="Make" :class="inputClass">
        <input v-model="form.vehicleModel" placeholder="Model" :class="inputClass">
        <input v-model="form.vehicleYear" placeholder="Year" :class="inputClass">
        <input v-model="form.licensePlate" placeholder="License plate (optional)" :class="inputClass">
      </div>

      <div v-else-if="STEPS[step] === 'service'" class="flex flex-col gap-4">
        <h2 class="font-semibold text-text">Service &amp; branch</h2>
        <select v-model="form.serviceId" :class="inputClass">
          <option value="">Select a service</option>
          <option v-for="s in services" :key="s.id" :value="s.id">{{ pickTranslated(s.title, locale) }}</option>
        </select>
        <select v-model="form.locationId" :class="inputClass">
          <option value="">Select a branch</option>
          <option v-for="l in locationOptions" :key="l.id" :value="l.id">{{ pickTranslated(l.name, locale) }}</option>
        </select>
      </div>

      <div v-else-if="STEPS[step] === 'schedule'" class="flex flex-col gap-4">
        <h2 class="font-semibold text-text">Preferred date &amp; time</h2>
        <input v-model="form.preferredDate" type="date" :class="inputClass">
        <input v-model="form.preferredTime" type="time" :class="inputClass">
      </div>

      <div v-else-if="STEPS[step] === 'insurance'" class="flex flex-col gap-4">
        <h2 class="font-semibold text-text">Insurance (optional)</h2>
        <input v-model="form.insuranceCompany" placeholder="Insurance company" :class="inputClass">
        <input v-model="form.insuranceNumber" placeholder="Policy number" :class="inputClass">
      </div>

      <div v-else class="flex flex-col gap-4">
        <h2 class="font-semibold text-text">Your contact details</h2>
        <input v-model="form.contactName" required placeholder="Name" :class="inputClass">
        <input v-model="form.contactEmail" required type="email" placeholder="Email" :class="inputClass">
        <input v-model="form.contactPhone" placeholder="Phone" :class="inputClass">
        <input v-model="form.companyWebsite" type="text" class="hidden" tabindex="-1" autocomplete="off">
        <label class="flex items-start gap-2 text-sm text-text/70">
          <input v-model="form.consent" required type="checkbox" class="mt-1">
          I agree that my data will be processed to handle my appointment request (DSGVO).
        </label>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

      <div class="mt-8 flex justify-between">
        <button v-if="step > 0" type="button" class="min-h-11 rounded-button border border-slate-300 px-4 text-sm" @click="back">
          Back
        </button>
        <span v-else />
        <button type="submit" class="min-h-11 rounded-button bg-primary px-6 text-sm font-semibold text-white disabled:opacity-60" :disabled="submitting">
          {{ step === STEPS.length - 1 ? (submitting ? 'Sending...' : 'Submit') : 'Next' }}
        </button>
      </div>
    </form>
  </main>
</template>
