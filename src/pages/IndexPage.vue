<template>
  <AdminPageTemplate
    eyebrow="Visão geral"
    title="Dashboard administrativo"
    :description="`Resumo das operações, equipas e sinais críticos do PLUSE em ${today}.`"
  >
    <template #actions>
      <button type="button" class="kt-btn kt-btn-outline pluse-dashboard-hero-action">
        <AppIcon name="ki-cloud-download" :size="16" icon-class="me-1.5" />
        Exportar
      </button>
      <button type="button" class="kt-btn kt-btn-primary pluse-dashboard-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Nova escala
      </button>
    </template>

    <template #meta>
      <span class="pluse-dashboard-meta">
        <AppIcon name="ki-time" :size="14" />
        Actualizado agora
      </span>
      <span class="pluse-dashboard-meta">
        <AppIcon name="ki-shield-tick" :size="14" />
        Sessão segura
      </span>
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
          <span class="pluse-dashboard-kpi-icon">
            <AppIcon :name="card.icon" :size="19" />
          </span>
          <span class="pluse-dashboard-kpi-label">{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
          <span class="pluse-dashboard-kpi-caption">{{ card.caption }}</span>
          <span class="pluse-dashboard-kpi-trend">{{ card.trend }}</span>
        </article>
      </section>

      <section class="pluse-dashboard-alerts">
        <HrAlertsPanel :days="30" :limit="5" />
      </section>

      <section class="pluse-dashboard-main-grid">
        <article class="pluse-dashboard-panel pluse-dashboard-chart-panel">
          <div class="pluse-dashboard-panel-head">
            <div>
              <span>Operação diária</span>
              <strong>Check-ins vs. cobertura prevista</strong>
            </div>
            <span class="pluse-dashboard-chip success">95.7% validado</span>
          </div>
          <AppApexChart type="area" :height="282" :series="attendanceSeries" :options="attendanceOptions" />
        </article>

        <article class="pluse-dashboard-panel pluse-dashboard-chart-panel">
          <div class="pluse-dashboard-panel-head">
            <div>
              <span>Sinais críticos</span>
              <strong>Ocorrências por categoria</strong>
            </div>
            <span class="pluse-dashboard-chip danger">27 registos</span>
          </div>
          <AppApexChart type="bar" :height="282" :series="incidentSeries" :options="incidentOptions" />
        </article>
      </section>

      <section class="pluse-dashboard-secondary-grid">
        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div>
              <span>Resumo executivo</span>
              <strong>O que importa hoje</strong>
            </div>
          </div>

          <div class="pluse-dashboard-insights">
            <div v-for="item in insights" :key="item.title" class="pluse-dashboard-insight">
              <span :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.copy }}</p>
              </div>
            </div>
          </div>
        </article>

        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div>
              <span>Cobertura geográfica</span>
              <strong>Estado por zona operacional</strong>
            </div>
            <span class="pluse-dashboard-chip neutral">5 zonas</span>
          </div>
          <AppApexChart type="donut" :height="224" :series="zoneSeries" :options="zoneOptions" />
        </article>

        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div>
              <span>Prioridades</span>
              <strong>Ações recomendadas</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Ver tudo</button>
          </div>

          <div class="pluse-dashboard-tasks">
            <div v-for="task in tasks" :key="task.title" class="pluse-dashboard-task">
              <span :class="task.tone">{{ task.badge }}</span>
              <div>
                <strong>{{ task.title }}</strong>
                <p>{{ task.copy }}</p>
              </div>
            </div>
          </div>
        </article>

        <article class="pluse-dashboard-panel">
          <div class="pluse-dashboard-panel-head compact">
            <div>
              <span>Financeiro</span>
              <strong>Base de faturação do período</strong>
            </div>
            <span class="pluse-dashboard-chip success">87% pronto</span>
          </div>

          <div class="pluse-dashboard-billing">
            <div v-for="client in billingBase" :key="client.name" class="pluse-dashboard-billing-row">
              <div>
                <strong>{{ client.name }}</strong>
                <p>{{ client.posts }} postos, {{ client.presences }} presenças validadas</p>
              </div>
              <span>{{ client.amount }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="pluse-dashboard-panel pluse-dashboard-timeline-panel">
        <div class="pluse-dashboard-panel-head compact">
          <div>
            <span>Actividade recente</span>
            <strong>Linha do tempo operacional</strong>
          </div>
          <span class="pluse-dashboard-chip neutral">Ao vivo</span>
        </div>

        <div class="pluse-dashboard-timeline">
          <div v-for="event in timeline" :key="event.title" class="pluse-dashboard-event">
            <span :class="event.tone" />
            <div>
              <strong>{{ event.title }}</strong>
              <p>{{ event.copy }}</p>
            </div>
            <time>{{ event.time }}</time>
          </div>
        </div>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppApexChart from 'src/components/ui/AppApexChart.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import HrAlertsPanel from 'src/components/employment/HrAlertsPanel.vue'

const palette = {
  navy: '#0f2544',
  blue: '#3f6df6',
  cyan: '#0ea5e9',
  emerald: '#16b981',
  amber: '#f59e0b',
  red: '#ef4444',
  slate: '#64748b',
  grid: '#e5edf7',
}

const today = computed(() =>
  new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
)

const heroStats = [
  { label: 'Cobertura prevista', value: '98%' },
  { label: 'Escalas em revisão', value: '12' },
  { label: 'Alertas críticos', value: '3' },
]

const kpiCards = [
  {
    label: 'Cobertura prevista',
    value: '98%',
    caption: '181 de 184 postos cobertos',
    trend: '+4% vs ontem',
    icon: 'ki-shield-tick',
    tone: 'is-blue',
  },
  {
    label: 'Check-ins confirmados',
    value: '312',
    caption: 'entrada validada por localização',
    trend: '95.7%',
    icon: 'ki-qr-code',
    tone: 'is-green',
  },
  {
    label: 'Atrasos monitorados',
    value: '18',
    caption: '9 resolvidos nas ultimas 2h',
    trend: '-12%',
    icon: 'ki-time',
    tone: 'is-amber',
  },
  {
    label: 'Alertas críticos',
    value: '3',
    caption: 'requerem ação do Centro de Controlo Operacional',
    trend: 'Prioridade',
    icon: 'ki-warning-2',
    tone: 'is-red',
  },
]

const baseChart = {
  dataLabels: { enabled: false },
  grid: { borderColor: palette.grid, strokeDashArray: 4 },
  tooltip: { theme: 'light' },
  legend: { labels: { colors: palette.slate } },
}

const attendanceSeries = [
  { name: 'Check-ins confirmados', data: [46, 112, 92, 84, 107, 132, 96] },
  { name: 'Cobertura prevista', data: [50, 118, 96, 90, 111, 136, 100] },
]

const attendanceOptions = {
  ...baseChart,
  colors: [palette.blue, palette.emerald],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { opacityFrom: 0.32, opacityTo: 0.04 },
  },
  xaxis: { categories: ['06h', '08h', '10h', '12h', '14h', '16h', '18h'] },
  yaxis: { labels: { formatter: (value) => Math.round(value) } },
  legend: { position: 'top', horizontalAlign: 'right' },
}

