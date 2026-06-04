<!--
  Banner global que aparece quando a licença está perto de expirar.

  Regras (alinhadas com o plano):
    > 30 dias  → não mostra nada
    ≤ 30 dias  → 🟡 amarelo (informativo)
    ≤ 7 dias   → 🔴 vermelho (urgente)
    ≤ 1 dia    → 🔴 vermelho pulsante (grave)

  Vitalícia ou inválida → não mostra nada (estado missing/expired vai
  para /locked, não precisa de banner).
-->
<template>
  <Transition name="license-banner">
    <div
      v-if="visible"
      class="license-banner"
      :class="[
        `is-${tone}`,
        { 'is-critical': days != null && days <= 1 },
      ]"
      role="alert"
    >
      <q-icon :name="icon" size="18px" class="license-banner__icon" />
      <div class="license-banner__body">
        <strong>{{ title }}</strong>
        <span class="license-banner__sub">{{ subtitle }}</span>
      </div>
      <q-btn
        flat dense no-caps icon="arrow_forward"
        label="Gerir licença"
        class="license-banner__action"
        :to="{ name: 'license-admin' }"
      />
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useLicenseStatus } from 'src/composables/useLicenseStatus'

const { state, daysRemaining, isLifetime, isValid } = useLicenseStatus()

const days = computed(() => daysRemaining.value)

const visible = computed(() => {
  if (!state.value) return false
  if (!isValid.value) return false
  if (isLifetime.value) return false
  if (days.value == null) return false
  return days.value <= 30
})

const tone = computed(() => {
  if (days.value == null) return 'info'
  if (days.value <= 7) return 'danger'
  return 'warning'
})

const icon = computed(() =>
  tone.value === 'danger' ? 'error' : 'event',
)

const title = computed(() => {
  if (days.value == null) return ''
  if (days.value <= 0) return 'A licença expira hoje.'
  if (days.value === 1) return 'A licença expira amanhã.'
  if (days.value <= 7) return `URGENTE — licença expira em ${days.value} dias.`
  return `A licença expira em ${days.value} dias.`
})

const subtitle = computed(() => {
  const customer = state.value?.customer
  if (days.value != null && days.value <= 7) {
    return `Contacte o fornecedor agora para evitar interrupção de serviço${customer ? ` — ${customer}` : ''}.`
  }
  return `Boa altura para renovar antes que expire${customer ? ` — ${customer}` : ''}.`
})
</script>

<style scoped>
.license-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  font-size: 0.86rem;
  border-bottom: 1px solid transparent;
  position: relative;
  z-index: 10;
}

.license-banner.is-warning {
  background: #fef3c7;
  color: #78350f;
  border-bottom-color: #fcd34d;
}
.license-banner.is-danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-bottom-color: #fca5a5;
}
.license-banner.is-critical {
  animation: license-pulse 2s ease-in-out infinite;
}

@keyframes license-pulse {
  0%, 100% { background: #fee2e2; }
  50% { background: #fecaca; }
}

.license-banner__icon { flex: none; }
.license-banner__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}
.license-banner__body strong { font-weight: 700; }
.license-banner__sub { opacity: 0.85; }
.license-banner__action {
  flex: none;
  font-weight: 700;
}

.license-banner-enter-active,
.license-banner-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.license-banner-enter-from,
.license-banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .license-banner {
    flex-wrap: wrap;
    padding: 10px 14px;
    font-size: 0.82rem;
  }
}
</style>
