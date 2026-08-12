<template>
  <AdminPageTemplate
    eyebrow="Visão geral"
    title="Centro executivo"
    :description="`Leitura rápida da operação do PLUSE em ${today}.`"
  >
    <template #actions>
      <q-btn outline no-caps class="admin-hero-button" icon="refresh" label="Actualizar" :loading="loading" @click="fetchDashboard" />
      <q-btn unelevated no-caps class="admin-hero-primary" icon="add" label="Nova escala" :to="{ name: 'schedules' }" />
    </template>

    <template #meta>
      <span class="pluse-dashboard-meta"><AppIcon name="ki-time" :size="14" />{{ loading ? 'A actualizar...' : 'Dados em tempo real' }}</span>
      <span class="pluse-dashboard-meta"><AppIcon name="ki-shield-tick" :size="14" />Operação, presença e risco</span>
    </template>

    <template #hero>
      <div class="pluse-dashboard-hero-grid">
        <div v-for="item in heroStats" :key="item.label" class="pluse-dashboard-hero-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </template>

    <div class="pluse-dashboard">
      <section class="pluse-dashboard-kpis">
        <article v-for="card in kpiCards" :key="card.label" class="pluse-dashboard-kpi" :class="card.tone">
          <span class="pluse-dashboard-kpi-icon"><AppIcon :name="card.icon" :size="19" /></span>
          <span class="pluse-dashboard-kpi-label">{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <span class="pluse-dashboard-kpi-caption">{{ card.caption }}</span>
          <span class="pluse-dashboard-kpi-trend">{{ card.trend }}</span>
        </article>
      </section>

      <section class="pluse-dashboard-main-grid">
        <article class="pluse-dashboard-panel pluse-dashboard-chart-panel">
          <div class="pluse-dashboard-panel-head">
            <div><span>Cobertura</span><strong>Postos por estado operacional</strong></div>
            <span class="pluse-dashboard-chip success">{{ coverageRate }} coberto</span>
          </div>
          <AppApexChart type="bar" :height="280" :series="coverageSeries" :options="coverageOptions" />
        </article>

        <article class="pluse-dashboard-panel pluse-dashboard-chart-panel">
          <div class="pluse-dashboard-panel-head">
            <div><span>Presenças</span><strong>Turnos do dia</strong></div>
            <span class="pluse-dashboard-chip neutral">{{ totalShifts }} turnos</span>
          </div>
          <AppApexChart type="donut" :height="280" :series="attendanceSeries" :options="attendanceOptions" />
        </article>
      </section>

      <section class="pluse-dashboard-main-grid">
        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div><span>Acções prioritárias</span><strong>O que precisa de decisão</strong></div>
            <router-link :to="{ name: 'cco' }" class="kt-btn kt-btn-outline kt-btn-sm">Abrir Operações</router-link>
          </div>
          <div class="pluse-dashboard-tasks">
            <div v-for="task in tasks" :key="task.title" class="pluse-dashboard-task">
              <span :class="task.tone">{{ task.badge }}</span>
              <div><strong>{{ task.title }}</strong><p>{{ task.copy }}</p></div>
            </div>
          </div>
        </article>

        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div><span>Postos por cobrir</span><strong>Primeiros alvos de alocação</strong></div>
            <span class="pluse-dashboard-chip danger">{{ uncoveredPosts.length }}</span>
          </div>
          <div class="pluse-dashboard-compact-list">
            <div v-for="post in uncoveredPosts.slice(0, 5)" :key="post.id" class="pluse-dashboard-compact-row">
              <div><strong>{{ post.name }}</strong><p>{{ post.client_name }}</p></div>
              <router-link :to="{ name: 'cco' }" class="kt-btn kt-btn-outline kt-btn-sm">Alocar</router-link>
            </div>
            <AppEmptyState v-if="!uncoveredPosts.length" title="Tudo coberto" description="Não há postos totalmente descobertos neste momento." icon="ki-check-circle" />
          </div>
        </article>
      </section>

      <section class="pluse-dashboard-main-grid">
        <article class="pluse-dashboard-panel pluse-dashboard-chart-panel">
          <div class="pluse-dashboard-panel-head">
            <div><span>Ocorrências</span><strong>Distribuição por severidade</strong></div>
            <span class="pluse-dashboard-chip danger">{{ openIncidents }} abertas</span>
          </div>
          <AppApexChart type="bar" :height="260" :series="incidentSeries" :options="incidentOptions" />
        </article>

        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div><span>Faturação potencial</span><strong>Base mensal dos postos activos</strong></div>
            <span class="pluse-dashboard-chip success">{{ money(totalBilling) }}</span>
          </div>
          <div class="pluse-dashboard-compact-list">
            <div v-for="client in billingByClient" :key="client.name" class="pluse-dashboard-compact-row">
              <div><strong>{{ client.name }}</strong><p>{{ client.posts }} posto(s) activo(s)</p></div>
              <span>{{ money(client.amount) }}</span>
            </div>
            <AppEmptyState v-if="!billingByClient.length" title="Sem base financeira" description="Ainda não há postos activos com valor de facturação." icon="ki-dollar" />
          </div>
        </article>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppApexChart from 'src/components/ui/AppApexChart.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { ccoService, incidentService } from 'src/services/operations.service'
import { postService } from 'src/services/post.service'

const palette = {
  blue: '#3f6df6', emerald: '#16b981', amber: '#f59e0b', red: '#ef4444', slate: '#64748b', grid: '#e5edf7',
}
const today = computed(() => new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
const todayIso = new Date().toISOString().slice(0, 10)
const loading = ref(false)
const state = reactive({ cco: null, posts: [], incidents: [] })

function rows(payload) { return payload?.results ?? payload ?? [] }
function number(value) { return new Intl.NumberFormat('pt-PT').format(Number(value || 0)) }
function money(value) { return `${number(Math.round(Number(value || 0)))} MT` }

async function fetchDashboard() {
  loading.value = true
  try {
    const [cco, posts, incidents] = await Promise.allSettled([
      ccoService.overview(todayIso),
      postService.list({ page_size: 500 }),
      incidentService.list({ state__in: 'registered,validated', page_size: 300 }),
    ])
    state.cco = cco.status === 'fulfilled' ? cco.value : null
    state.posts = posts.status === 'fulfilled' ? rows(posts.value) : []
    state.incidents = incidents.status === 'fulfilled' ? rows(incidents.value) : []
  } finally {
    loading.value = false
  }
}
onMounted(fetchDashboard)

const stats = computed(() => state.cco?.stats || {})
const totalPosts = computed(() => stats.value.posts_total || 0)
const totalShifts = computed(() => number(stats.value.total_shifts || 0))
const openIncidents = computed(() => number(stats.value.open_incidents || state.incidents.length))
const coverageRate = computed(() => totalPosts.value ? `${Math.round(((stats.value.posts_covered || 0) / totalPosts.value) * 100)}%` : '0%')
const attendanceRate = computed(() => {
  const total = stats.value.total_shifts || 0
  const valid = (stats.value.present || 0) + (stats.value.substituted || 0)
  return total ? `${Math.round((valid / total) * 100)}%` : '0%'
})
const uncoveredPosts = computed(() => state.cco?.posts?.filter((post) => post.coverage === 'uncovered') || [])

const heroStats = computed(() => [
  { label: 'Cobertura', value: coverageRate.value },
  { label: 'Presença validada', value: attendanceRate.value },
  { label: 'Ocorrências abertas', value: openIncidents.value },
])
const kpiCards = computed(() => [
  { label: 'Postos activos', value: number(totalPosts.value), caption: `${number(stats.value.posts_covered || 0)} cobertos`, trend: `${number(stats.value.posts_uncovered || 0)} descobertos`, icon: 'ki-geolocation', tone: 'is-blue' },
  { label: 'Turnos hoje', value: number(stats.value.total_shifts || 0), caption: `${number(stats.value.pending || 0)} por marcar`, trend: `${number(stats.value.absent || 0)} faltas`, icon: 'ki-calendar', tone: 'is-amber' },
  { label: 'Check-ins válidos', value: number((stats.value.present || 0) + (stats.value.substituted || 0)), caption: 'presenças e substituições', trend: attendanceRate.value, icon: 'ki-qr-code', tone: 'is-green' },
  { label: 'Ocorrências', value: openIncidents.value, caption: 'registadas ou validadas', trend: 'prioridade', icon: 'ki-warning-2', tone: 'is-red' },
])

const chartBase = { dataLabels: { enabled: false }, grid: { borderColor: palette.grid, strokeDashArray: 4 }, tooltip: { theme: 'light' } }
const coverageSeries = computed(() => [{ name: 'Postos', data: [stats.value.posts_covered || 0, stats.value.posts_partial || 0, stats.value.posts_uncovered || 0] }])
const coverageOptions = computed(() => ({ ...chartBase, colors: [palette.blue], plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } }, xaxis: { categories: ['Cobertos', 'Parciais', 'Descobertos'] }, legend: { show: false } }))
const attendanceSeries = computed(() => [stats.value.present || 0, stats.value.substituted || 0, stats.value.absent || 0, stats.value.pending || 0])
const attendanceOptions = computed(() => ({ labels: ['Presentes', 'Substituídos', 'Faltas', 'Pendentes'], colors: [palette.emerald, palette.blue, palette.red, palette.amber], legend: { position: 'bottom' }, stroke: { width: 0 } }))

const severityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica' }
const incidentGroups = computed(() => {
  const map = new Map([['low', 0], ['medium', 0], ['high', 0], ['critical', 0]])
  for (const incident of state.incidents) map.set(incident.severity, (map.get(incident.severity) || 0) + 1)
  return [...map.entries()]
})
const incidentSeries = computed(() => [{ name: 'Ocorrências', data: incidentGroups.value.map(([, value]) => value) }])
const incidentOptions = computed(() => ({ ...chartBase, colors: [palette.red], plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: '48%' } }, xaxis: { categories: incidentGroups.value.map(([key]) => severityLabels[key] || key) }, legend: { show: false } }))

const tasks = computed(() => [
  { title: 'Alocar postos descobertos', copy: `${number(stats.value.posts_uncovered || 0)} posto(s) precisam de vigilante.`, badge: number(stats.value.posts_uncovered || 0), tone: 'is-red' },
  { title: 'Validar presenças pendentes', copy: `${number(stats.value.pending || 0)} turno(s) ainda não foram marcados.`, badge: number(stats.value.pending || 0), tone: 'is-amber' },
  { title: 'Fechar ocorrências abertas', copy: `${openIncidents.value} ocorrência(s) ainda requerem acompanhamento.`, badge: openIncidents.value, tone: 'is-blue' },
])

