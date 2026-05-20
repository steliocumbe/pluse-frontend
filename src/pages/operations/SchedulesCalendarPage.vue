<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Calendário de escalas"
    description="Planeamento visual dos turnos por dia, com conflitos, cobertura e ações de publicação antes da operação começar."
  >
    <template #actions>
      <router-link to="/schedules/by-post" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-geolocation" :size="16" icon-class="me-1.5" />
        Por posto
      </router-link>
      <button type="button" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Nova escala
      </button>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-calendar" :size="14" />
        24 escalas hoje
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-warning-2" :size="14" />
        3 conflitos por resolver
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-stats">
        <article v-for="item in stats" :key="item.label" class="pluse-demo-stat" :class="item.tone">
          <span class="pluse-demo-stat-icon">
            <AppIcon :name="item.icon" :size="19" />
          </span>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.copy }}</p>
        </article>
      </section>

      <section class="pluse-demo-calendar-layout">
        <article class="pluse-demo-panel pluse-demo-calendar-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Agenda operacional</span>
              <strong>Turnos do período</strong>
            </div>
            <AppBadge variant="primary">Maio 2026</AppBadge>
          </div>

          <FullCalendar :options="calendarOptions" />
        </article>

      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import dayGridPlugin from '@fullcalendar/daygrid'
import ptLocale from '@fullcalendar/core/locales/pt'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const stats = [
  { label: 'Cobertura prevista', value: '98%', copy: '181 de 184 postos cobertos', icon: 'ki-shield-tick', tone: 'is-blue' },
  { label: 'Escalas publicadas', value: '21', copy: 'prontas para check-in', icon: 'ki-calendar', tone: 'is-green' },
  { label: 'Em revisão', value: '12', copy: 'aguardam validação de operações', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Conflitos', value: '3', copy: 'bloqueiam cobertura completa', icon: 'ki-warning-2', tone: 'is-red' },
]

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  initialDate: '2026-05-13',
  locale: ptLocale,
  height: 'auto',
  nowIndicator: true,
  allDaySlot: false,
  slotMinTime: '05:00:00',
  slotMaxTime: '24:00:00',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
  },
  events: [
    { title: 'MozMall - Turno diurno', start: '2026-05-13T06:00:00', end: '2026-05-13T18:00:00', classNames: ['pluse-event-success'] },
    { title: 'Banco Central - 24h', start: '2026-05-13T06:00:00', end: '2026-05-14T06:00:00', classNames: ['pluse-event-primary'] },
    { title: 'Porto Gate 4 - Risco', start: '2026-05-13T18:00:00', end: '2026-05-14T06:00:00', classNames: ['pluse-event-danger'] },
    { title: 'Hospital Ala Sul - Sem cobertura', start: '2026-05-14T06:00:00', end: '2026-05-14T18:00:00', classNames: ['pluse-event-warning'] },
  ],
}

// const conflicts = [
//   { title: 'Posto sem vigilante', copy: 'Porto Gate 4 não tem cobertura completa para o turno noturno.', badge: 'Crítico', variant: 'danger', icon: 'ki-warning-2', tone: 'is-red' },
//   { title: 'Sobreposição de colaborador', copy: 'Rui Cossa aparece em dois turnos consecutivos.', badge: '1', variant: 'warning', icon: 'ki-time', tone: 'is-amber' },
//   { title: 'Supervisor por confirmar', copy: 'Três postos críticos aguardam responsável de ronda.', badge: '3', variant: 'info', icon: 'ki-shield-tick', tone: 'is-blue' },
// ]
</script>
