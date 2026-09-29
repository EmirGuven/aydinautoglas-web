<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue"
import { siteMeta } from "../data/site"
import { usePageSeo } from "../composables/usePageSeo"
import { buildPageCtaBackgroundStyle } from "../utils/page-cta"

interface ContactData {
  heroEyebrow: string; heroTitle: string; heroLead: string; heroBgImage: string
  infoTitle: string; infoLead: string
  formTitle: string; formLead: string
  ctaTitle: string; ctaLead: string; ctaBgImage: string
  ctaPrimaryLabel: string; ctaPrimaryUrl: string
  ctaSecondaryLabel: string; ctaSecondaryUrl: string
  email: string
}

const { data: contact } = await useFetch<ContactData>('/api/contact')

usePageSeo({
  title: "Kontakt & Terminanfrage – Aydin Autoglas",
  description: contact.value?.heroLead || "Kontaktieren Sie Aydin Autoglas für Steinschlagreparatur, Scheibenaustausch und mobilen Service.",
  path: "/kontakt"
})

// Canlı site ayarları
const s = useState<any>('siteSettings')
const phone        = computed(() => s.value?.phone        || siteMeta.phone)
const phoneDisplay = computed(() => s.value?.phoneDisplay || s.value?.phone || siteMeta.phoneDisplay)
const email        = computed(() => contact.value?.email || s.value?.email || siteMeta.email)
const extraPhones  = computed(() => Array.isArray(s.value?.extraPhones) ? s.value.extraPhones : [])
const extraEmails  = computed(() => Array.isArray(s.value?.extraEmails) ? s.value.extraEmails : [])
const mapsUrl      = computed(() => s.value?.mapsUrl      || siteMeta.mapsUrl)
const workingHours = computed(() => s.value?.workingHours || siteMeta.workingHours)
const street       = computed(() => s.value?.address?.street || siteMeta.address.street)
const region       = computed(() => s.value?.address?.region || siteMeta.address.region)
const city         = computed(() => s.value?.address?.city   || siteMeta.address.city)
const instagram    = computed(() => s.value?.social?.[0]     || siteMeta.social[0])
const linkedin     = computed(() => s.value?.social?.[1]     || siteMeta.social[1])

const contactCtaStyle = computed(() => buildPageCtaBackgroundStyle(contact.value?.ctaBgImage))
const mapsEmbedUrl = computed(() =>
  `https://www.google.com/maps?q=${encodeURIComponent(`${street.value} ${region.value} ${city.value}`)}&output=embed`
)

const runtimeConfig = useRuntimeConfig()
const turnstileSiteKey = String(runtimeConfig.public.turnstileSiteKey || "")
const turnstileEnabled = computed(() => Boolean(turnstileSiteKey))
const turnstileToken = ref("")

if (turnstileEnabled.value) {
  useHead({
    script: [
      {
        src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
        async: true,
        defer: true,
      },
    ],
  })
}

onMounted(() => {
  if (!turnstileEnabled.value || !process.client) return
  ;(window as any).onTurnstileSuccess = (token: string) => {
    turnstileToken.value = token
  }
  ;(window as any).onTurnstileExpired = () => {
    turnstileToken.value = ""
  }
})

onBeforeUnmount(() => {
  if (!process.client) return
  if ((window as any).onTurnstileSuccess) delete (window as any).onTurnstileSuccess
  if ((window as any).onTurnstileExpired) delete (window as any).onTurnstileExpired
})

const form = reactive({
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
  website: "",
  form_started_at: Date.now(),
  // Schaden-Assistent
  glassType: "" as "" | "windschutzscheibe" | "andere",
  damageExtent: "" as "" | "steinschlag" | "groesser",
  damageLocation: "" as "" | "sichtfeld" | "ausserhalb",
  // Termin
  preferredDate: "",
  preferredTime: "",
  // Fahrzeug
  licensePlate: "",
  insuranceCompany: "",
  vin: "",
  additionalService: "werkstatt" as "werkstatt" | "mobil",
  referralSource: "",
})

const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
const todayIso = new Date().toISOString().slice(0, 10)

