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
      enter-active-class="transition duration-220 ease-out"
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
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
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
            class="app-modal-panel relative bg-popover text-popover-foreground rounded-[28px] shadow-2xl border border-border/80 w-full flex flex-col max-h-[90vh] overflow-hidden"
            :class="sizeClass"
            :tabindex="-1"
          >
            <button
              v-if="closable"
              type="button"
              class="absolute top-3 end-3 size-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors z-10 bg-popover/85 backdrop-blur-sm border border-border/70"
              aria-label="Fechar"
              @click="close"
            >
              <AppIcon name="ki-cross" :size="16" />
            </button>

            <div class="overflow-y-auto min-h-0 flex-1">
              <slot :close="close" />
            </div>

            <footer class="app-modal-signature">
              <span class="app-modal-signature__mark">MIGUEL M.C ERP</span>
              <span class="app-modal-signature__copy">Janela do sistema.</span>
            </footer>
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

<style scoped>
.app-modal-panel {
  width: min(100%, calc(100vw - 32px));
  min-width: 0;
  background: linear-gradient(180deg, color-mix(in oklab, var(--card) 96%, white 4%), var(--card));
  box-shadow:
    0 22px 56px color-mix(in oklab, black 28%, transparent),
    0 0 36px color-mix(in oklab, white 74%, transparent);
}

.app-modal-signature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px 12px;
  border-top: 1px solid color-mix(in oklab, var(--border) 85%, white 15%);
  background: linear-gradient(180deg, transparent, color-mix(in oklab, white 90%, var(--card) 10%));
  color: var(--muted-foreground);
  font-size: 0.7rem;
}

.app-modal-signature__mark {
  font-weight: 900;
  letter-spacing: 0.14em;
  color: var(--primary);
  text-transform: uppercase;
}

.app-modal-signature__copy {
  text-align: right;
}

:global(.dark) .app-modal-panel {
  background: linear-gradient(180deg, color-mix(in oklab, var(--card) 92%, #0d1d33 8%), var(--card));
  box-shadow:
    0 22px 56px color-mix(in oklab, black 56%, transparent),
    0 0 28px color-mix(in oklab, #38bdf8 12%, transparent);
}

:global(.dark) .app-modal-signature {
  border-top: 1px solid color-mix(in oklab, var(--border) 90%, #0b1728 10%);
  background: linear-gradient(180deg, transparent, color-mix(in oklab, var(--card) 94%, #0d1d33 6%));
}

@media (max-width: 640px) {
  .app-modal-panel {
    width: min(100%, calc(100vw - 20px));
    max-height: min(92vh, 100dvh - 20px);
    border-radius: 22px;
  }

  .app-modal-signature {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-modal-signature__copy {
    text-align: left;
  }
}
</style>
