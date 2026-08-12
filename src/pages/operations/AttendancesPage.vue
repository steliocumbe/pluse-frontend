<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Presenças e Check-ins"
    :description="`Acompanhamento de entradas, atrasos, ausências e sincronização offline para ${activeViewLabel}.`"
  >
    <template #actions>
      <button type="button" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-filter" :size="16" icon-class="me-1.5" />
        {{ activeViewLabel }}
      </button>
      <router-link to="/cco" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-chart-line" :size="16" icon-class="me-1.5" />
        Abrir Base de Operações
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-qr-code" :size="14" />
        312 check-ins
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-time" :size="14" />
        18 atrasos monitorados
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

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Presenças de hoje</span>
              <strong>Check-ins por estado</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Exportar</button>
          </div>

          <div class="pluse-demo-table">
            <div class="pluse-demo-table-head posts">
              <span>Vigilante</span>
              <span>Posto</span>
              <span>Hora</span>
              <span>Validação</span>
              <span>Estado</span>
            </div>
            <div v-for="row in attendances" :key="row.name" class="pluse-demo-table-row posts">
              <div class="pluse-demo-identity">
                <span>{{ row.initials }}</span>
                <div>
                  <strong>{{ row.name }}</strong>
                  <p>{{ row.role }}</p>
                </div>
              </div>
              <span>{{ row.post }}</span>
              <span>{{ row.time }}</span>
              <span>{{ row.validation }}</span>
              <AppBadge :variant="row.variant">{{ row.status }}</AppBadge>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Offline e exceções</span>
              <strong>Fila de sincronização</strong>
            </div>
            <AppBadge variant="warning">14 pendentes</AppBadge>
          </div>

          <div class="pluse-demo-alert-stack">
            <div v-for="item in syncQueue" :key="item.title" class="pluse-demo-alert" :class="item.tone">
              <span class="pluse-demo-card-icon" :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.copy }}</p>
              </div>
              <AppBadge :variant="item.variant">{{ item.badge }}</AppBadge>
            </div>
          </div>
        </article>
      </section>

      <section class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Linha do tempo</span>
            <strong>Últimos eventos operacionais</strong>
          </div>
          <AppBadge variant="primary">Ao vivo</AppBadge>
        </div>

        <div class="pluse-demo-timeline-grid">
          <article v-for="event in timeline" :key="event.title" class="pluse-demo-time-event" :class="event.tone">
            <time>{{ event.time }}</time>
            <strong>{{ event.title }}</strong>
            <p>{{ event.copy }}</p>
          </article>
        </div>
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
  const map = {
    ongoing: 'em curso',
    today: 'hoje',
    late: 'atrasos',
    'missing-checkout': 'sem check-out',
  }
  return map[route.params.view] || 'operação atual'
})

const stats = [
  { label: 'Check-ins confirmados', value: '312', copy: 'entrada validada por GPS ou QR Code', icon: 'ki-qr-code', tone: 'is-green' },
  { label: 'Atrasos', value: '18', copy: '9 resolvidos nas últimas 2 horas', icon: 'ki-time', tone: 'is-amber' },
  { label: 'Ausências', value: '7', copy: 'postos aguardam substituição', icon: 'ki-user-cross', tone: 'is-red' },
  { label: 'Offline pendente', value: '14', copy: 'check-ins aguardam sincronização', icon: 'ki-cloud', tone: 'is-blue' },
]

const attendances = [
  { initials: 'JM', name: 'João Mucavele', role: 'Vigilante', post: 'MozMall Entrada Norte', time: '05:52', validation: 'GPS + QR', status: 'Confirmado', variant: 'success' },
  { initials: 'LC', name: 'Lúcia Cossa', role: 'Vigilante', post: 'Banco Central Cofre', time: '06:04', validation: 'GPS + Foto', status: 'Confirmado', variant: 'primary' },
  { initials: 'RM', name: 'Rui Matola', role: 'Vigilante', post: 'Porto Gate 4', time: '06:31', validation: 'GPS fora do raio', status: 'Atraso', variant: 'warning' },
  { initials: 'AM', name: 'Ana Macamo', role: 'Vigilante', post: 'Hospital Ala Sul', time: '—', validation: 'Sem registo', status: 'Ausente', variant: 'danger' },
]

const syncQueue = [
  { title: 'Check-ins offline guardados', copy: '14 presenças foram registadas sem internet e aguardam envio automático.', badge: '14', variant: 'warning', icon: 'ki-cloud', tone: 'is-amber' },
  { title: 'Fora do raio permitido', copy: '3 entradas precisam de validação do supervisor antes de contar para faturação.', badge: '3', variant: 'danger', icon: 'ki-geolocation', tone: 'is-red' },
  { title: 'Fotos por validar', copy: '6 postos críticos exigem verificação visual no início do turno.', badge: '6', variant: 'info', icon: 'ki-picture', tone: 'is-blue' },
]

const timeline = [
  { time: '09:42', title: 'Check-in fora do raio', copy: 'Porto Gate 4 enviado para revisão do supervisor.', tone: 'is-amber' },
  { time: '09:18', title: 'Presença confirmada', copy: 'Banco Central Cofre validado com GPS e foto.', tone: 'is-green' },
  { time: '08:57', title: 'Ausência escalada', copy: 'Hospital Ala Sul sem vigilante no início do turno.', tone: 'is-red' },
  { time: '08:20', title: 'Sincronização concluída', copy: '8 registos offline entraram na base operacional.', tone: 'is-blue' },
]
</script>