const insuranceOptions = [
  "ADAC", "Allianz", "AXA", "Barmenia", "Continentale", "Debeka", "DEVK",
  "ERGO", "Generali", "Gothaer", "HUK-COBURG", "HUK24", "LVM", "Nürnberger",
  "Provinzial", "R+V Versicherung", "Signal Iduna", "Sparkassen-Versicherung",
  "VHV", "Württembergische", "WGV", "Zurich", "Andere / nicht gelistet",
]

const diagnosis = computed<'repair' | 'replace' | null>(() => {
  if (form.glassType === 'andere') return 'replace'
  if (form.glassType === 'windschutzscheibe') {
    if (form.damageExtent === 'groesser') return 'replace'
    if (form.damageExtent === 'steinschlag') {
      if (form.damageLocation === 'sichtfeld') return 'replace'
      if (form.damageLocation === 'ausserhalb') return 'repair'
    }
  }
  return null
})

const stepOrder = computed(() => {
  const arr: string[] = ['glass']
  if (form.glassType === 'windschutzscheibe') {
    arr.push('extent')
    if (form.damageExtent === 'steinschlag') arr.push('location')
    if (form.damageExtent) arr.push('diagnosis')
  } else if (form.glassType === 'andere') {
    arr.push('diagnosis')
  }
  arr.push('schedule', 'contact', 'vehicle', 'extra', 'message')
  return arr
})

const step = ref('glass')
const stepIndex = computed(() => Math.max(0, stepOrder.value.indexOf(step.value)))
const progress = computed(() => Math.round((stepIndex.value / (stepOrder.value.length - 1)) * 100))

function goTo(target: string) {
  step.value = target
  if (process.client) window.scrollTo({ top: document.querySelector('.contact-form-card')?.getBoundingClientRect().top ? window.scrollY + (document.querySelector('.contact-form-card') as HTMLElement).getBoundingClientRect().top - 24 : 0, behavior: 'smooth' })
}

function next() {
  const order = stepOrder.value
  const i = order.indexOf(step.value)
  if (i >= 0 && i < order.length - 1) goTo(order[i + 1])
}

function back() {
  const order = stepOrder.value
  const i = order.indexOf(step.value)
  if (i > 0) goTo(order[i - 1])
}

