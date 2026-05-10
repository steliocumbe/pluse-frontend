<!--
  Accessible toggle switch built on a `<button>`, so we don't rely on
  `<input type="checkbox">` + `appearance: none` (whose styling is shaky
  across browsers and can clash with Quasar's own checkbox resets).
-->
<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    class="relative inline-flex shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    :class="[
      sizeWrapperClass,
      modelValue ? 'bg-primary' : 'bg-input',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform"
      :class="[sizeThumbClass, modelValue ? thumbOnClass : thumbOffClass]"
    />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ariaLabel: { type: String, default: undefined },
  size: { type: String, default: 'md' }, // 'sm' | 'md'
})

defineEmits(['update:modelValue'])

const sizeWrapperClass = computed(() =>
  props.size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]',
)
const sizeThumbClass = computed(() =>
  props.size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]',
)
const thumbOffClass = computed(() => (props.size === 'sm' ? 'left-0.5' : 'left-0.5'))
const thumbOnClass = computed(() =>
  props.size === 'sm' ? 'left-[14px]' : 'left-[20px]',
)
</script>
