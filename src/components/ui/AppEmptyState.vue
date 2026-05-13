<!--
  AppEmptyState — friendly "nothing here yet" with optional CTA.

  Designed for first-time users: clear icon, short title, helpful copy,
  and a single primary action so they know exactly what to do next.

  Usage:
    <AppEmptyState
      title="Ainda não há colaboradores"
      description="Adicione o primeiro vigilante para começar a montar escalas."
      icon="ki-people"
      cta-label="Novo colaborador"
      :cta-to="'/employees/new'"
    />

  Or with custom CTA via slot:
    <AppEmptyState ...>
      <template #cta>
        <AppButton variant="outline">Importar lista</AppButton>
        <AppButton>Novo colaborador</AppButton>
      </template>
    </AppEmptyState>
-->
<template>
  <div class="app-empty">
    <div v-if="icon" class="app-empty__icon">
      <AppIcon :name="icon" :size="iconSize" />
    </div>
    <AppHeading :level="2" class="app-empty__title">{{ title }}</AppHeading>
    <p v-if="description" class="app-empty__description">{{ description }}</p>

    <div v-if="$slots.cta || ctaLabel" class="app-empty__cta">
      <slot name="cta">
        <AppButton v-if="ctaTo" :to="ctaTo">{{ ctaLabel }}</AppButton>
        <AppButton v-else-if="ctaLabel" @click="$emit('cta-click')">{{ ctaLabel }}</AppButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppButton from 'src/components/ui/AppButton.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'ki-information-2' },
  iconSize: { type: [Number, String], default: 28 },
  ctaLabel: { type: String, default: '' },
  ctaTo: { type: [String, Object], default: undefined },
})

defineEmits(['cta-click'])
</script>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  gap: 0.5rem;
}
.app-empty__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 0.5rem;
  border-radius: 16px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.app-empty__title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--mono);
  line-height: 1.3;
}
.app-empty__description {
  max-width: 380px;
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  line-height: 1.55;
}
.app-empty__cta {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