const incidentSeries = [
  { name: 'Registos', data: [10, 7, 6, 4] },
]

const incidentOptions = {
  ...baseChart,
  colors: [palette.red],
  plotOptions: {
    bar: {
      borderRadius: 7,
      horizontal: true,
      barHeight: '46%',
      distributed: true,
    },
  },
  xaxis: { categories: ['Atrasos', 'Ausências', 'Rondas incompletas', 'Equipamento'] },
  legend: { show: false },
}

const zoneSeries = [62, 48, 33, 27, 14]
const zoneOptions = {
  labels: ['Centro urbano', 'Industrial', 'Norte', 'Sul', 'Remotos'],
  colors: [palette.blue, palette.emerald, palette.cyan, palette.amber, palette.red],
  stroke: { width: 0 },
  legend: { position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: { show: true, label: 'Postos', formatter: () => '184' },
        },
      },
    },
  },
}

const insights = [
  {
    title: 'Centro de Controlo Operacional acompanha a operação em tempo real',
    copy: 'Postos descobertos, atrasos, ausências e check-ins fora do raio ficam visíveis no mesmo painel.',
    icon: 'ki-monitor-mobile',
    tone: 'is-blue',
  },
  {
    title: 'Escalas alimentam presenças e faturação',
    copy: 'O fluxo importante para a apresentação e ligar contrato, posto, escala, presença validada e valor a faturar.',
    icon: 'ki-route',
    tone: 'is-green',
  },
  {
    title: 'Prioridades ficam acionáveis',
    copy: 'A dashboard destaca apenas o que precisa de decisão, sem transformar a página num relatório longo.',
    icon: 'ki-notification-status',
    tone: 'is-amber',
  },
]

