<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Escalas por colaborador"
    description="Distribuição de turnos por vigilante, disponibilidade, conflitos de carga horária e validação antes da publicação."
  >
    <template #actions>
      <router-link to="/schedules" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-calendar" :size="16" icon-class="me-1.5" />
        Calendário
      </router-link>
      <router-link to="/schedules/by-post" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-geolocation" :size="16" icon-class="me-1.5" />
        Por posto
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-people" :size="14" />
        426 vigilantes elegíveis
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-warning-2" :size="14" />
        1 sobreposição
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

      <section class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Colaboradores</span>
            <strong>Carga e alocação do período</strong>
          </div>
          <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Filtrar</button>
        </div>

        <div class="pluse-demo-table">
          <div class="pluse-demo-table-head posts">
            <span>Colaborador</span>
            <span>Posto principal</span>
            <span>Horas</span>
            <span>Turnos</span>
            <span>Estado</span>
          </div>
          <div v-for="row in employees" :key="row.name" class="pluse-demo-table-row posts">
            <div class="pluse-demo-identity">
              <span>{{ row.initials }}</span>
              <div>
                <strong>{{ row.name }}</strong>
                <p>{{ row.role }}</p>
              </div>
            </div>
            <span>{{ row.post }}</span>
            <span>{{ row.hours }}</span>
            <span>{{ row.shifts }}</span>
            <AppBadge :variant="row.variant">{{ row.status }}</AppBadge>
          </div>
        </div>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const stats = [
  { label: 'Disponíveis', value: '426', copy: 'aptos para alocação esta semana', icon: 'ki-people', tone: 'is-green' },
  { label: 'Alocados', value: '389', copy: 'com pelo menos um turno confirmado', icon: 'ki-user-tick', tone: 'is-blue' },
  { label: 'Folgas', value: '31', copy: 'respeitadas no planeamento', icon: 'ki-calendar', tone: 'is-amber' },
  { label: 'Conflitos', value: '1', copy: 'sobreposição de horário por resolver', icon: 'ki-warning-2', tone: 'is-red' },
]

const employees = [
  { initials: 'JM', name: 'João Mucavele', role: 'Vigilante sénior', post: 'MozMall Entrada Norte', hours: '48h', shifts: '4 turnos', status: 'Pronto', variant: 'success' },
  { initials: 'LC', name: 'Lúcia Cossa', role: 'Vigilante', post: 'Banco Central Cofre', hours: '44h', shifts: '4 turnos', status: 'Pronto', variant: 'primary' },
  { initials: 'RC', name: 'Rui Cossa', role: 'Vigilante', post: 'Porto Gate 4', hours: '56h', shifts: '5 turnos', status: 'Conflito', variant: 'warning' },
  { initials: 'AM', name: 'Ana Macamo', role: 'Vigilante', post: 'Hospital Ala Sul', hours: '36h', shifts: '3 turnos', status: 'Disponível', variant: 'success' },
]
</script>
