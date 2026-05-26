<template>
  <div class="vig-page">
    <article v-if="loading" class="vig-card vig-loading">
      <span class="vig-spinner" /> A carregar posto…
    </article>

    <template v-else-if="post">
      <!-- Mapa / cartão de localização -->
      <article class="vig-card vig-map" :class="{ 'has-gps': hasGps }">
        <div class="vig-map-icon">
          <AppIcon name="ki-geolocation" :size="28" />
        </div>
        <div class="vig-map-body">
          <h2>{{ post.name }}</h2>
          <p v-if="post.location">{{ post.location }}</p>
          <p v-else class="vig-empty-sub" style="text-align:left">Sem endereço registado</p>
        </div>
        <a
          v-if="hasGps"
          :href="mapsUrl"
          target="_blank"
          rel="noopener"
          class="vig-btn vig-btn--ghost vig-map-btn"
        >
          <AppIcon name="ki-arrow-right" :size="14" /> Mapa
        </a>
      </article>

      <!-- Cartões com info -->
      <section class="vig-info-grid">
        <article class="vig-info">
          <span>Cliente</span>
          <strong>{{ post.client_name }}</strong>
        </article>
        <article class="vig-info">
          <span>Tipo de serviço</span>
          <strong>{{ post.service_type_display }}</strong>
        </article>
        <article class="vig-info" v-if="hasGps">
          <span>Raio permitido</span>
          <strong>{{ post.geofence_radius_m }} m</strong>
        </article>
        <article class="vig-info" v-if="post.is_armed">
          <span>Tipo</span>
          <strong class="text-danger">Posto armado</strong>
        </article>
      </section>

      <!-- Turno actual -->
      <section v-if="shift" class="vig-section">
        <header class="vig-section-head">
          <h3>Turno actual</h3>
        </header>
        <article class="vig-card vig-shift-info">
          <div>
            <p class="vig-shift-label">{{ shift.period_display }}</p>
            <p class="vig-shift-meta">
              {{ shift.checked_in_at ? `Entrada às ${time(shift.checked_in_at)}` : 'Sem check-in registado' }}
            </p>
          </div>
          <span :class="['vig-pill', statusClass(shift.attendance_status)]">
            {{ shift.attendance_status_display }}
          </span>
        </article>
      </section>

      <!-- Notas / instruções -->
      <section v-if="post.notes" class="vig-section">
        <header class="vig-section-head">
          <h3>Instruções</h3>
        </header>
        <article class="vig-card vig-notes">{{ post.notes }}</article>
      </section>

      <router-link to="/vigilante/check-in" class="vig-btn vig-btn--primary vig-btn--block">
        <AppIcon name="ki-check-circle" :size="18" /> Confirmar presença
      </router-link>
    </template>

    <article v-else class="vig-card vig-empty">
      <AppIcon name="ki-geolocation" :size="32" />
      <h3>Sem posto activo</h3>
      <p>Não tens turno agendado para hoje.</p>
    </article>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { vigilanteService } from 'src/services/vigilante.service'

const loading = ref(true)
const post = ref(null)
const shift = ref(null)

const hasGps = computed(() => post.value?.latitude != null && post.value?.longitude != null)
const mapsUrl = computed(() => {
  if (!hasGps.value) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${post.value.latitude},${post.value.longitude}`
})

async function load() {
  loading.value = true
  try {
    const data = await vigilanteService.today()
    post.value = data.post
    shift.value = data.shift
  } finally {
    loading.value = false
  }
}
onMounted(load)

function time(s) {
  if (!s) return '—'
  return new Date(s).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}
function statusClass(s) {
  return ({
    pending: 'vig-pill--warning',
    present: 'vig-pill--success',
    absent: 'vig-pill--danger',
    substituted: 'vig-pill--neutral',
  })[s] || 'vig-pill--neutral'
}
</script>

<style scoped>
@import './vigilante-shared.css';

.vig-map {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-color: rgba(63, 109, 246, 0.22);
  background:
    linear-gradient(135deg, rgba(15, 37, 68, 0.94), rgba(23, 107, 135, 0.86)),
    repeating-linear-gradient(45deg, transparent 0 18px, rgba(255, 255, 255, 0.12) 18px 19px);
  color: #ffffff;
}
.vig-map.has-gps { border-color: rgba(16, 185, 129, 0.28); }
.vig-map-icon {
  width: 44px; height: 44px;
  flex: none;
  border-radius: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}
.vig-map-body { flex: 1; min-width: 0; }
.vig-map-body h2 { font-size: 1.06rem; font-weight: 850; color: #ffffff; margin: 0 0 5px; line-height: 1.16; }
.vig-map-body p { font-size: 0.86rem; color: rgba(255, 255, 255, 0.76); margin: 0; }
.vig-map-btn { padding: 8px 12px; font-size: 12px; min-height: 36px; }

.vig-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.vig-info {
  border: 1px solid #dce5f1;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(15, 37, 68, 0.06);
  padding: 14px;
}
.vig-info span {
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
  color: #64748b;
}
.vig-info strong {
  display: block;
  margin-top: 6px;
  font-size: 0.96rem;
  font-weight: 850;
  color: #0f2544;
}
.vig-info .text-danger { color: #b91c1c; }

.vig-shift-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.vig-shift-label { font-size: 0.96rem; font-weight: 850; color: #0f2544; margin: 0; }
.vig-shift-meta { font-size: 0.84rem; color: #64748b; margin: 4px 0 0; }

.vig-notes {
  font-size: 0.9rem;
  color: #334155;
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