const tasks = [
  {
    title: 'Resolver postos descobertos',
    copy: '3 postos sem vigilante confirmado para o próximo turno.',
    badge: '3',
    tone: 'is-red',
  },
  {
    title: 'Rever escalas em conflito',
    copy: '12 escalas precisam de ajuste antes do fecho operacional.',
    badge: '12',
    tone: 'is-amber',
  },
  {
    title: 'Sincronizar presenças offline',
    copy: '14 check-ins aguardam internet para entrar na base operacional.',
    badge: '14',
    tone: 'is-blue',
  },
]

const billingBase = [
  { name: 'MozMall Retail', posts: 18, presences: 426, amount: '1.280.000 MT' },
  { name: 'Porto Logística', posts: 12, presences: 311, amount: '940.000 MT' },
  { name: 'Banco Central', posts: 9, presences: 268, amount: '810.000 MT' },
]

const timeline = [
  {
    title: 'Check-in fora do raio permitido',
    copy: 'Posto Matola Centro, validação enviada ao supervisor.',
    time: '09:42',
    tone: 'is-amber',
  },
  {
    title: 'Ronda concluída sem ocorrências',
    copy: 'Supervisor fechou a ronda do turno da manhã.',
    time: '09:18',
    tone: 'is-green',
  },
  {
    title: 'Ocorrência crítica escalada',
    copy: 'Centro de Controlo Operacional notificou equipa de resposta e cliente.',
    time: '08:57',
    tone: 'is-red',
  },
]
</script>

<style>
.pluse-dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.pluse-dashboard-hero-action {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.pluse-dashboard-hero-primary {
  border-color: #ffffff;
  background: #ffffff;
  color: #0f2544;
}

.pluse-dashboard-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.88);
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
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  padding: 14px 16px;
}

.pluse-dashboard-hero-stat span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 700;
}

.pluse-dashboard-hero-stat strong {
  color: #ffffff;
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
  border: 1px solid #dce5f1;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(15, 37, 68, 0.07);
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
  color: #58708e;
  font-size: 0.9rem;
  font-weight: 750;
}

.pluse-dashboard-kpi strong {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 4px;
  color: #07111f;
  font-size: 1.85rem;
  font-weight: 850;
  line-height: 1;
}

.pluse-dashboard-kpi-caption {
  margin-top: 14px;
  color: #60758f;
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
  color: #60758f;
  font-size: 0.84rem;
  font-weight: 800;
}

.pluse-dashboard-panel-head strong {
  display: block;
  margin-top: 4px;
  color: #07111f;
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
.pluse-dashboard-timeline {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.pluse-dashboard-insight,
.pluse-dashboard-task,
.pluse-dashboard-billing-row,
.pluse-dashboard-event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid #e4ebf5;
  border-radius: 13px;
  background: #fbfdff;
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
  color: #07111f;
  font-size: 0.95rem;
  font-weight: 800;
}

.pluse-dashboard-insight p,
.pluse-dashboard-task p,
.pluse-dashboard-billing-row p,
.pluse-dashboard-event p {
  margin: 4px 0 0;
  color: #60758f;
  font-size: 0.87rem;
  line-height: 1.45;
}

.pluse-dashboard-billing-row {
  align-items: center;
  justify-content: space-between;
}

.pluse-dashboard-billing-row > span {
  color: #047857;
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
  color: #60758f;
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
  --pluse-soft: #e4ebff;
}

.pluse-dashboard .is-green,
.pluse-dashboard-kpi.is-green {
  --pluse-tone: #10b981;
  --pluse-soft: #dcfce7;
}

.pluse-dashboard .is-amber,
.pluse-dashboard-kpi.is-amber {
  --pluse-tone: #f59e0b;
  --pluse-soft: #fff3d7;
}

.pluse-dashboard .is-red,
.pluse-dashboard-kpi.is-red {
  --pluse-tone: #ef4444;
  --pluse-soft: #fee2e2;
}

@media (max-width: 1390px) {
  .pluse-dashboard-kpis,
  .pluse-dashboard-secondary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pluse-dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pluse-dashboard-hero-grid,
  .pluse-dashboard-kpis,
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
