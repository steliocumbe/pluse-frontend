<!--
  AppInput — labelled text input with built-in error/hint slots.

  Wires v-model to a real <input>. Slots:
    - #prefix / #suffix: leading/trailing addon (icon, button, etc.)
    - #label-suffix: small thing aligned with the label (e.g. "Esqueci a senha")

  Usage:
    <AppInput v-model="form.email" label="E-mail" type="email" required
              :error="errors.email" hint="Usado para iniciar sessão." />
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

    <div class="app-field__control">
      <span v-if="$slots.prefix" class="app-field__addon"><slot name="prefix" /></span>
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :name="name"
        :aria-invalid="!!error || undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span v-if="$slots.suffix" class="app-field__addon"><slot name="suffix" /></span>
    </div>

    <p v-if="error" :id="`${inputId}-err`" class="app-field__error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="app-field__hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String, default: undefined },
  name: { type: String, default: undefined },
  id: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const autoId = useId()
const inputId = computed(() => props.id || `app-input-${autoId}`)
const describedBy = computed(() => {
  if (props.error) return `${inputId.value}-err`
  if (props.hint) return `${inputId.value}-hint`
  return undefined
})

const inputRef = ref(null)
defineExpose({ focus: () => inputRef.value?.focus(), inputRef })

function onInput(e) {
  emit('update:modelValue', e.target.value)
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
  align-items: stretch;
  width: 100%;
  border: 1px solid var(--input);
  border-radius: 0.5rem;
  background: var(--background);
  transition: border-color 160ms ease, box-shadow 160ms ease;
  overflow: hidden;
}
.app-field__control:focus-within {
  border-color: color-mix(in oklab, var(--primary) 50%, var(--input));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 12%, transparent);
}
.app-field--error .app-field__control {
  border-color: var(--destructive);
}
.app-field--error .app-field__control:focus-within {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--destructive) 14%, transparent);
}
.app-field--disabled .app-field__control {
  background: var(--muted);
  opacity: 0.75;
}
.app-field__control > input {
  flex: 1 1 0%;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--foreground);
  background: transparent;
  border: 0;
  outline: 0;
}
.app-field__control > input::placeholder {
  color: var(--muted-foreground);
}
.app-field__addon {
  display: inline-flex;
  align-items: center;
  padding-inline: 0.625rem;
  color: var(--muted-foreground);
  background: transparent;
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
</style>
