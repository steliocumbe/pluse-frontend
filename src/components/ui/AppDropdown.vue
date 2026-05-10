<!--
  Vue-native dropdown. Replaces Metronic's data-kt-dropdown so we don't
  depend on KTUI's auto-init (unreliable after Vue mounts).
  Closes on click-outside and on Esc. Provides scoped slot `close()` so
  links inside the panel can dismiss it after navigation.
-->
<template>
  <div ref="rootRef" class="relative inline-block" @keydown.esc="open = false">
    <div
      ref="triggerRef"
      class="cursor-pointer select-none"
      role="button"
      tabindex="0"
      :aria-expanded="open"
      :aria-haspopup="true"
      @click.stop="open = !open"
      @keydown.enter.prevent="open = !open"
      @keydown.space.prevent="open = !open"
    >
      <slot name="toggle" :open="open" />
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg py-1.5"
        :class="positionClass"
        :style="{ width }"
        role="menu"
      >
        <slot :close="() => (open = false)" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  placement: { type: String, default: 'bottom-end' },
  width: { type: String, default: '260px' },
})

const open = ref(false)
const rootRef = ref(null)
const triggerRef = ref(null)

const positionClass = computed(() => {
  switch (props.placement) {
    case 'bottom-start':
      return 'top-full mt-2 start-0'
    case 'top-end':
      return 'bottom-full mb-2 end-0'
    case 'top-start':
      return 'bottom-full mb-2 start-0'
    case 'bottom-end':
    default:
      return 'top-full mt-2 end-0'
  }
})

function onDocMouseDown(e) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown))
</script>
