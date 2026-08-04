<!--
  Universal system alert / confirmation modal.
  Designed for destructive and approval flows with snow-white glow,
  branded footer signature, and a polished entrance.
-->
<template>
  <AppModal v-model="openProxy" size="md" :persistent="persistent">
    <div class="modern-alert" :class="toneClass">
      <header class="modern-alert__head">
        <span class="modern-alert__icon" :class="`modern-alert__icon--${tone}`">
          <AppIcon :name="iconName" :size="18" />
        </span>
        <div class="min-w-0">
          <p v-if="eyebrow" class="modern-alert__eyebrow">{{ eyebrow }}</p>
          <h3 class="modern-alert__title">{{ title }}</h3>
          <p v-if="message" class="modern-alert__message" v-html="message" />
        </div>
      </header>

      <div v-if="$slots.default" class="modern-alert__content">
        <slot />
      </div>

      <footer class="modern-alert__footer">
        <span class="modern-alert__signature">{{ signature }}</span>
        <div class="modern-alert__actions">
          <q-btn flat no-caps :label="cancelLabel" :disable="loading" @click="emit('cancel')" />
          <q-btn
            v-if="showSecondary"
            outline
            no-caps
            :color="secondaryTone"
            :icon="secondaryIcon"
            :label="secondaryLabel"
            :loading="loading && activeAction === 'secondary'"
            @click="emit('secondary')"
          />
          <q-btn
            unelevated
            no-caps
            :color="confirmTone"
            :icon="confirmIcon"
            :label="confirmLabel"
            :loading="loading && activeAction === 'confirm'"
            @click="emit('confirm')"
          />
        </div>
      </footer>
    </div>
  </AppModal>
</template>

<script setup>
import { computed } from 'vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  signature: { type: String, default: 'MIGUEL M.C ERP' },
  tone: { type: String, default: 'primary' }, // primary | positive | negative | warning
  confirmLabel: { type: String, default: 'Confirmar' },
  confirmIcon: { type: String, default: 'check_circle' },
  confirmTone: { type: String, default: 'positive' },
  cancelLabel: { type: String, default: 'Cancelar' },
  secondaryLabel: { type: String, default: '' },
  secondaryIcon: { type: String, default: 'cancel' },
  secondaryTone: { type: String, default: 'negative' },
  showSecondary: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  activeAction: { type: String, default: 'confirm' },
  persistent: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'secondary'])

const openProxy = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const iconName = computed(() => {
  if (props.tone === 'negative') return 'ki-information-2'
  if (props.tone === 'warning') return 'ki-warning-2'
  if (props.tone === 'positive') return 'ki-check-circle'
  return 'ki-information-2'
})

const toneClass = computed(() => `modern-alert--${props.tone}`)
</script>

<style scoped>
.modern-alert {
  padding: 20px;
  background:
    radial-gradient(circle at top left, color-mix(in oklab, white 72%, var(--primary) 28%), transparent 42%),
    linear-gradient(180deg, color-mix(in oklab, var(--card) 96%, white), var(--card));
  color: var(--foreground);
}

.modern-alert__head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.modern-alert__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: none;
  color: white;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.45) inset,
    0 0 22px color-mix(in oklab, white 62%, transparent);
}

.modern-alert__icon--primary {
  background: linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 40%, white));
}

.modern-alert__icon--positive {
  background: linear-gradient(135deg, color-mix(in oklab, var(--pluse-emerald-500) 82%, white), var(--pluse-emerald-500));
}

.modern-alert__icon--negative {
  background: linear-gradient(135deg, color-mix(in oklab, var(--destructive) 82%, white), var(--destructive));
}

.modern-alert__icon--warning {
  background: linear-gradient(135deg, color-mix(in oklab, var(--pluse-amber-500) 82%, white), var(--pluse-amber-500));
}

.modern-alert__eyebrow {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.modern-alert__title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 780;
  color: var(--mono);
}

.modern-alert__message {
  margin: 6px 0 0;
  line-height: 1.45;
  color: var(--foreground);
}

.modern-alert__content {
  margin-top: 14px;
}

.modern-alert__footer {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.modern-alert__signature {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: color-mix(in oklab, var(--foreground) 72%, white 28%);
}

.modern-alert__actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 640px) {
  .modern-alert__footer {
    align-items: stretch;
  }

  .modern-alert__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
