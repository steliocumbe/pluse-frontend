<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Escalas"
    :description="`Planeamento de turnos, cobertura por posto e conflitos operacionais para ${activeViewLabel}.`"
  >
    <template #actions>
      <router-link to="/posts" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-geolocation" :size="16" icon-class="me-1.5" />
        Ver postos
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

      <section class="pluse-demo-flow">
        <div class="pluse-demo-section-head">
          <div>
            <span>Planeamento do dia</span>
            <strong>Grade de turnos por posto</strong>
          </div>
          <AppBadge variant="primary">{{ activeViewLabel }}</AppBadge>
        </div>

        <div class="pluse-demo-schedule-board">
          <div class="pluse-demo-schedule-cell pluse-demo-schedule-head">Posto</div>
          <div v-for="shift in shifts" :key="shift" class="pluse-demo-schedule-cell pluse-demo-schedule-head">
            {{ shift }}
          </div>

          <template v-for="post in scheduleRows" :key="post.name">
            <div class="pluse-demo-schedule-cell pluse-demo-schedule-post">
              <strong>{{ post.name }}</strong>
              <span>{{ post.client }}</span>
              <span>{{ post.location }}</span>
            </div>
            <div v-for="slot in post.slots" :key="`${post.name}-${slot.shift}`" class="pluse-demo-schedule-cell">
              <div class="pluse-demo-shift-card" :class="[slot.tone, { 'is-empty': slot.empty }]">
                <strong>{{ slot.title }}</strong>
                <span>{{ slot.copy }}</span>
                <div class="pluse-demo-shift-meta">
                  <AppBadge :variant="slot.variant">{{ slot.status }}</AppBadge>
                  <span>{{ slot.coverage }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Conflitos</span>
              <strong>Validações antes de publicar</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Resolver todos</button>
          </div>

          <div class="pluse-demo-tasks">
            <div v-for="task in conflicts" :key="task.title" class="pluse-demo-task">
              <span class="pluse-demo-card-icon" :class="task.tone">
                <AppIcon :name="task.icon" :size="17" />
              </span>
              <div>
                <strong>{{ task.title }}</strong>
                <p>{{ task.copy }}</p>
              </div>
              <span>{{ task.badge }}</span>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Cobertura</span>
              <strong>Resumo por turno</strong>
            </div>
          </div>

          <div class="pluse-demo-required-list">
            <div v-for="item in coverage" :key="item.title">
              <span class="pluse-demo-card-icon" :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.copy }}</p>
                <div class="pluse-demo-progress">
                  <span :style="{ '--value': item.value }" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const route = useRoute()

const activeViewLabel = computed(() => {
  const map = { 'by-post': 'por posto', 'by-employee': 'por colaborador' }
  return map[route.params.view] || 'calendário diário'
})

const stats = [
  { label: 'Cobertura prevista', value: '98%', copy: '181 de 184 postos cobertos', icon: 'ki-shield-tick', tone: 'is-blue' },
  { label: 'Escalas publicadas', value: '21', copy: 'prontas para check-in', icon: 'ki-calendar', tone: 'is-green' },
  { label: 'Em revisão', value: '12', copy: 'aguardam validação de operações', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Conflitos', value: '3', copy: 'bloqueiam cobertura completa', icon: 'ki-warning-2', tone: 'is-red' },
]

const shifts = ['06h-12h', '12h-18h', '18h-00h', '00h-06h']

const scheduleRows = [
  {
    name: 'MozMall Entrada Norte',
    client: 'MozMall Retail',
    location: 'Centro urbano',
    slots: [
      { shift: '06', title: 'João Mucavele', copy: 'Check-in previsto às 05:50', coverage: '2/2', status: 'Pronto', variant: 'success', tone: 'is-green' },
      { shift: '12', title: 'Lúcia Matavele', copy: 'Supervisor: Mateus Bila', coverage: '2/2', status: 'Pronto', variant: 'success', tone: 'is-green' },
      { shift: '18', title: 'Equipa noturna', copy: 'Falta confirmar substituto', coverage: '1/2', status: 'Risco', variant: 'danger', tone: 'is-red' },
      { shift: '00', title: 'Equipa noturna', copy: 'Continuação do turno', coverage: '2/2', status: 'Pronto', variant: 'success', tone: 'is-green' },
    ],
  },
  {
    name: 'Porto Gate 4',
    client: 'Porto Logística',
    location: 'Zona industrial',
    slots: [
      { shift: '06', title: 'Rui Cossa', copy: 'Ronda inicial obrigatória', coverage: '1/1', status: 'Pronto', variant: 'success', tone: 'is-green' },
      { shift: '12', title: 'Rui Cossa', copy: 'Possível conflito de horas', coverage: '1/1', status: 'Conflito', variant: 'warning', tone: 'is-amber' },
      { shift: '18', title: 'Por alocar', copy: 'Posto sem vigilante confirmado', coverage: '0/1', status: 'Aberto', variant: 'danger', tone: 'is-red', empty: true },
      { shift: '00', title: 'Por alocar', copy: 'Precisa de substituição', coverage: '0/1', status: 'Aberto', variant: 'danger', tone: 'is-red', empty: true },
    ],
  },
  {
    name: 'Banco Central Cofre',
    client: 'Banco Central',
    location: 'Baixa',
    slots: [
      { shift: '06', title: 'Equipa Alfa', copy: 'Posto crítico com QR + GPS', coverage: '3/3', status: 'Pronto', variant: 'primary', tone: 'is-blue' },
      { shift: '12', title: 'Equipa Alfa', copy: 'Troca assistida pelo supervisor', coverage: '3/3', status: 'Pronto', variant: 'primary', tone: 'is-blue' },
      { shift: '18', title: 'Equipa Beta', copy: 'Foto obrigatória no check-in', coverage: '3/3', status: 'Pronto', variant: 'primary', tone: 'is-blue' },
      { shift: '00', title: 'Equipa Beta', copy: 'Monitorado pela Base de Operações', coverage: '3/3', status: 'Pronto', variant: 'primary', tone: 'is-blue' },
    ],
  },
]

const conflicts = [
  { title: 'Vigilante com sobreposição', copy: 'Rui Cossa está em dois turnos consecutivos no Porto Gate 4.', badge: '1', icon: 'ki-warning-2', tone: 'is-amber' },
  { title: 'Posto sem cobertura', copy: 'Porto Gate 4 não tem vigilante confirmado para o turno noturno.', badge: '2', icon: 'ki-user-tick', tone: 'is-red' },
  { title: 'Supervisor por confirmar', copy: 'Três postos críticos ainda precisam de supervisor responsável.', badge: '3', icon: 'ki-shield-tick', tone: 'is-blue' },
]

const coverage = [
  { title: 'Turno diurno', copy: '96 vigilantes alocados de 98 necessários.', value: '98%', icon: 'ki-sun', tone: 'is-green' },
  { title: 'Turno noturno', copy: '85 vigilantes alocados de 88 necessários.', value: '96%', icon: 'ki-night-day', tone: 'is-amber' },
  { title: 'Postos críticos', copy: 'Todos os postos críticos têm supervisor definido.', value: '100%', icon: 'ki-shield-tick', tone: 'is-blue' },
]
</script>
