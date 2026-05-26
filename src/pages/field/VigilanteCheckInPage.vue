<template>
  <div class="vig-page">
    <!-- Cabeçalho do posto -->
    <article class="vig-card vig-target" v-if="post">
      <div class="vig-target-icon">
        <AppIcon name="ki-geolocation" :size="22" />
      </div>
      <div class="vig-target-body">
        <p class="vig-eyebrow">{{ isCheckOut ? 'Saída' : 'Entrada' }} · {{ shift?.period_display }}</p>
        <h2>{{ post.name }}</h2>
        <p>{{ post.client_name }}</p>
      </div>
    </article>

    <!-- Estado do GPS -->
    <article class="vig-card vig-gps-card" :class="gpsTone">
      <div class="vig-gps-head">
        <AppIcon :name="gpsIcon" :size="34" />
        <div>
          <p class="vig-gps-title">{{ gpsTitle }}</p>
          <p class="vig-gps-sub">{{ gpsSub }}</p>
        </div>
      </div>

      <div v-if="gps" class="vig-gps-stats">
        <div>
          <span>Distância</span>
          <strong v-if="distance != null">{{ Math.round(distance) }} m</strong>
          <strong v-else>—</strong>
        </div>
        <div>
          <span>Precisão</span>
          <strong>±{{ Math.round(gps.accuracy || 0) }} m</strong>
        </div>
        <div v-if="post?.geofence_radius_m">
          <span>Raio</span>
          <strong>{{ post.geofence_radius_m }} m</strong>
        </div>
      </div>

      <button
        v-if="!gps && !gettingPosition"
        type="button"
        class="vig-btn vig-btn--ghost"
        @click="getGps"
      >
        <AppIcon name="ki-refresh" :size="16" /> Tentar novamente
      </button>
    </article>

    <!-- Ligação -->
    <div class="vig-link-row">
      <div :class="['vig-link-pill', online ? 'is-online' : 'is-offline']">
        <span class="vig-link-dot" />
        {{ online ? 'Online — envio imediato' : 'Offline — guardar para sincronizar' }}
      </div>
    </div>

    <!-- Acções -->
    <div class="vig-bottom-actions">
      <button
        type="button"
        class="vig-btn vig-btn--primary vig-btn--block"
        :disabled="submitting || (!canSubmit && online)"
        @click="onSubmit"
      >
        <span v-if="submitting" class="vig-spinner" />
        <AppIcon v-else :name="isCheckOut ? 'ki-time' : 'ki-check-circle'" :size="18" />
        {{ submitting ? 'A enviar…' : (isCheckOut ? 'Confirmar saída' : 'Confirmar check-in') }}
      </button>

      <button
        v-if="!online"
        type="button"
        class="vig-btn vig-btn--ghost vig-btn--block"
        @click="saveOffline"
      >
        <AppIcon name="ki-cloud" :size="18" /> Guardar offline
      </button>
    </div>

    <p v-if="submitError" class="vig-error">{{ submitError }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import {
  getCurrentPosition,
  offlineQueue,
  vigilanteService,
} from 'src/services/vigilante.service'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const isCheckOut = computed(() => route.query.mode === 'out')

const post = ref(null)
const shift = ref(null)
const gps = ref(null)
const gpsError = ref('')
const gettingPosition = ref(false)
const submitting = ref(false)
const submitError = ref('')

const online = ref(navigator.onLine)
function setOnline() { online.value = true }
function setOffline() { online.value = false }

onMounted(async () => {
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOffline)
  await loadToday()
  await getGps()
})
onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})

async function loadToday() {
  const data = await vigilanteService.today()
  post.value = data.post
  shift.value = data.shift
}

async function getGps() {
  gpsError.value = ''
  gettingPosition.value = true
  try {
    gps.value = await getCurrentPosition()
  } catch (err) {
    gps.value = null
    gpsError.value = err.message
  } finally {
    gettingPosition.value = false
  }
}

// ── Validação GPS local ─────────────────────────────────────────────────
function haversine(a, b) {
  if (!a || !b) return null
  const r = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const A = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(A))
}

const distance = computed(() => {
  if (!gps.value || !post.value || post.value.latitude == null) return null
  return haversine(
    { lat: post.value.latitude, lng: post.value.longitude },
    { lat: gps.value.latitude, lng: gps.value.longitude },
  )
})

const withinRadius = computed(() => {
  if (distance.value == null || !post.value?.geofence_radius_m) return null
  return distance.value <= post.value.geofence_radius_m
})

const canSubmit = computed(() => {
  if (!post.value?.geofence_radius_m) return true
  return withinRadius.value === true
})

