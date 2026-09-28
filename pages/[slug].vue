<script setup lang="ts">
import { usePageSeo } from "../composables/usePageSeo"
import { buildPageCtaBackgroundStyle } from "../utils/page-cta"

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: s, error } = await useFetch<any>(() => `/api/service/${slug.value}`, {
  key: () => `service-${slug.value}`,
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: "Leistung nicht gefunden",
  })
}

if (!s.value) {
  throw createError({ statusCode: 404, statusMessage: "Leistung nicht gefunden" })
}

usePageSeo({
  title: s.value?.heroTitle || "Hizmet",
  description: s.value?.heroLead || "Details zu dieser Leistung.",
  path: `/${slug.value}`,
})

const heroStyle = computed(() => s.value?.heroBgImage ? {
  backgroundImage: `linear-gradient(100deg, rgba(245,243,240,0.96) 38%, rgba(245,243,240,0.55) 65%, rgba(245,243,240,0.08) 100%), url(${s.value.heroBgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
} : {})

const serviceCtaStyle = computed(() => buildPageCtaBackgroundStyle(s.value?.ctaBgImage))
</script>

<template>
  <div class="svc">
    <section class="svc-hero" :style="heroStyle">
      <div class="container svc-hero__inner">
        <div class="svc-hero__copy">
          <div class="svc-hero__kicker">
            <span class="svc-hero__dot"></span>
            {{ s?.heroEyebrow || "Hizmet" }}
          </div>
          <h1 class="svc-hero__h1">{{ s?.heroTitle || "Hizmet" }}</h1>
          <p class="svc-hero__lead">{{ s?.heroLead }}</p>
          <div class="svc-hero__actions">
            <NuxtLink to="/kontakt" class="svc-hero__btn-primary">Termin vereinbaren</NuxtLink>
            <NuxtLink to="/kontakt" class="svc-hero__btn-sec">Mehr erfahren →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--light">
      <div class="container">
        <div class="svc-section__head svc-section__head--center">
          <span class="svc-tag">Nedir?</span>
          <h2>{{ s?.whatTitle }}</h2>
          <p>{{ s?.whatLead }}</p>
        </div>
        <div class="svc-benefits">
          <div v-for="item in s?.benefits" :key="item.title" class="svc-benefit">
            <div class="svc-benefit__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--dark">
      <div class="container">
        <div class="svc-section__head svc-section__head--center">
          <span class="svc-tag svc-tag--on-dark">Anwendungsbereiche</span>
          <h2>{{ s?.issuesTitle }}</h2>
          <p>{{ s?.issuesLead }}</p>
        </div>
        <div class="svc-issues">
          <div v-for="issue in s?.issues" :key="issue" class="svc-issue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            <span>{{ issue }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--warm">
      <div class="container">
        <div class="svc-section__head svc-section__head--center">
          <span class="svc-tag">Ablauf</span>
          <h2>{{ s?.processTitle }}</h2>
          <p>{{ s?.processLead }}</p>
        </div>
        <div class="svc-steps">
          <div v-for="(step, i) in s?.processSteps" :key="`${step.title}-${i}`" class="svc-step">
            <div class="svc-step__num">{{ String(Number(i) + 1).padStart(2, "0") }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="svc-cta" :style="serviceCtaStyle">
      <div class="container svc-cta__inner">
        <div class="svc-cta__copy">
          <h2>{{ s?.ctaTitle || "Jetzt Termin vereinbaren" }}</h2>
          <p>{{ s?.ctaLead }}</p>
        </div>
        <div class="svc-cta__actions">
          <AppSmartLink :to="s?.ctaPrimaryUrl || '/kontakt'" class="svc-btn svc-btn--white">
            {{ s?.ctaPrimaryLabel || 'Randevu Al' }}
          </AppSmartLink>
          <AppSmartLink
            v-if="s?.ctaSecondaryLabel"
            :to="s?.ctaSecondaryUrl || '/ueber-uns'"
            class="svc-btn svc-btn--ghost"
          >
            {{ s?.ctaSecondaryLabel || 'Kurumsal' }}
          </AppSmartLink>
        </div>
      </div>
    </section>
  </div>
</template>
