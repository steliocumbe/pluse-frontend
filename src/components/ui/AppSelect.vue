<!--
  AppSelect — labelled <select> with options OR multi-select via checkboxes.

  Modes:
    - single  (default): v-model = single value
    - multiple        : v-model = array of values; renders an inline list of
                         checkboxes (avoids the ugly native <select multiple>).

  Props mimic AppInput so they're swappable in a form.

  Usage:
    <AppSelect v-model="form.gender" label="Género" :options="genderOptions" />

    <AppSelect
      v-model="form.types"
      multiple
      label="Tipos de função"
      :options="groupOptions"
      hint="Pode acumular mais que uma função."
    />

  Options shape: [{ value, label, disabled? }]
-->
<template>
  <div class="app-field" :class="{ 'app-field--error': !!error, 'app-field--disabled': disabled }">
    <label v-if="label" :for="inputId" class="app-field__label">
      <span class="inline-flex items-center gap-1">
        {{ label }}
        <span v-if="required" class="text-destructive" aria-hidden="true">*</span>
      </span>
      <slot name="label-suffix" />
    </label>

    <!-- multiple: checkbox list -->
    <div v-if="multiple" class="app-multiselect" :class="{ 'app-multiselect--disabled': disabled }">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="app-multiselect__option"
        :class="{ 'app-multiselect__option--checked': isChecked(opt.value), 'app-multiselect__option--disabled': opt.disabled || disabled }"
      >
        <input
          type="checkbox"
          class="app-multiselect__input"
          :value="opt.value"
          :checked="isChecked(opt.value)"
          :disabled="opt.disabled || disabled"
          @change="toggleValue(opt.value, $event.target.checked)"
        />
        <span class="app-multiselect__box" aria-hidden="true">
          <svg viewBox="0 0 12 10" fill="none">
            <path d="M1 5.5L4.5 9L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- single: native <select> styled like AppInput -->
    <div v-else class="app-field__control">
      <select
        :id="inputId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :aria-invalid="!!error || undefined"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" :disabled="required">{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <p v-if="error" class="app-field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="app-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  id: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue'])

const autoId = useId()
const inputId = computed(() => props.id || `app-select-${autoId}`)

function isChecked(value) {
  return Array.isArray(props.modelValue) && props.modelValue.includes(value)
}

function toggleValue(value, checked) {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (checked) {
    if (!current.includes(value)) current.push(value)
  } else {
    const idx = current.indexOf(value)
    if (idx >= 0) current.splice(idx, 1)
  }
  emit('update:modelValue', current)
}
</script>

<style scoped>
.app-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.app-field__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--foreground);
}
.app-field__control {
  display: flex;
  width: 100%;
  border: 1px solid var(--input);
  border-radius: 0.5rem;
  background: var(--background);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.app-field__control:focus-within {
  border-color: color-mix(in oklab, var(--primary) 50%, var(--input));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 12%, transparent);
}
.app-field--error .app-field__control {
  border-color: var(--destructive);
}
.app-field--disabled .app-field__control {
  background: var(--muted);
  opacity: 0.75;
}
.app-field__control > select {
  flex: 1 1 0%;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--foreground);
  background: transparent;
  border: 0;
  outline: 0;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%2364748b' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px 8px;
  padding-right: 2rem;
}
.app-field__error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--destructive);
}
.app-field__hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

/* Multi-select checkbox list */
.app-multiselect {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.375rem;
  padding: 0.5rem;
  border: 1px solid var(--input);
  border-radius: 0.5rem;
  background: var(--background);
}
.app-multiselect--disabled {
  opacity: 0.6;
}
.app-multiselect__option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--foreground);
  border: 1px solid transparent;
  transition: background-color 140ms ease, border-color 140ms ease;
}
.app-multiselect__option:hover:not(.app-multiselect__option--disabled) {
  background: color-mix(in oklab, var(--primary) 6%, transparent);
}
.app-multiselect__option--checked {
  background: color-mix(in oklab, var(--primary) 10%, transparent);
  border-color: color-mix(in oklab, var(--primary) 30%, transparent);
}
.app-multiselect__option--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.app-multiselect__input {
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
.app-multiselect__box {
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
.app-multiselect__box svg {
  width: 12px;
  height: auto;
}
.app-multiselect__input:checked + .app-multiselect__box {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}
</style>
