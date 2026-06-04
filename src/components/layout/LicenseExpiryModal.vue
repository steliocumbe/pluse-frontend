<!--
  Modal de aviso quando a licença está perto de expirar.

  Regras de aparição (ortogonais ao banner persistente):
    > 7 dias     → não mostra
    4 a 7 dias   → mostra 1x por sessão (sessionStorage por license_id)
    1 a 3 dias   → mostra 1x por sessão MAS resetada se já se passou um
                   dia desde a última vista (uma vez por dia)
    0 dias       → mostra em cada montagem (não fechável até user clicar)

  Persistência: `sessionStorage` por chave que inclui o `license_id`. Quando
  o utilizador uploada uma nova licença, o id muda e tudo é "reset".
-->
<template>
  <q-dialog
    v-model="open"
    :persistent="!isDismissable"
    :no-esc-dismiss="!isDismissable"
    :no-backdrop-dismiss="!isDismissable"
  >
    <q-card class="expiry-modal">
      <div class="expiry-modal__header" :class="`is-${tone}`">
        <q-icon :name="iconName" size="36px" />
      </div>

      <q-card-section class="expiry-modal__body">
        <p class="expiry-modal__eyebrow">{{ eyebrow }}</p>
        <h2 class="expiry-modal__title">{{ title }}</h2>
        <p class="expiry-modal__sub">{{ subtitle }}</p>

        <ul class="expiry-modal__facts">
          <li v-if="state?.customer">
            <q-icon name="business" size="14px" />
            <span>Cliente:</span>
            <strong>{{ state.customer }}</strong>
          </li>
          <li v-if="state?.expires_at">
            <q-icon name="event" size="14px" />
            <span>Expira em:</span>
            <strong>{{ formatDate(state.expires_at) }}</strong>
          </li>
          <li>
            <q-icon name="fingerprint" size="14px" />
            <span>Esta máquina:</span>
            <strong class="text-mono">{{ machineCode || '—' }}</strong>
          </li>
        </ul>
      </q-card-section>

      <q-card-actions class="expiry-modal__actions">
        <q-btn
          v-if="isDismissable"
          flat no-caps label="Lembrar mais tarde"
          @click="dismiss"
        />
        <q-btn
          unelevated no-caps color="primary" icon="arrow_forward"
          label="Gerir licença agora"
          @click="goToAdmin"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLicenseStatus } from 'src/composables/useLicenseStatus'

const router = useRouter()
const { state, daysRemaining, isLifetime, isValid } = useLicenseStatus()

const open = ref(false)

// Estados visuais por bucket de dias ─────────────────────────────────
const days = computed(() => daysRemaining.value)
const tone = computed(() => {
  if (days.value == null) return 'info'
  if (days.value <= 1) return 'danger'
  if (days.value <= 3) return 'danger'
  return 'warning'
})

const iconName = computed(() => (tone.value === 'danger' ? 'warning' : 'event'))

const eyebrow = computed(() => {
  if (days.value == null) return 'Atenção'
  if (days.value <= 0) return 'EXPIRA HOJE'
  if (days.value === 1) return 'EXPIRA AMANHÃ'
  if (days.value <= 3) return 'CRÍTICO'
  return 'AVISO'
})

const title = computed(() => {
  if (days.value == null) return 'Licença vai expirar.'
  if (days.value <= 0) return 'A licença do sistema expira hoje.'
  if (days.value === 1) return 'A licença expira amanhã.'
  if (days.value <= 3) return `Faltam apenas ${days.value} dias.`
  return `A licença expira em ${days.value} dias.`
})

const subtitle = computed(() => {
  if (days.value != null && days.value <= 1) {
    return (
      'Quando expirar, todos os utilizadores ficam sem acesso ao sistema. ' +
      'Contacte o fornecedor agora para evitar interrupção.'
    )
  }
  return (
    'Recomendamos que contacte o fornecedor para receber uma nova licença ' +
    'antes que o prazo termine.'
  )
})

const isDismissable = computed(() => days.value == null || days.value > 1)

// ── Persistência ────────────────────────────────────────────────────
function dismissKey(licenseId, bucket) {
  return `pluse.license.dismissed.${licenseId || 'unknown'}.${bucket}`
}

function dayBucket() {
  const d = days.value
  if (d == null) return 'none'
  if (d <= 0) return 'today'
  if (d <= 1) return 'tomorrow'
  if (d <= 3) return 'critical'
  return 'warning'
}

function wasDismissedThisSession() {
  const id = state.value?.license_id
  const key = dismissKey(id, dayBucket())
  // Para buckets críticos (≤ 1 dia), só dismissa por X horas
  const raw = sessionStorage.getItem(key)
  if (!raw) return false
  if (days.value != null && days.value <= 1) {
    // Não permitimos dismissar quando expira hoje
    if (days.value <= 0) return false
    // Permitimos só por 2h quando falta < 1 dia
    const ts = Number(raw)
    return Number.isFinite(ts) && (Date.now() - ts) < 2 * 60 * 60 * 1000
  }
  return raw === '1' || Number.isFinite(Number(raw))
}

function markDismissedThisSession() {
  const id = state.value?.license_id
  const key = dismissKey(id, dayBucket())
  sessionStorage.setItem(key, String(Date.now()))
}

// ── Acções ──────────────────────────────────────────────────────────
function dismiss() {
  markDismissedThisSession()
  open.value = false
}

function goToAdmin() {
  markDismissedThisSession()
  open.value = false
  router.push({ name: 'license-admin' })
}

function formatDate(s) {
  if (!s) return ''
  try {
    return new Date(s).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return s }
}

// ── Lógica de quando mostrar ────────────────────────────────────────
function evaluate() {
  if (!state.value) return
  if (!isValid.value) return  // estado inválido → /locked, não modal
  if (isLifetime.value) return
  if (days.value == null) return
  if (days.value > 7) return

  if (wasDismissedThisSession()) return

  open.value = true
}

// Reage a mudanças no estado (primeira carga, refresh, nova licença, etc)
watch(
  [state, days],
  () => { evaluate() },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.expiry-modal {
  width: min(440px, 90vw);
  border-radius: 16px;
  overflow: hidden;
}

.expiry-modal__header {
  display: grid;
  place-items: center;
  padding: 28px 16px 22px;
  color: #fff;
}
.expiry-modal__header.is-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.expiry-modal__header.is-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}
.expiry-modal__header.is-info {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.expiry-modal__body {
  padding: 22px 24px 4px;
  text-align: center;
}
.expiry-modal__eyebrow {
  margin: 0 0 4px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #b45309;
}
.expiry-modal__title {
  margin: 0 0 10px;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
}
.expiry-modal__sub {
  margin: 0 auto 16px;
  max-width: 340px;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.5;
}

.expiry-modal__facts {
  list-style: none;
  margin: 12px 0 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.expiry-modal__facts li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: #0f172a;
}
.expiry-modal__facts li span {
  color: #64748b;
  font-weight: 500;
}
.expiry-modal__facts li strong {
  font-weight: 700;
  word-break: break-word;
}

.expiry-modal__actions {
  padding: 12px 16px 18px;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .expiry-modal__actions {
    justify-content: stretch;
  }
  .expiry-modal__actions :deep(.q-btn) { flex: 1; min-width: 0; }
}
</style>