const canContinue = computed(() => {
  switch (step.value) {
    case 'glass': return !!form.glassType
    case 'extent': return !!form.damageExtent
    case 'location': return !!form.damageLocation
    case 'diagnosis': return true
    case 'schedule': return !!form.preferredDate && !!form.preferredTime
    case 'contact': return !!form.name && !!form.email
    case 'vehicle': return !!form.licensePlate
    case 'extra': return true
    default: return true
  }
})

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''

  if (turnstileEnabled.value && !turnstileToken.value) {
    submitting.value = false
    submitError.value = 'Bitte bestätigen Sie die Sicherheitsprüfung.'
    return
  }

  const damageParts = [
    form.glassType === 'andere' ? 'Andere Scheibe' : 'Windschutzscheibe',
    form.damageExtent === 'steinschlag' ? 'Steinschlag' : (form.damageExtent === 'groesser' ? 'Größerer Schaden' : ''),
    form.damageLocation === 'sichtfeld' ? 'im Sichtfeld' : (form.damageLocation === 'ausserhalb' ? 'außerhalb des Sichtfelds' : ''),
  ].filter(Boolean).join(' · ')

  try {
    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        service: form.service || damageParts,
        message: form.message,
        website: form.website,
        form_started_at: form.form_started_at,
        turnstile_token: turnstileToken.value,
        glassType: form.glassType,
        damageExtent: form.damageExtent,
        damageLocation: form.damageLocation,
        licensePlate: form.licensePlate,
        insuranceCompany: form.insuranceCompany,
        vin: form.vin,
        additionalService: form.additionalService,
        referralSource: form.referralSource,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
      },
    })
    submitted.value = true
  } catch (err: any) {
    submitError.value = err?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hakkimda-hero">
      <img
        v-if="contact?.heroBgImage"
        :src="contact.heroBgImage"
        alt=""
        class="hakkimda-hero__bg"
        aria-hidden="true"
      />
      <div class="hakkimda-hero__overlay" />
      <div class="container hakkimda-hero__content">
        <p class="eyebrow">{{ contact?.heroEyebrow }}</p>
        <div class="section-divider" />
        <h1>{{ contact?.heroTitle }}</h1>
        <p class="page__lead">{{ contact?.heroLead }}</p>
      </div>
    </section>

    <!-- CONTACT GRID -->
    <section class="section section--muted">
      <div class="container contact-grid">
        <!-- Sol: Bilgi -->
        <div class="contact-info-card">
          <h2>{{ contact?.infoTitle }}</h2>
          <p>{{ contact?.infoLead }}</p>

          <ul class="contact-info-list">
            <li class="contact-info-item">
              <span class="contact-info-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div class="contact-info-item__body">
                <strong>Adresse</strong>
                <a :href="mapsUrl" target="_blank" rel="noreferrer">{{ street }}, {{ region }}, {{ city }}</a>
              </div>
            </li>
            <li class="contact-info-item">
              <span class="contact-info-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.84-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <div class="contact-info-item__body">
                <strong>Telefon</strong>
                <a :href="`tel:${phone}`">{{ phoneDisplay }}</a>
                <a
                  v-for="extraPhone in extraPhones"
                  :key="`phone-${extraPhone.number}`"
                  :href="`tel:${extraPhone.number}`"
                >{{ extraPhone.display }}<template v-if="extraPhone.label"> ({{ extraPhone.label }})</template></a>
              </div>
            </li>
            <li class="contact-info-item">
              <span class="contact-info-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <div class="contact-info-item__body">
                <strong>E-Mail</strong>
                <a :href="`mailto:${email}`">{{ email }}</a>
                <a
                  v-for="extraEmail in extraEmails"
                  :key="`email-${extraEmail.address}`"
                  :href="`mailto:${extraEmail.address}`"
                >{{ extraEmail.address }}<template v-if="extraEmail.label"> ({{ extraEmail.label }})</template></a>
              </div>
            </li>
            <li class="contact-info-item">
              <span class="contact-info-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <div class="contact-info-item__body">
                <strong>Öffnungszeiten</strong>
                <span>{{ workingHours }}</span>
              </div>
            </li>
          </ul>

          <div class="contact-info-social">
            <p class="contact-info-social__label">Folgen Sie uns in den sozialen Medien</p>
            <div class="contact-info-social__actions">
              <a
                :href="instagram"
                target="_blank"
                rel="noreferrer"
                class="button button--secondary button--small"
              >Instagram</a>
              <a
                :href="linkedin"
                target="_blank"
                rel="noreferrer"
                class="button button--secondary button--small"
              >LinkedIn</a>
            </div>
          </div>
        </div>

        <!-- Sağ: Form -->
        <div class="contact-form-card">
          <div v-if="!submitted">
            <h2>{{ contact?.formTitle }}</h2>
            <p>{{ contact?.formLead }}</p>

            <!-- Fortschritt -->
            <div class="wiz-progress">
              <div class="wiz-progress__track">
                <div class="wiz-progress__bar" :style="{ width: progress + '%' }" />
              </div>
              <span class="wiz-progress__pct">{{ progress }}%</span>
            </div>

            <form @submit.prevent="handleSubmit">
              <input
                v-model="form.website"
                type="text"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
                style="position:absolute;left:-99999px;opacity:0;width:1px;height:1px;pointer-events:none"
              >

              <!-- Schritt: Scheibe -->
              <div v-if="step === 'glass'" class="wiz-step">
                <h3 class="wiz-step__title">Welche Scheibe ist beschädigt?</h3>
                <div class="wiz-options">
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.glassType === 'windschutzscheibe' }"
                    @click="form.glassType = 'windschutzscheibe'; next()"
                  >
                    <strong>Windschutzscheibe</strong>
                    <span>Die meisten Schäden reparieren wir in ca. 30 Minuten.</span>
                  </button>
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.glassType === 'andere' }"
                    @click="form.glassType = 'andere'; next()"
                  >
                    <strong>Andere Scheibe</strong>
                    <span>Seiten- oder Heckscheibe — muss meist ausgetauscht werden.</span>
                  </button>
                </div>
              </div>

              <!-- Schritt: Schadensausmaß -->
              <div v-else-if="step === 'extent'" class="wiz-step">
                <h3 class="wiz-step__title">Welches Ausmaß hat der Schaden?</h3>
                <div class="wiz-options">
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.damageExtent === 'steinschlag' }"
                    @click="form.damageExtent = 'steinschlag'; next()"
                  >
                    <strong>Steinschlag</strong>
                    <span>Kleiner als eine Zwei-Euro-Münze</span>
                  </button>
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.damageExtent === 'groesser' }"
                    @click="form.damageExtent = 'groesser'; next()"
                  >
                    <strong>Größerer Schaden</strong>
                    <span>Schaden größer als 2-Euro-Münze oder Riss</span>
                  </button>
                </div>
                <button type="button" class="wiz-back" @click="back()">← Zurück</button>
              </div>

              <!-- Schritt: Position des Steinschlags -->
              <div v-else-if="step === 'location'" class="wiz-step">
                <h3 class="wiz-step__title">Wo befindet sich der Steinschlag?</h3>
                <div class="wiz-options">
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.damageLocation === 'sichtfeld' }"
                    @click="form.damageLocation = 'sichtfeld'; next()"
                  >
                    <strong>Im Sichtfeld des Fahrers</strong>
                  </button>
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.damageLocation === 'ausserhalb' }"
                    @click="form.damageLocation = 'ausserhalb'; next()"
                  >
                    <strong>Außerhalb des Sichtfelds</strong>
                  </button>
                </div>
                <button type="button" class="wiz-back" @click="back()">← Zurück</button>
              </div>

              <!-- Schritt: Einschätzung -->
              <div v-else-if="step === 'diagnosis'" class="wiz-step">
                <div class="wiz-diagnosis" :class="`wiz-diagnosis--${diagnosis}`">
                  <div class="wiz-diagnosis__icon">{{ diagnosis === 'repair' ? '🔧' : '🔄' }}</div>
                  <div>
                    <h3 class="wiz-step__title" style="margin:0 0 0.35rem;">
                      {{ diagnosis === 'repair' ? 'Ihre Scheibe kann voraussichtlich repariert werden.' : 'Ihre Scheibe muss voraussichtlich ausgetauscht werden.' }}
                    </h3>
                    <p style="margin:0;">
                      {{ diagnosis === 'repair'
                        ? 'Steinschläge, die kleiner als eine Zwei-Euro-Münze sind und außerhalb des Sichtfelds liegen, können repariert werden. Die Reparatur dauert ca. 30 Minuten.'
                        : 'Aus Sicherheitsgründen ist in diesem Fall ein fachgerechter Austausch nötig — inklusive Kalibrierung, falls Ihr Fahrzeug über entsprechende Assistenzsysteme verfügt.' }}
                    </p>
                  </div>
                </div>
                <div class="wiz-step__actions">
                  <button type="button" class="wiz-back" @click="back()">← Zurück</button>
                  <button type="button" class="button button--large" @click="next()">Termin wählen →</button>
                </div>
              </div>

              <!-- Schritt: Termin -->
              <div v-else-if="step === 'schedule'" class="wiz-step">
                <h3 class="wiz-step__title">Bitte wählen Sie Ihren Wunschtermin!</h3>
                <div class="form-group">
                  <label for="preferredDate">Datum</label>
                  <input id="preferredDate" v-model="form.preferredDate" type="date" :min="todayIso" required>
                </div>
                <div class="form-group">
                  <label>Uhrzeit</label>
                  <div class="wiz-slots">
                    <button
                      v-for="slot in timeSlots"
                      :key="slot"
                      type="button"
                      class="wiz-slot"
                      :class="{ 'wiz-slot--active': form.preferredTime === slot }"
                      @click="form.preferredTime = slot"
                    >{{ slot }}</button>
                  </div>
                </div>
                <div class="wiz-step__actions">
                  <button type="button" class="wiz-back" @click="back()">← Zurück</button>
                  <button type="button" class="button button--large" :disabled="!canContinue" @click="next()">Weiter →</button>
                </div>
              </div>

              <!-- Schritt: Kontaktdaten -->
              <div v-else-if="step === 'contact'" class="wiz-step">
                <h3 class="wiz-step__title">Wie lauten Ihre Kontaktdaten?</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label for="name">Name</label>
                    <input id="name" v-model="form.name" type="text" placeholder="Ihr Name" required>
                  </div>
                  <div class="form-group">
                    <label for="phone">Telefon</label>
                    <input id="phone" v-model="form.phone" type="tel" placeholder="+49 ...">
                  </div>
                </div>
                <div class="form-group">
                  <label for="email">E-Mail-Adresse</label>
                  <input id="email" v-model="form.email" type="email" placeholder="name@beispiel.de" required>
                </div>
                <div class="wiz-step__actions">
                  <button type="button" class="wiz-back" @click="back()">← Zurück</button>
                  <button type="button" class="button button--large" :disabled="!canContinue" @click="next()">Weiter →</button>
                </div>
              </div>

              <!-- Schritt: Fahrzeugdaten -->
              <div v-else-if="step === 'vehicle'" class="wiz-step">
                <h3 class="wiz-step__title">Wie lautet Ihr Kfz-Kennzeichen?</h3>
                <div class="form-group">
                  <label for="licensePlate">Kennzeichen</label>
                  <input id="licensePlate" v-model="form.licensePlate" type="text" placeholder="z. B. BB-AB 123" required>
                </div>
                <div class="form-group">
                  <label for="insurance">Versicherung (optional)</label>
                  <select id="insurance" v-model="form.insuranceCompany">
                    <option value="">Bitte wählen</option>
                    <option v-for="ins in insuranceOptions" :key="ins" :value="ins">{{ ins }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="vin">Fahrzeug-Identifikationsnummer / FIN (optional)</label>
                  <input id="vin" v-model="form.vin" type="text" placeholder="17-stellige FIN">
                  <p class="form-note">Hilft uns, direkt das passende Ersatzglas für Ihr Fahrzeug vorzubereiten.</p>
                </div>
                <div class="wiz-step__actions">
                  <button type="button" class="wiz-back" @click="back()">← Zurück</button>
                  <button type="button" class="button button--large" :disabled="!canContinue" @click="next()">Weiter →</button>
                </div>
              </div>

              <!-- Schritt: Zusatz-Service -->
              <div v-else-if="step === 'extra'" class="wiz-step">
                <h3 class="wiz-step__title">Wie möchten Sie den Termin wahrnehmen?</h3>
                <div class="wiz-options">
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.additionalService === 'werkstatt' }"
                    @click="form.additionalService = 'werkstatt'; next()"
                  >
                    <strong>In der Werkstatt</strong>
                    <span>Sie bringen Ihr Fahrzeug zu uns nach Hildrizhausen.</span>
                  </button>
                  <button
                    type="button"
                    class="wiz-option"
                    :class="{ 'wiz-option--active': form.additionalService === 'mobil' }"
                    @click="form.additionalService = 'mobil'; next()"
                  >
                    <strong>Mobiler Service</strong>
                    <span>Wir kommen zu Ihnen nach Hause oder zur Arbeit.</span>
                  </button>
                </div>
                <button type="button" class="wiz-back" @click="back()">← Zurück</button>
              </div>

              <!-- Schritt: Nachricht & Abschluss -->
              <div v-else-if="step === 'message'" class="wiz-step">
                <h3 class="wiz-step__title">Fast geschafft!</h3>
                <div class="form-group">
                  <label for="message">Ihre Nachricht (optional)</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    placeholder="Weitere Hinweise zu Ihrem Fahrzeug oder Schaden..."
                  />
                </div>
                <div class="form-group">
                  <label for="referral">Wie sind Sie auf uns aufmerksam geworden? (optional)</label>
                  <select id="referral" v-model="form.referralSource">
                    <option value="">Bitte auswählen</option>
                    <option value="suchmaschine">Suchmaschine</option>
                    <option value="empfehlung">Persönliche Empfehlung</option>
                    <option value="social-media">Social Media</option>
                    <option value="versicherung">Versicherung</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>
                <p class="form-note">
                  🔒 Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
                </p>

                <div v-if="turnstileEnabled" class="form-group">
                  <div
                    class="cf-turnstile"
                    :data-sitekey="turnstileSiteKey"
                    data-callback="onTurnstileSuccess"
                    data-expired-callback="onTurnstileExpired"
                    data-error-callback="onTurnstileExpired"
                  />
                </div>

                <div class="wiz-step__actions">
                  <button type="button" class="wiz-back" @click="back()">← Zurück</button>
                  <button type="submit" class="button button--large contact-form-submit" :disabled="submitting">
                    {{ submitting ? 'Wird gesendet…' : 'Terminanfrage senden' }}
                  </button>
                </div>
                <p v-if="submitError" class="contact-form-error">{{ submitError }}</p>
              </div>
            </form>
          </div>

          <div v-else class="contact-form-success">
            <div class="contact-form-success__icon">✓</div>
            <h2>Ihre Anfrage ist eingegangen!</h2>
            <p>
              Wir melden uns so schnell wie möglich bei Ihnen.
              Bei dringenden Fällen können Sie uns auch direkt kontaktieren.
            </p>
            <a :href="`tel:${phone}`" class="button button--outline">
              {{ phoneDisplay }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- HARİTA -->
    <section class="map-section">
      <iframe
        :src="mapsEmbedUrl"
        width="100%"
        height="420"
        class="map-section__frame"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Aydin Autoglas Standort"
      />
    </section>

    <!-- CTA -->
    <section class="section">
      <div class="container cta-banner" :style="contactCtaStyle">
        <h2>{{ contact?.ctaTitle }}</h2>
        <p>{{ contact?.ctaLead }}</p>
        <div class="hero__actions hero__actions--center contact-cta__actions">
          <AppSmartLink
            :to="contact?.ctaPrimaryUrl || `mailto:${email}`"
            class="button button--light button--large"
          >
            {{ contact?.ctaPrimaryLabel || 'E-Mail schreiben' }}
          </AppSmartLink>
          <AppSmartLink
            v-if="contact?.ctaSecondaryLabel"
            :to="contact?.ctaSecondaryUrl || `tel:${phone}`"
            class="button button--outline-light button--large"
          >
            {{ contact?.ctaSecondaryLabel || 'Anrufen' }}
          </AppSmartLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wiz-progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.wiz-progress__track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--line, #e5e7eb);
  overflow: hidden;
}
.wiz-progress__bar {
  height: 100%;
  background: var(--primary, #2f6fb0);
  transition: width 220ms ease;
}
.wiz-progress__pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #666);
  min-width: 2.5em;
  text-align: right;
}

