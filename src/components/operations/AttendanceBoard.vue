<template>
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
            <span>{{ tableEyebrow }}</span>
            <strong>{{ tableTitle }}</strong>
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
          <div v-for="row in rows" :key="row.name" class="pluse-demo-table-row posts">
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
            <span>Exceções</span>
            <strong>{{ sideTitle }}</strong>
          </div>
          <AppBadge variant="warning">{{ sideBadge }}</AppBadge>
        </div>

        <div class="pluse-demo-alert-stack">
          <div v-for="item in queue" :key="item.title" class="pluse-demo-alert" :class="item.tone">
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
  </div>
</template>

<script setup>
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

defineProps({
  stats: { type: Array, required: true },
  rows: { type: Array, required: true },
  queue: { type: Array, required: true },
  tableEyebrow: { type: String, default: 'Presenças' },
  tableTitle: { type: String, default: 'Check-ins por estado' },
  sideTitle: { type: String, default: 'Fila de validação' },
  sideBadge: { type: String, default: '14 pendentes' },
})
</script>
