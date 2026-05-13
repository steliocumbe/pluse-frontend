<!--
  AppButton — unified button primitive.

  Renders as:
    - <router-link> when `to` is set
    - <a> when `href` is set
    - <button> otherwise

  Variants: primary | outline | ghost | destructive | soft
  Sizes:    sm | md | lg
  Extras:   loading, icon-only (square aspect), full-width, disabled

  Usage:
    <AppButton @click="onSave">Guardar</AppButton>
    <AppButton variant="outline" size="sm" :to="'/employees'">Voltar</AppButton>
    <AppButton variant="destructive" :loading="saving">Eliminar</AppButton>
    <AppButton icon-only aria-label="Apagar">
      <AppIcon name="ki-trash" :size="16" />
    </AppButton>
-->
<template>
  <component
    :is="component"
    v-bind="bindings"
    :type="component === 'button' ? type : undefined"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :class="['app-btn', `app-btn--${variant}`, `app-btn--${size}`, { 'app-btn--icon-only': iconOnly, 'app-btn--block': block }]"
  >
    <span v-if="loading" class="app-btn__spinner-wrap">
      <span class="app-btn__spinner" aria-hidden="true" />
      <span v-if="loadingLabel" class="ms-2">{{ loadingLabel }}</span>
    </span>
    <slot v-else />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'outline', 'ghost', 'destructive', 'soft'].includes(v),
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: undefined },
  href: { type: String, default: undefined },
  loading: { type: Boolean, default: false },
  loadingLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  iconOnly: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const isDisabled = computed(() => props.disabled || props.loading)

const component = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return {}
})
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 80ms ease;
  text-decoration: none;
  user-select: none;
}
.app-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
}
.app-btn:active:not(:disabled):not([aria-busy]) {
  transform: translateY(1px);
}
.app-btn:disabled,
.app-btn[aria-busy] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.app-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  min-height: 32px;
}
.app-btn--md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 38px;
}
.app-btn--lg {
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  min-height: 44px;
}

.app-btn--icon-only.app-btn--sm { padding: 0; width: 32px; }
.app-btn--icon-only.app-btn--md { padding: 0; width: 38px; }
.app-btn--icon-only.app-btn--lg { padding: 0; width: 44px; }

.app-btn--block {
  display: flex;
  width: 100%;
}

/* Variants */
.app-btn--primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.app-btn--primary:hover:not(:disabled):not([aria-busy]) {
  background: color-mix(in oklab, var(--primary) 88%, black);
  border-color: color-mix(in oklab, var(--primary) 88%, black);
}

.app-btn--outline {
  background: var(--background);
  color: var(--foreground);
  border-color: var(--input);
}
.app-btn--outline:hover:not(:disabled):not([aria-busy]) {
  background: var(--accent);
  color: var(--accent-foreground);
}

.app-btn--ghost {
  background: transparent;
  color: var(--foreground);
  border-color: transparent;
}
.app-btn--ghost:hover:not(:disabled):not([aria-busy]) {
  background: var(--accent);
  color: var(--accent-foreground);
}

.app-btn--destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
  border-color: var(--destructive);
}
.app-btn--destructive:hover:not(:disabled):not([aria-busy]) {
  background: color-mix(in oklab, var(--destructive) 88%, black);
  border-color: color-mix(in oklab, var(--destructive) 88%, black);
}

.app-btn--soft {
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
  border-color: color-mix(in oklab, var(--primary) 24%, transparent);
}
.app-btn--soft:hover:not(:disabled):not([aria-busy]) {
  background: color-mix(in oklab, var(--primary) 20%, transparent);
}

/* Loading spinner */
.app-btn__spinner-wrap {
  display: inline-flex;
  align-items: center;
}
.app-btn__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: app-btn-spin 0.6s linear infinite;
}
@keyframes app-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