.wiz-step__title {
  font-size: 1.05rem;
  margin: 0 0 1rem;
}

.wiz-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.wiz-option {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
  padding: 1rem 1.1rem;
  border: 1.5px solid var(--line, #e5e7eb);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 150ms, box-shadow 150ms;
}
.wiz-option:hover {
  border-color: var(--primary, #2f6fb0);
}
.wiz-option--active {
  border-color: var(--primary, #2f6fb0);
  box-shadow: 0 0 0 2px rgba(47, 111, 176, 0.15);
}
.wiz-option strong {
  font-size: 0.95rem;
}
.wiz-option span {
  font-size: 0.82rem;
  color: var(--text-muted, #666);
}

.wiz-back {
  background: none;
  border: none;
  color: var(--text-muted, #666);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.4rem 0;
}
.wiz-back:hover {
  color: var(--primary, #2f6fb0);
}

.wiz-step__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.wiz-diagnosis {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 10px;
  background: #f4f8f4;
  margin-bottom: 0.5rem;
}
.wiz-diagnosis--replace {
  background: #fdf6ec;
}
.wiz-diagnosis__icon {
  font-size: 1.6rem;
  line-height: 1;
}

.wiz-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 0.5rem;
}
.wiz-slot {
  padding: 0.55rem 0.4rem;
  border: 1.5px solid var(--line, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}
.wiz-slot:hover {
  border-color: var(--primary, #2f6fb0);
}
.wiz-slot--active {
  border-color: var(--primary, #2f6fb0);
  background: var(--primary, #2f6fb0);
  color: #fff;
}
</style>
