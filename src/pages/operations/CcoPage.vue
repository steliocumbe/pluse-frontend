<template>
  <AdminPageTemplate
    eyebrow="Centro de comando"
    title="Centro de Controlo Operacional"
    description="Painel denso e em tempo real para decidir sobre presenças, cobertura dos postos, atrasos, check-ins fora do raio e ocorrências abertas."
  >
    <template #actions>
      <router-link to="/cco/presences" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-check-circle" :size="16" icon-class="me-1.5" />
        Painel de presenças
      </router-link>
      <router-link to="/cco/incidents" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-notification-status" :size="16" icon-class="me-1.5" />
        Ocorrências abertas
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-shield-tick" :size="14" />
        181 postos cobertos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-warning-2" :size="14" />
        3 críticos
      </span>
    </template>

    <div class="pluse-demo-page">
      <CcoFilters />

      <section class="pluse-demo-stats">
        <router-link v-for="item in stats" :key="item.label" :to="item.to" class="pluse-demo-stat cco-link-card" :class="item.tone">
          <span class="pluse-demo-stat-icon">
            <AppIcon :name="item.icon" :size="19" />
          </span>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.copy }}</p>
        </router-link>
      </section>

      <section class="pluse-demo-command-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Fila operacional</span>
              <strong>Alertas que exigem decisão</strong>
            </div>
            <AppBadge variant="danger">3 críticos</AppBadge>
          </div>

          <div class="pluse-demo-alert-stack">
            <div v-for="alert in commandQueues" :key="alert.title" class="pluse-demo-alert" :class="alert.tone">
              <span class="pluse-demo-card-icon" :class="alert.tone">
                <AppIcon :name="alert.icon" :size="17" />
              </span>
              <div>
                <strong>{{ alert.title }}</strong>
                <p>{{ alert.copy }}</p>
              </div>
              <div class="cco-alert-right">
                <AppBadge :variant="alert.variant">{{ alert.badge }}</AppBadge>
                <small>{{ alert.time }}</small>
              </div>
            </div>
          </div>
        </article>

        <OperationsMap :posts="posts" :zoom="11" compact />
      </section>

      <section class="cco-command-links">
        <router-link v-for="link in commandLinks" :key="link.to" :to="link.to" class="cco-command-link" :class="link.tone">
          <span class="pluse-demo-card-icon" :class="link.tone">
            <AppIcon :name="link.icon" :size="18" />
          </span>
          <div>
            <strong>{{ link.title }}</strong>
            <p>{{ link.copy }}</p>
          </div>
          <AppIcon name="ki-arrow-right" :size="16" />
        </router-link>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import CcoFilters from 'src/components/operations/CcoFilters.vue'
import OperationsMap from 'src/components/operations/OperationsMap.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { commandQueues, ccoStats } from 'src/data/ccoDemoData'
import { operationalPosts as posts } from 'src/data/operationsDemoData'

const stats = [
  { ...ccoStats[0], to: '/cco/coverage' },
  { ...ccoStats[1], to: '/cco/presences' },
  { ...ccoStats[2], to: '/cco/delays' },
  { ...ccoStats[3], to: '/cco/incidents' },
]

const commandLinks = [
  { title: 'Postos cobertos/descobertos', copy: 'Comparar previsto, presente e supervisor responsável.', to: '/cco/coverage', icon: 'ki-shield-tick', tone: 'is-blue' },
  { title: 'Check-ins fora do raio', copy: 'Validar GPS, distância, foto e justificativo.', to: '/cco/out-of-radius', icon: 'ki-geolocation', tone: 'is-amber' },
  { title: 'Atrasos', copy: 'Priorizar impacto por cliente, posto e início de turno.', to: '/cco/delays', icon: 'ki-time', tone: 'is-red' },
  { title: 'Painel de presenças', copy: 'Acompanhar entradas, ausências e sincronização offline.', to: '/cco/presences', icon: 'ki-check-circle', tone: 'is-green' },
]
</script>