const billingByClient = computed(() => {
  const map = new Map()
  for (const post of state.posts) {
    const amount = Number(post.billing_amount || 0)
    if (!amount) continue
    const name = post.client_name || 'Sem cliente'
    const item = map.get(name) || { name, posts: 0, amount: 0 }
    item.posts += 1
    item.amount += amount
    map.set(name, item)
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5)
})
const totalBilling = computed(() => billingByClient.value.reduce((sum, item) => sum + item.amount, 0))
</script>
<style>
.pluse-dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.pluse-dashboard-hero-action {
  border-color: var(--pluse-demo-hero-action-border);
  background: var(--pluse-demo-hero-action-bg);
  color: var(--pluse-demo-hero-action-text);
}

.pluse-dashboard-hero-primary {
  border-color: var(--pluse-demo-hero-primary-border);
  background: var(--pluse-demo-hero-primary-bg);
  color: var(--pluse-demo-hero-primary-text);
}

.pluse-dashboard-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--pluse-demo-meta-border);
  border-radius: 999px;
  background: var(--pluse-demo-meta-bg);
  color: var(--pluse-demo-meta-text);
  padding: 8px 11px;
  font-size: 0.85rem;
  font-weight: 700;
}

.pluse-dashboard-hero-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.pluse-dashboard-hero-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  border: 1px solid var(--pluse-demo-meta-border);
  border-radius: 14px;
  background: var(--pluse-demo-meta-bg);
  padding: 14px 16px;
}

.pluse-dashboard-hero-stat span {
  color: color-mix(in oklab, var(--pluse-demo-meta-text) 90%, transparent);
  font-size: 0.9rem;
  font-weight: 700;
}

