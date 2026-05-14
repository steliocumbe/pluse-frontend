<template>
  <AdminPageTemplate :eyebrow="eyebrow" :title="title" :description="description">
    <template #actions>
      <router-link to="/cco" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-chart-line" :size="16" icon-class="me-1.5" />
        Centro de comando
      </router-link>
      <button type="button" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-filter" :size="16" icon-class="me-1.5" />
        Aplicar filtros
      </button>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon :name="metaIcon" :size="14" />
        {{ metaPrimary }}
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-time" :size="14" />
        atualizado agora
      </span>
    </template>

    <div class="pluse-demo-page">
      <CcoFilters />

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

      <section class="pluse-demo-grid cco-detail-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>{{ tableEyebrow }}</span>
              <strong>{{ tableTitle }}</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Exportar</button>
          </div>

          <div class="pluse-demo-table">
            <div class="pluse-demo-table-head cco">
              <span v-for="column in columns" :key="column.key">{{ column.label }}</span>
            </div>
            <div v-for="row in rows" :key="row[rowKey]" class="pluse-demo-table-row cco">
              <span v-for="column in columns" :key="`${row[rowKey]}-${column.key}`">
                <AppBadge v-if="column.badge" :variant="row.variant">{{ row[column.key] }}</AppBadge>
                <template v-else>{{ row[column.key] }}</template>
              </span>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Decisão operacional</span>
              <strong>{{ sideTitle }}</strong>
            </div>
            <AppBadge :variant="sideVariant">{{ sideBadge }}</AppBadge>
          </div>

          <div class="pluse-demo-alert-stack">
            <div v-for="item in actions" :key="item.title" class="pluse-demo-alert" :class="item.tone">
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
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import CcoFilters from 'src/components/operations/CcoFilters.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

defineProps({
  eyebrow: { type: String, default: 'Centro de Controlo Operacional' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  metaIcon: { type: String, default: 'ki-chart-line' },
  metaPrimary: { type: String, required: true },
  stats: { type: Array, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, required: true },
  tableEyebrow: { type: String, required: true },
  tableTitle: { type: String, required: true },
  sideTitle: { type: String, required: true },
  sideBadge: { type: String, required: true },
  sideVariant: { type: String, default: 'primary' },
  actions: { type: Array, required: true },
})
</script>
