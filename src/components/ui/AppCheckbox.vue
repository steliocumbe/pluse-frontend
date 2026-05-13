<!--
  AppCheckbox — accessible checkbox with custom styling.

  Built as a real <input type="checkbox"> hidden behind a styled box so
  screen readers and keyboard navigation work natively.

  Usage:
    <AppCheckbox v-model="form.acceptTerms" label="Aceito os termos" />
-->
<template>
  <label class="app-check" :class="{ 'app-check--disabled': disabled }">
    <input
      type="checkbox"
      class="app-check__input"
      :checked="modelValue"
      :disabled="disabled"
      :indeterminate.prop="indeterminate"
      :name="name"
      :value="value"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="app-check__box" aria-hidden="true">
      <svg v-if="!indeterminate" viewBox="0 0 12 10" class="app-check__icon" fill="none">
        <path d="M1 5.5L4.5 9L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 10 2" class="app-check__icon" fill="none">
        <path d="M1 1H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="app-check__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  value: { type: [String, Number, Boolean], default: undefined },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--foreground);
  cursor: pointer;
  user-select: none;
}
.app-check--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.app-check__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.app-check__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: none;
  border: 1.5px solid var(--input);
  border-radius: 0.3rem;
  background: var(--background);
  color: transparent;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
.app-check__icon {
  width: 12px;
  height: auto;
}
.app-check__input:checked + .app-check__box,
.app-check__input:indeterminate + .app-check__box {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}
.app-check__input:focus-visible + .app-check__box {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
}
.app-check__label {
  line-height: 1.35;
}
</style>