.pluse-dashboard-hero-stat strong {
  color: var(--pluse-demo-hero-action-text);
  font-size: 1.45rem;
  font-weight: 800;
}

.pluse-dashboard-kpis,
.pluse-dashboard-main-grid,
.pluse-dashboard-secondary-grid {
  display: grid;
  gap: 18px;
}

.pluse-dashboard-kpis {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pluse-dashboard-main-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.85fr);
}

.pluse-dashboard-secondary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pluse-dashboard-panel,
.pluse-dashboard-kpi {
  border: 1px solid color-mix(in oklab, var(--border) 86%, transparent);
  border-radius: 16px;
  background: color-mix(in oklab, var(--card) 96%, white 4%);
  box-shadow: 0 16px 38px color-mix(in oklab, black 14%, transparent);
}

.pluse-dashboard-kpi {
  position: relative;
  overflow: hidden;
  min-height: 150px;
  padding: 18px;
}

.pluse-dashboard-kpi::before {
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  content: '';
  background: var(--pluse-tone);
}

.pluse-dashboard-kpi::after {
  position: absolute;
  top: -34px;
  right: -26px;
  width: 92px;
  height: 92px;
  content: '';
  border-radius: 999px;
  background: var(--pluse-soft);
}

.pluse-dashboard-kpi-icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--pluse-soft);
  color: var(--pluse-tone);
}

.pluse-dashboard-kpi-label,
.pluse-dashboard-kpi-caption,
.pluse-dashboard-kpi-trend {
  position: relative;
  z-index: 1;
  display: block;
}

.pluse-dashboard-kpi-label {
  margin-top: 14px;
  color: var(--muted-foreground);
  font-size: 0.9rem;
  font-weight: 750;
}

.pluse-dashboard-kpi strong {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 4px;
  color: var(--foreground);
  font-size: 1.85rem;
  font-weight: 850;
  line-height: 1;
}

.pluse-dashboard-kpi-caption {
  margin-top: 14px;
  color: var(--muted-foreground);
  font-size: 0.88rem;
}

.pluse-dashboard-kpi-trend {
  margin-top: 10px;
  color: var(--pluse-tone);
  font-size: 0.82rem;
  font-weight: 800;
}

.pluse-dashboard-panel {
  min-width: 0;
  padding: 18px;
}

.pluse-dashboard-chart-panel {
  min-height: 366px;
}

.pluse-dashboard-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.pluse-dashboard-panel-head.compact {
  margin-bottom: 12px;
}

.pluse-dashboard-panel-head span {
  display: block;
  color: var(--muted-foreground);
  font-size: 0.84rem;
  font-weight: 800;
}

.pluse-dashboard-panel-head strong {
  display: block;
  margin-top: 4px;
  color: var(--foreground);
  font-size: 1.05rem;
  font-weight: 850;
}

.pluse-dashboard-chip {
  flex: none;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 800;
}

.pluse-dashboard-chip.success {
  background: #dcfce7;
  color: #047857;
}

.pluse-dashboard-chip.danger {
  background: #fee2e2;
  color: #dc2626;
}

.pluse-dashboard-chip.neutral {
  background: #eef4ff;
  color: #3152b8;
}

.pluse-dashboard-insights,
.pluse-dashboard-tasks,
.pluse-dashboard-billing,
.pluse-dashboard-compact-list,
.pluse-dashboard-timeline {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.pluse-dashboard-flow {
  padding: 18px;
}

.pluse-dashboard-flow-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.pluse-dashboard-flow-step {
  position: relative;
  display: flex;
  min-width: 0;
  gap: 12px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  border-radius: 14px;
  background: color-mix(in oklab, var(--card) 92%, var(--muted) 8%);
  color: inherit;
  padding: 13px;
  text-decoration: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.pluse-dashboard-flow-step:hover {
  border-color: color-mix(in oklab, var(--pluse-tone) 38%, var(--border));
  box-shadow: 0 14px 30px color-mix(in oklab, black 16%, transparent);
  transform: translateY(-1px);
}

.pluse-dashboard-flow-step > span {
  display: grid;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--pluse-soft);
  color: var(--pluse-tone);
  place-items: center;
}

.pluse-dashboard-flow-step strong {
  display: block;
  color: var(--foreground);
  font-size: 0.95rem;
  font-weight: 850;
}

.pluse-dashboard-flow-step p {
  margin: 4px 0 0;
  color: var(--muted-foreground);
  font-size: 0.82rem;
  line-height: 1.42;
}

.pluse-dashboard-insight,
.pluse-dashboard-task,
.pluse-dashboard-billing-row,
.pluse-dashboard-compact-row,
.pluse-dashboard-event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  border-radius: 13px;
  background: color-mix(in oklab, var(--card) 92%, var(--muted) 8%);
  padding: 12px;
}

