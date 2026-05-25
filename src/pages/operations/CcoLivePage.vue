<!--
  /cco — Centro de Controlo: painel ao vivo (Fase 4.2).
  Visão diária dos postos, cobertura, presenças e ocorrências em aberto.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · CCO"
    title="Centro de Controlo"
    description="Painel ao vivo — cobertura dos postos do dia, marcação de presenças e ocorrências em aberto."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-calendar" :size="14" />
        {{ formatDateLong(date) }}
      </span>
      <span v-if="data?.stats?.posts_uncovered" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="13" />
        {{ data.stats.posts_uncovered }} posto(s) por cobrir
      </span>
    </template>

    <template #actions>
      <q-input
        v-model="date" type="date" outlined dense stack-label
        class="admin-hero-button" style="min-width: 160px;"
        @update:model-value="fetch"
      />
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="refresh" label="Actualizar" :loading="loading" @click="fetch"
      />
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Registar ocorrência"
        :to="{ name: 'incidents' }"
      />
    </template>

    <div v-if="!data && loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <template v-else-if="data">
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-card__label">Postos cobertos</span>
          <div class="stat-card__row">
            <strong class="stat-card__value">{{ data.stats.posts_covered }}</strong>
            <span class="stat-card__suffix">/ {{ data.stats.posts_total }}</span>
          </div>
        </div>
        <div class="stat-card stat-card--warning">
          <span class="stat-card__label">Cobertura parcial</span>
          <strong class="stat-card__value">{{ data.stats.posts_partial }}</strong>
        </div>
        <div class="stat-card stat-card--danger">
          <span class="stat-card__label">Por cobrir</span>
          <strong class="stat-card__value">{{ data.stats.posts_uncovered }}</strong>
        </div>
        <div class="stat-card stat-card--success">
          <span class="stat-card__label">Presenças</span>
          <strong class="stat-card__value">{{ data.stats.present }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Faltas</span>
          <strong class="stat-card__value">{{ data.stats.absent }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Substituídos</span>
          <strong class="stat-card__value">{{ data.stats.substituted }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Por marcar</span>
          <strong class="stat-card__value">{{ data.stats.pending }}</strong>
        </div>
        <div class="stat-card stat-card--info">
          <span class="stat-card__label">Ocorrências em aberto</span>
          <strong class="stat-card__value">{{ data.stats.open_incidents }}</strong>
        </div>
      </div>

      <!-- Postos -->
      <section class="block-title">
        <AppIcon name="ki-geolocation" :size="16" />
        <span>Postos do dia</span>
      </section>

      <div v-if="!data.posts.length" class="text-sm text-muted-foreground py-4">
        Não há postos activos.
      </div>

      <div v-else class="posts-grid">
        <div v-for="post in data.posts" :key="post.id" class="post-card"
             :class="`post-card--${post.coverage}`">
          <header class="post-card__head">
            <div class="grow min-w-0">
              <div class="post-card__title">{{ post.name }}</div>
              <div class="post-card__sub">
                {{ post.client_name }} · {{ post.service_type_display }}
                <span v-if="post.is_armed" class="armed-tag">armado</span>
              </div>
            </div>
            <span class="coverage-pill" :class="`coverage-pill--${post.coverage}`">
              {{ coverageLabel(post.coverage) }}
            </span>
          </header>

          <div v-if="post.shifts.length" class="post-card__shifts">
            <div v-for="s in post.shifts" :key="s.id" class="shift-line">
              <span class="period-chip" :class="`period-chip--${s.period}`">
                {{ s.period_display }}
              </span>
              <div class="grow min-w-0">
                <div class="shift-line__name">{{ s.employee_name }}</div>
                <div v-if="s.substitute_name" class="shift-line__sub">
                  substituído por {{ s.substitute_name }}
                </div>
              </div>
              <AppBadge :variant="attendanceVariant(s.attendance_status)" size="sm">
                {{ s.attendance_status_display }}
              </AppBadge>
            </div>
          </div>
          <div v-else class="post-card__empty">
            Nenhum turno para hoje.
          </div>
        </div>
      </div>

      <!-- Ocorrências em aberto -->
      <section class="block-title">
        <AppIcon name="ki-warning-2" :size="16" />
        <span>Ocorrências em aberto</span>
        <router-link :to="{ name: 'incidents' }" class="block-title__link">
          Ver todas →
        </router-link>
      </section>

      <div v-if="!data.incidents.length" class="text-sm text-muted-foreground py-4">
        Sem ocorrências em aberto.
      </div>

      <div v-else class="flex flex-col gap-2">
        <div v-for="i in data.incidents" :key="i.id" class="incident-row">
          <span class="incident-row__dot" :class="`incident-row__dot--${i.severity}`" />
          <div class="grow min-w-0">
            <div class="incident-row__title">
              {{ i.incident_type_display }} — {{ i.post_name }}
            </div>
            <div class="incident-row__meta">
              {{ formatDateTime(i.occurred_at) }} · {{ i.description }}
            </div>
          </div>
          <AppBadge :variant="severityVariant(i.severity)" size="sm">{{ i.severity_display }}</AppBadge>
          <AppBadge :variant="incidentStateVariant(i.state)" size="sm">{{ i.state_display }}</AppBadge>
        </div>
      </div>
    </template>
  </AdminPageTemplate>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ccoService } from 'src/services/operations.service'
import { attendanceVariant } from 'src/config/scheduling'
import { severityVariant, incidentStateVariant } from 'src/config/operations'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'

const data = ref(null)
const loading = ref(false)
const date = ref(new Date().toISOString().slice(0, 10))

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
function formatDateLong(s) {
  if (!s) return ''
  try {
    const d = new Date(s)
    return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
  } catch { return s }
}
function formatDateTime(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString('pt-PT') } catch { return s }
}
function coverageLabel(c) {
  return { complete: 'Cobertura completa', partial: 'Cobertura parcial', uncovered: 'Por cobrir' }[c] || c
}

async function fetch() {
  loading.value = true
  try {
    data.value = await ccoService.overview(date.value)
  } finally {
    loading.value = false
  }
}

// Polling 30s — sincroniza o painel ao vivo. Pausa quando o utilizador deixa
// a página (visibility) para não bater no backend sem necessidade.
let timer = null
function startPolling() {
  stopPolling()
  timer = setInterval(fetch, 30000)
}
function stopPolling() {
  if (timer) { clearInterval(timer); timer = null }
}
function onVisibility() {
  if (document.hidden) stopPolling()
  else startPolling()
}

onMounted(async () => {
  await fetch()
  startPolling()
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}

/* ── Stats grid ──────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.stat-card {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.stat-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.stat-card__row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 3px;
}
.stat-card__value {
  display: block;
  margin-top: 3px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--mono);
}
.stat-card__row .stat-card__value { margin-top: 0; }
.stat-card__suffix { font-size: 0.9rem; color: var(--muted-foreground); }
.stat-card--success { background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 8%, var(--card)); }
.stat-card--warning { background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 8%, var(--card)); }
.stat-card--danger {
  background: color-mix(in oklab, var(--destructive) 8%, var(--card));
  border-color: color-mix(in oklab, var(--destructive) 30%, var(--border));
}
.stat-card--danger .stat-card__value { color: var(--destructive); }
.stat-card--info { background: color-mix(in oklab, var(--primary) 8%, var(--card)); }

/* ── Block titles ────────────────────────────────────────────────────── */
.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
}
.block-title__link {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.block-title__link:hover { text-decoration: underline; }

/* ── Posts grid ──────────────────────────────────────────────────────── */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.post-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.post-card--partial {
  border-color: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 38%, var(--border));
}
.post-card--uncovered {
  border-color: color-mix(in oklab, var(--destructive) 38%, var(--border));
}
.post-card__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 20%, transparent);
}
.post-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.post-card__sub {
  font-size: 0.74rem;
  color: var(--muted-foreground);
  margin-top: 2px;
}
.armed-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.coverage-pill {
  flex: none;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.coverage-pill--complete {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 18%, transparent);
  color: var(--pluse-emerald-600, #059669);
}
.coverage-pill--partial {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 20%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.coverage-pill--uncovered {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.post-card__shifts {
  display: flex;
  flex-direction: column;
}
.shift-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.shift-line:last-child { border-bottom: none; }
.shift-line__name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--foreground);
}
.shift-line__sub {
  font-size: 0.7rem;
  color: var(--muted-foreground);
}
.period-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.66rem;
  font-weight: 700;
  background: var(--muted);
  color: var(--muted-foreground);
}
.period-chip--day {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.period-chip--night {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
.post-card__empty {
  padding: 16px 14px;
  font-size: 0.8rem;
  color: var(--muted-foreground);
  font-style: italic;
}

/* ── Incidents list ──────────────────────────────────────────────────── */
.incident-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.incident-row__dot {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
}
.incident-row__dot--low { background: var(--muted-foreground); }
.incident-row__dot--medium { background: var(--pluse-cyan-500, #06b6d4); }
.incident-row__dot--high { background: var(--pluse-amber-500, #f59e0b); }
.incident-row__dot--critical { background: var(--destructive); }
.incident-row__title {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--mono);
}
.incident-row__meta {
  font-size: 0.74rem;
  color: var(--muted-foreground);
}
</style>
