<script setup lang="ts">
const { locale, locales, changeLocale } = useAppLocale()

const flagMap: Record<string, string> = { de: "🇩🇪", en: "🇬🇧", tr: "🇹🇷" }

const open = ref(false)

function select(code: string) {
  changeLocale(code)
  open.value = false
}

function closeMenu() {
  open.value = false
}

onMounted(() => {
  if (process.client) window.addEventListener("click", closeMenu)
})
onBeforeUnmount(() => {
  if (process.client) window.removeEventListener("click", closeMenu)
})
</script>

<template>
  <div class="lang-switch" @click.stop>
    <button type="button" class="lang-switch__btn" @click="open = !open">
      <span>{{ flagMap[locale] || '🌐' }}</span>
      <span class="lang-switch__code">{{ locale.toUpperCase() }}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div v-if="open" class="lang-switch__menu">
      <button
        v-for="l in locales"
        :key="typeof l === 'string' ? l : l.code"
        type="button"
        class="lang-switch__item"
        :class="{ 'lang-switch__item--active': (typeof l === 'string' ? l : l.code) === locale }"
        @click="select(typeof l === 'string' ? l : l.code)"
      >
        <span>{{ flagMap[typeof l === 'string' ? l : l.code] || '🌐' }}</span>
        {{ typeof l === 'string' ? l : l.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-switch { position: relative; }
.lang-switch__btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}
.lang-switch__code { letter-spacing: 0.02em; }
.lang-switch__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 200;
  min-width: 140px;
}
.lang-switch__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.85rem;
  cursor: pointer;
  color: #111;
}
.lang-switch__item:hover { background: #f5f5f5; }
.lang-switch__item--active { font-weight: 700; color: var(--primary, #2f6fb0); }
</style>
