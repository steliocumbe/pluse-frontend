<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Escalas por posto"
    description="Grade operacional para validar cobertura por posto, lotação por turno e riscos que impedem a publicação da escala."
  >
    <template #actions>
      <router-link to="/schedules" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-calendar" :size="16" icon-class="me-1.5" />
        Calendário
      </router-link>
      <router-link to="/schedules/by-employee" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-people" :size="16" icon-class="me-1.5" />
        Por colaborador
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-geolocation" :size="14" />
        184 postos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-shield-tick" :size="14" />
        181 cobertos
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-flow">
        <div class="pluse-demo-section-head">
          <div>
            <span>Planeamento do dia</span>
            <strong>Grade de turnos por posto</strong>
          </div>
          <AppBadge variant="primary">Por posto</AppBadge>
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
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { scheduleRows, shifts } from 'src/data/operationsDemoData'
</script>
