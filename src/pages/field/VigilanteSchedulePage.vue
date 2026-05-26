<template>
  <div class="vig-page">
    <!-- Hero: turno actual -->
    <article class="vig-card vig-hero" v-if="todayShift">
      <header class="vig-hero-head">
        <div>
          <p class="vig-eyebrow">{{ relativeDate(todayShift.date) }} · {{ todayShift.period_display }}</p>
          <h2 class="vig-hero-title">{{ todayShift.post_name }}</h2>
          <p class="vig-hero-sub">{{ todayShift.client_name }}</p>
        </div>
        <span :class="['vig-pill', statusClass(todayShift.attendance_status)]">
          {{ todayShift.attendance_status_display }}
        </span>
      </header>

      <div class="vig-hero-meta">
        <span v-if="todayShift.location"><AppIcon name="ki-geolocation" :size="14" /> {{ todayShift.location }}</span>
        <span v-if="todayShift.is_double"><AppIcon name="ki-time" :size="14" /> Dobra</span>
      </div>

      <div class="vig-actions">
        <router-link
          v-if="todayShift.attendance_status === 'pending'"
          to="/vigilante/check-in"
          class="vig-btn vig-btn--primary"
        >
          <AppIcon name="ki-check-circle" :size="18" /> Iniciar check-in
        </router-link>

        <router-link
          v-else-if="todayShift.attendance_status === 'present' && !todayShift.checked_out_at"
          to="/vigilante/check-in?mode=out"
          class="vig-btn vig-btn--warning"
        >
          <AppIcon name="ki-time" :size="18" /> Marcar saída
        </router-link>

        <router-link to="/vigilante/posto" class="vig-btn vig-btn--ghost">
          <AppIcon name="ki-geolocation" :size="18" /> Ver posto
        </router-link>
      </div>
    </article>

    <!-- Estado vazio -->
    <article v-else-if="!loading" class="vig-card vig-empty">
      <AppIcon name="ki-calendar-tick" :size="32" />
      <h3>Sem turno para hoje</h3>
      <p>Os teus próximos turnos vão aparecer aqui.</p>
    </article>

    <!-- Loading -->
    <article v-if="loading" class="vig-card vig-loading">
      <span class="vig-spinner" /> A carregar escala…
    </article>

    <!-- Próximos turnos -->
    <section v-if="upcomingShifts.length" class="vig-section">
      <header class="vig-section-head">
        <h3>Próximos turnos</h3>
        <span class="vig-section-count">{{ upcomingShifts.length }}</span>
      </header>
      <article
        v-for="s in upcomingShifts"
        :key="s.id"
        class="vig-card vig-shift"
      >
        <div class="vig-shift-date">
          <strong>{{ dayOfMonth(s.date) }}</strong>
          <span>{{ monthShort(s.date) }}</span>
        </div>
        <div class="vig-shift-body">
          <p class="vig-shift-post">{{ s.post_name }}</p>
          <p class="vig-shift-sub">{{ s.client_name }} · {{ s.period_display }}</p>
        </div>
        <span :class="['vig-pill', statusClass(s.attendance_status)]">
          {{ s.attendance_status_display }}
        </span>
      </article>
    </section>

    <p v-if="!loading && !todayShift && !upcomingShifts.length" class="vig-empty-sub">
      Contacta o teu supervisor se acreditas que devias ter turno escalado.
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { vigilanteService } from 'src/services/vigilante.service'

const $q = useQuasar()
const loading = ref(false)
const shifts = ref([])

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const todayShift = computed(() => shifts.value.find((s) => s.date === todayISO()))
const upcomingShifts = computed(() => {
  const today = todayISO()
  return shifts.value.filter((s) => s.date > today).slice(0, 7)
})

async function load() {
  loading.value = true
  try {
    const data = await vigilanteService.schedule()
    shifts.value = data.shifts || []
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.detail || 'Falha a carregar a escala.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)

function dayOfMonth(d) {
  return d?.slice(8, 10) || '—'
}
function monthShort(d) {
  if (!d) return ''
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return months[Number(d.slice(5, 7)) - 1] || ''
}
function relativeDate(d) {
  if (!d) return ''
  if (d === todayISO()) return 'Hoje'
  const t = new Date(); t.setDate(t.getDate() + 1)
  if (d === t.toISOString().slice(0, 10)) return 'Amanhã'
  return d
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
.vig-hero {
  background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
  border: 1px solid #c7d2fe;
}
.vig-hero-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.vig-hero-title { font-size: 20px; font-weight: 700; color: #312e81; margin: 4px 0 2px; }
.vig-hero-sub { font-size: 13px; color: #4338ca; }
.vig-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #4338ca;
  margin-top: 12px;
}
.vig-hero-meta span { display: inline-flex; align-items: center; gap: 4px; }
.vig-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
@media (min-width: 380px) {
  .vig-actions { flex-direction: row; flex-wrap: wrap; }
  .vig-actions > * { flex: 1; }
}

.vig-shift {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vig-shift-date {
  width: 48px;
  text-align: center;
  display: flex; flex-direction: column;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 6px 0;
}
.vig-shift-date strong { font-size: 18px; color: #1e293b; line-height: 1; }
.vig-shift-date span { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px; }
.vig-shift-body { flex: 1; min-width: 0; }
.vig-shift-post { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; }
.vig-shift-sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }
</style>
