<!--
  AppFormSection — collapsible section inside long forms.

  Designed for the "Novo colaborador" type of multi-section forms where the
  user needs visual breathing room and the option to focus on one block at
  a time. Default expanded.

  Usage:
    <AppFormSection title="1. Dados pessoais"
                    description="Identificação obrigatória do colaborador">
      <AppInput v-model="form.full_name" label="Nome completo" required />
      ...
    </AppFormSection>
-->
<template>
  <section class="app-form-section" :class="{ 'app-form-section--collapsed': !expanded }">
    <header class="app-form-section__header" @click="toggle">
      <div class="app-form-section__title-wrap">
        <span v-if="step" class="app-form-section__step">{{ step }}</span>
        <div class="min-w-0">
          <AppHeading :level="2" class="app-form-section__title">{{ title }}</AppHeading>
          <p v-if="description" class="app-form-section__description">{{ description }}</p>
        </div>
      </div>
      <button
        v-if="collapsible"
        type="button"
        class="app-form-section__toggle"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'Colapsar secção' : 'Expandir secção'"
      >
        <AppIcon :name="expanded ? 'ki-minus' : 'ki-plus'" :size="14" />
      </button>
    </header>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-show="expanded" class="app-form-section__body">
        <slot />
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  step: { type: [String, Number], default: '' },
  collapsible: { type: Boolean, default: true },
  defaultExpanded: { type: Boolean, default: true },
})

const expanded = ref(props.defaultExpanded)

function toggle() {
  if (!props.collapsible) return
  expanded.value = !expanded.value
}
</script>

<style scoped>
.app-form-section {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
  overflow: hidden;
}
.app-form-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.app-form-section:not(.app-form-section--collapsed) .app-form-section__header {
  border-bottom-color: var(--border);
}
.app-form-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.app-form-section__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 50%;
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
}
.app-form-section__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
  line-height: 1.3;
}
.app-form-section__description {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}
.app-form-section__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border: 1px solid var(--input);
  border-radius: 0.5rem;
  background: var(--background);
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.app-form-section__toggle:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
.app-form-section__body {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}
</style>
