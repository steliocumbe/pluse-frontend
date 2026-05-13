<!--
  AppPageHeader — standardised page top: title + subtitle + breadcrumb + actions.

  Designed to anchor every list/detail/form page so the visual rhythm stays
  consistent. Uses AppHeading internally so Quasar's heading reset doesn't
  hijack the title styling.

  Slots:
    - #breadcrumb (optional) — appears above the title (use for nav crumbs)
    - #actions (optional)    — appears top-right (buttons)
    - default                — extra content below (e.g. filters)

  Usage:
    <AppPageHeader title="Colaboradores" subtitle="Vigilantes, supervisores e funcionários internos">
      <template #actions>
        <AppButton variant="outline">Exportar</AppButton>
        <AppButton :to="'/employees/new'">Novo colaborador</AppButton>
      </template>
    </AppPageHeader>
-->
<template>
  <header class="app-page-header">
    <div v-if="$slots.breadcrumb" class="app-page-header__crumb">
      <slot name="breadcrumb" />
    </div>

    <div class="app-page-header__row">
      <div class="app-page-header__title-block">
        <AppHeading :level="1" class="app-page-header__title">{{ title }}</AppHeading>
        <p v-if="subtitle" class="app-page-header__subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="$slots.actions" class="app-page-header__actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.default" class="app-page-header__extras">
      <slot />
    </div>
  </header>
</template>

<script setup>
import AppHeading from 'src/components/ui/AppHeading.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.app-page-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.app-page-header__crumb {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
.app-page-header__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.app-page-header__title-block {
  min-width: 0;
}
.app-page-header__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--mono);
  line-height: 1.2;
}
.app-page-header__subtitle {
  margin: 0.375rem 0 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
.app-page-header__actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.app-page-header__extras {
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .app-page-header__title {
    font-size: 1.75rem;
  }
}
</style>