.pluse-dashboard-insight > span,
.pluse-dashboard-task > span {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--pluse-soft);
  color: var(--pluse-tone);
  font-weight: 850;
}

.pluse-dashboard-insight strong,
.pluse-dashboard-task strong,
.pluse-dashboard-billing-row strong,
.pluse-dashboard-event strong {
  color: var(--foreground);
  font-size: 0.95rem;
  font-weight: 800;
}

.pluse-dashboard-insight p,
.pluse-dashboard-task p,
.pluse-dashboard-billing-row p,
.pluse-dashboard-event p {
  margin: 4px 0 0;
  color: var(--muted-foreground);
  font-size: 0.87rem;
  line-height: 1.45;
}

.pluse-dashboard-billing-row {
  align-items: center;
  justify-content: space-between;
}
.pluse-dashboard-compact-row {
  align-items: center;
  justify-content: space-between;
}

.pluse-dashboard-billing-row > span,
.pluse-dashboard-compact-row > span {
  color: color-mix(in oklab, var(--pluse-emerald-500) 82%, var(--foreground));
  font-size: 0.95rem;
  font-weight: 850;
}

.pluse-dashboard-timeline-panel {
  padding-bottom: 14px;
}

.pluse-dashboard-timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pluse-dashboard-event > span {
  flex: none;
  width: 10px;
  height: 10px;
  margin-top: 7px;
  border-radius: 999px;
  background: var(--pluse-tone);
  box-shadow: 0 0 0 5px var(--pluse-soft);
}

.pluse-dashboard-event time {
  margin-left: auto;
  color: var(--muted-foreground);
  font-size: 0.82rem;
  font-weight: 850;
}

.pluse-dashboard .apexcharts-canvas,
.pluse-dashboard .apexcharts-svg {
  max-width: 100%;
}

.pluse-dashboard .is-blue,
.pluse-dashboard-kpi.is-blue {
  --pluse-tone: #3f6df6;
  --pluse-soft: color-mix(in oklab, var(--pluse-tone) 17%, var(--card));
}

.pluse-dashboard .is-green,
.pluse-dashboard-kpi.is-green {
  --pluse-tone: #10b981;
  --pluse-soft: color-mix(in oklab, var(--pluse-tone) 16%, var(--card));
}

.pluse-dashboard .is-amber,
.pluse-dashboard-kpi.is-amber {
  --pluse-tone: #f59e0b;
  --pluse-soft: color-mix(in oklab, var(--pluse-tone) 15%, var(--card));
}

.pluse-dashboard .is-red,
.pluse-dashboard-kpi.is-red {
  --pluse-tone: #ef4444;
  --pluse-soft: color-mix(in oklab, var(--pluse-tone) 16%, var(--card));
}

@media (max-width: 1390px) {
  .pluse-dashboard-kpis,
  .pluse-dashboard-secondary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pluse-dashboard-flow-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pluse-dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pluse-dashboard-hero-grid,
  .pluse-dashboard-kpis,
  .pluse-dashboard-flow-steps,
  .pluse-dashboard-secondary-grid,
  .pluse-dashboard-timeline {
    grid-template-columns: 1fr;
  }

  .pluse-dashboard-hero-stat {
    align-items: flex-start;
    flex-direction: column;
  }

  .pluse-dashboard-panel,
  .pluse-dashboard-kpi {
    padding: 15px;
  }
}
</style>