const gpsTone = computed(() => {
  if (gpsError.value) return 'is-error'
  if (gettingPosition.value) return 'is-loading'
  if (!gps.value) return 'is-loading'
  if (withinRadius.value === false) return 'is-error'
  if (withinRadius.value === true) return 'is-success'
  return 'is-success'  // gps obtido sem geofence configurada
})

const gpsIcon = computed(() => {
  if (gpsError.value || withinRadius.value === false) return 'ki-warning-2'
  if (!gps.value) return 'ki-geolocation'
  return 'ki-shield-tick'
})

const gpsTitle = computed(() => {
  if (gettingPosition.value) return 'A obter localização…'
  if (gpsError.value) return 'GPS indisponível'
  if (!gps.value) return 'Sem leitura GPS'
  if (withinRadius.value === false) return 'Fora do raio permitido'
  if (withinRadius.value === true) return 'Dentro do raio'
  return 'GPS validado'
})

const gpsSub = computed(() => {
  if (gpsError.value) return gpsError.value
  if (gettingPosition.value) return 'Verifica que tens GPS activado no telemóvel.'
  if (withinRadius.value === false) {
    return `Estás a ${Math.round(distance.value)} m do posto. Aproxima-te até ao raio de ${post.value?.geofence_radius_m} m.`
  }
  if (withinRadius.value === true) return 'Podes confirmar a presença.'
  if (gps.value) return 'Sem geofence configurada — envia presença na mesma.'
  return ''
})

// ── Submissão ──────────────────────────────────────────────────────────
async function onSubmit() {
  submitError.value = ''
  submitting.value = true
  try {
    const payload = {
      shift_id: shift.value?.id,
      latitude: gps.value?.latitude,
      longitude: gps.value?.longitude,
    }
    if (isCheckOut.value) {
      await vigilanteService.checkOut(payload)
    } else {
      await vigilanteService.checkIn(payload)
    }
    router.push({ name: 'vigilante-result', query: { mode: isCheckOut.value ? 'out' : 'in' } })
  } catch (err) {
    const data = err.response?.data
    if (data?.distance_m != null) {
      submitError.value = `Fora do raio permitido (${data.distance_m} m). Aproxima-te do posto.`
    } else {
      submitError.value = data?.detail || 'Falha ao enviar. Tenta novamente.'
    }
  } finally {
    submitting.value = false
  }
}

function saveOffline() {
  const payload = {
    shift_id: shift.value?.id,
    latitude: gps.value?.latitude,
    longitude: gps.value?.longitude,
    offline_marked_at: new Date().toISOString(),
  }
  offlineQueue.add({
    type: isCheckOut.value ? 'check-out' : 'check-in',
    payload,
    label: `${isCheckOut.value ? 'Saída' : 'Entrada'} ${post.value?.name || ''}`,
  })
  $q.notify({ type: 'positive', message: 'Guardado para sincronizar mais tarde.', position: 'top' })
  router.push({ name: 'vigilante-offline' })
}
</script>

<style scoped>
@import './vigilante-shared.css';

.vig-target {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vig-target-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #ede9fe;
  color: #4f46e5;
  display: inline-flex; align-items: center; justify-content: center;
}
.vig-target-body { min-width: 0; }
.vig-target-body h2 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 2px 0; }
.vig-target-body p { font-size: 12px; color: #64748b; margin: 0; }

.vig-gps-card { display: flex; flex-direction: column; gap: 16px; }
.vig-gps-card.is-success { background: linear-gradient(135deg, #dcfce7, #ecfdf5); border-color: #86efac; color: #14532d; }
.vig-gps-card.is-error { background: linear-gradient(135deg, #fee2e2, #fff1f2); border-color: #fca5a5; color: #7f1d1d; }
.vig-gps-card.is-loading { background: #f1f5f9; border-color: #e2e8f0; }

.vig-gps-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vig-gps-title { font-size: 16px; font-weight: 700; margin: 0; }
.vig-gps-sub { font-size: 13px; opacity: .85; margin: 4px 0 0; line-height: 1.4; }

.vig-gps-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  background: rgba(255,255,255,.6);
  border-radius: 10px;
  padding: 10px;
}
.vig-gps-stats span {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: .08em;
  opacity: .75;
}
.vig-gps-stats strong { display: block; font-size: 15px; margin-top: 2px; }

.vig-link-row { display: flex; justify-content: center; }
.vig-link-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
}
.vig-link-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
.vig-link-pill.is-online { background: #ecfdf5; color: #166534; }
.vig-link-pill.is-online .vig-link-dot { background: #34d399; }
.vig-link-pill.is-offline { background: #fef3c7; color: #92400e; }
.vig-link-pill.is-offline .vig-link-dot { background: #f59e0b; }

.vig-bottom-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }

.vig-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  margin: 0;
}
</style>
