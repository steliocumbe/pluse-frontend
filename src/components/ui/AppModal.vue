<!--
  Generic modal — Teleported to <body> so its z-index isn't constrained by
  any parent's stacking context. Backdrop click and Esc close it (unless the
  caller opts out via `persistent`).

  Usage:
    <AppModal v-model="open" size="sm">
      <template #icon>...</template>
      <template #default>...content...</template>
      <template #footer="{ close }">...buttons...</template>
    </AppModal>
-->
<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @keydown.esc="onEsc"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          @click="onBackdropClick"
        />

        <!-- Modal panel -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div
            v-if="modelValue"
            ref="panelRef"
            role="dialog"
            aria-modal="true"
            class="relative bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border w-full"
            :class="sizeClass"
            :tabindex="-1"
          >
            <button
              v-if="closable"
              type="button"
              class="absolute top-3 end-3 size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Fechar"
              @click="close"
            >
              <AppIcon name="ki-cross" :size="16" />
            </button>

            <slot :close="close" />
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // 'sm' (max-w-sm) | 'md' (default, max-w-md) | 'lg' (max-w-lg) | 'xl' (max-w-2xl)
  size: { type: String, default: 'md' },
  // When true, clicking the backdrop or pressing Esc does NOT close.
  persistent: { type: Boolean, default: false },
  closable: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

const panelRef = ref(null)

const sizeClass = computed(
  () => ({
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  })[props.size] || 'max-w-md',
)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdropClick() {
  if (!props.persistent) close()
}

function onEsc() {
  if (!props.persistent) close()
}

// Lock body scroll while the modal is open.
let prevOverflow = ''
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      await nextTick()
      panelRef.value?.focus?.()
    } else {
      document.body.style.overflow = prevOverflow
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = prevOverflow
})
</script>
