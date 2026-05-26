<template>
  <div class="vig-page">
    <article class="vig-card vig-result" :class="online ? 'vig-result--info' : 'vig-result--warn'">
      <div class="vig-result-icon">
        <AppIcon :name="online ? 'ki-cloud-download' : 'ki-cloud'" :size="40" />
      </div>
      <h2>{{ online ? 'Pronto a sincronizar' : 'Modo offline' }}</h2>
      <p>
        {{ online
          ? 'Há registos por enviar. Sincroniza para passar tudo para o servidor.'
          : 'Os registos são guardados no telemóvel e enviados assim que houver ligação.'
        }}
      </p>
    </article>

    <section class="vig-section" v-if="queue.length">
      <header class="vig-section-head">
        <h3>Por enviar</h3>
        <span class="vig-section-count">{{ queue.length }}</span>
      </header>
      <article v-for="entry in queue" :key="entry.id" class="vig-card vig-queue-item">
        <div class="vig-queue-icon" :class="typeClass(entry.type)">
          <AppIcon :name="typeIcon(entry.type)" :size="18" />
        </div>
        <div class="vig-queue-body">
          <p class="vig-queue-title">{{ typeLabel(entry.type) }}</p>
          <p class="vig-queue-sub">{{ entry.label || '—' }} · {{ ago(entry.id) }}</p>
        </div>
        <button type="button" class="vig-queue-remove" @click="remove(entry.id)" title="Remover">
          <AppIcon name="ki-cross" :size="14" />
        </button>
      </article>
    </section>

    <article v-else class="vig-card vig-empty">
      <AppIcon name="ki-check-circle" :size="32" />
      <h3>Tudo sincronizado</h3>
      <p>Não há nada por enviar.</p>
    </article>

    <button
      v-if="queue.length"
      type="button"
      class="vig-btn vig-btn--primary vig-btn--block"
      :disabled="!online || syncing"
      @click="sync"
    >
      <span v-if="syncing" class="vig-spinner" />
      <AppIcon v-else name="ki-cloud-download" :size="18" />
      {{ syncing ? 'A sincronizar…' : (online ? 'Tentar sincronizar' : 'Aguarda ligação para sincronizar') }}
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { offlineQueue } from 'src/services/vigilante.service'

const $q = useQuasar()
const queue = ref([])
const online = ref(navigator.onLine)
const syncing = ref(false)

function refresh() { queue.value = offlineQueue.list() }
function setOnline() { online.value = true }
function setOffline() { online.value = false }

onMounted(() => {
  refresh()
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOffline)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})

function remove(id) {
  offlineQueue.remove(id)
  refresh()
}

async function sync() {
  syncing.value = true
  try {
    const result = await offlineQueue.drain()
    $q.notify({
      type: result.pending === 0 ? 'positive' : 'warning',
      message: result.pending === 0
        ? `${result.sent} registo(s) sincronizado(s).`
        : `${result.sent} enviado(s), ${result.pending} ainda por enviar.`,
      position: 'top',
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro a sincronizar.', position: 'top' })
  } finally {
    syncing.value = false
    refresh()
  }
}

function typeLabel(t) {
  return ({ 'check-in': 'Check-in', 'check-out': 'Check-out', incident: 'Ocorrência' })[t] || t
}
function typeIcon(t) {
  return ({ 'check-in': 'ki-check-circle', 'check-out': 'ki-time', incident: 'ki-warning-2' })[t] || 'ki-cloud'
}
function typeClass(t) {
  return ({ 'check-in': 'is-primary', 'check-out': 'is-warning', incident: 'is-danger' })[t] || 'is-primary'
}
function ago(ts) {
  const diff = Math.round((Date.now() - ts) / 60000)
  if (diff < 1) return 'agora'
  if (diff < 60) return `há ${diff} min`
  return `há ${Math.round(diff / 60)} h`
}
</script>

<style scoped>
@import './vigilante-shared.css';

.vig-result { text-align: center; padding: 28px 24px; }
.vig-result-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.vig-result--info { background: linear-gradient(135deg, #eff6ff, #e0f2fe); border-color: #93c5fd; color: #1e40af; }
.vig-result--warn { background: linear-gradient(135deg, #fff7ed, #fef3c7); border-color: #fcd34d; color: #92400e; }
.vig-result h2 { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
.vig-result p { font-size: 13px; opacity: .85; margin: 0; line-height: 1.5; }

.vig-queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}
.vig-queue-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
}
.vig-queue-icon.is-primary { background: #e0e7ff; color: #4f46e5; }
.vig-queue-icon.is-warning { background: #fef3c7; color: #b45309; }
.vig-queue-icon.is-danger { background: #fee2e2; color: #b91c1c; }
.vig-queue-body { flex: 1; min-width: 0; }
.vig-queue-title { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0; }
.vig-queue-sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }
.vig-queue-remove {
  background: transparent;
  border: none;
  width: 32px; height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
}
.vig-queue-remove:hover { background: #f1f5f9; color: #475569; }
</style>
