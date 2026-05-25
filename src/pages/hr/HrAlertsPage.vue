<!--
  /hr-alerts — Alertas de RH (Fase 3.6).
  Consolida todos os red-flags do RH: contratos a terminar, fim de
  probatório, documentos e certificações a expirar, pedidos de férias por
  aprovar e baixas a terminar.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Alertas de RH"
    description="Tudo o que precisa de atenção próxima — contratos, documentos, certificações, férias e baixas — num só sítio."
  >
    <template #meta>
      <span class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ data?.summary?.total ?? 0 }} alertas
      </span>
      <span v-if="data?.summary?.critical" class="admin-meta-chip">
        <AppIcon name="ki-shield" :size="13" />
        {{ data.summary.critical }} crítico(s)
      </span>
    </template>

    <template #actions>
      <q-select
        v-model="windowDays" :options="windowOptions"
        outlined dense emit-value map-options
        label="Janela" class="admin-hero-select"
        style="min-width: 140px"
        @update:model-value="fetch"
      />
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="refresh" label="Actualizar" :loading="loading" @click="fetch"
      />
    </template>

    <!-- Resumo por categoria -->
    <div v-if="data" class="summary-grid">
      <button
        v-for="cat in categories" :key="cat.key"
        type="button"
        class="summary-card"
        :class="{ 'summary-card--active': filters.category === cat.key }"
        @click="toggleCategory(cat.key)"
      >
        <span class="summary-card__icon" :class="`summary-card__icon--${cat.tone}`">
          <AppIcon :name="cat.icon" :size="18" />
        </span>
        <span class="summary-card__label">{{ cat.label }}</span>
        <strong class="summary-card__value">{{ data.summary[cat.key] || 0 }}</strong>
      </button>
    </div>

    <div v-if="loading && !data" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="filteredItems.length === 0"
      title="Sem alertas"
      description="Não há nada urgente nos próximos dias. 🎉"
      icon="ki-check-circle"
    />

    <div v-else class="flex flex-col gap-2 mt-3">
      <component
        :is="item.link_type ? 'router-link' : 'div'"
        v-for="(item, i) in filteredItems" :key="i"
        :to="linkTo(item)"
        class="alert-row" :class="`alert-row--${item.severity}`"
      >
        <span class="alert-row__dot" :class="`alert-row__dot--${item.severity}`" />
        <div class="grow min-w-0">
          <div class="alert-row__title">{{ item.title }}</div>
          <div class="alert-row__meta">
            <span class="font-medium text-mono">{{ item.employee_name }}</span>
            <span v-if="item.reference"> · {{ item.reference }}</span>
            <span> · {{ formatDate(item.date) }}</span>
          </div>
        </div>
        <span class="alert-row__when" :class="`alert-row__when--${item.severity}`">
          {{ whenLabel(item.days) }}
        </span>
      </component>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { hrAlertsService } from 'src/services/employment.service'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const data = ref(null)
const loading = ref(false)
const windowDays = ref(30)
const windowOptions = [
  { value: 7, label: '7 dias' },
  { value: 15, label: '15 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
]

const filters = reactive({ category: '' })

const categories = [
  { key: 'contracts', label: 'Contratos', tone: 'primary', icon: 'ki-document' },
  { key: 'probations', label: 'Probatório', tone: 'info', icon: 'ki-calendar-tick' },
  { key: 'documents', label: 'Documentos', tone: 'warning', icon: 'ki-document' },
  { key: 'certifications', label: 'Certificações', tone: 'warning', icon: 'ki-shield-tick' },
  { key: 'leave_pending', label: 'Férias por aprovar', tone: 'danger', icon: 'ki-calendar' },
  { key: 'sick_leave_ending', label: 'Baixas a terminar', tone: 'danger', icon: 'ki-information-2' },
]

function toggleCategory(key) {
  filters.category = filters.category === key ? '' : key
}

const filteredItems = computed(() => {
  const items = data.value?.items || []
  if (!filters.category) return items
  return items.filter((i) => i.category === filters.category)
})

function formatDate(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function whenLabel(days) {
  if (days < 0) return `há ${Math.abs(days)} dia(s)`
  if (days === 0) return 'hoje'
  return `em ${days} dia(s)`
}
function linkTo(item) {
  if (item.link_type === 'contract') {
    return { name: 'employment-contracts-detail', params: { id: item.link_id } }
  }
  if (item.link_type === 'leave') {
    return '/employees/approvals'
  }
  if (item.link_type === 'employee') {
    return `/employees/${item.link_id}`
  }
  return null
}

async function fetch() {
  loading.value = true
  try {
    data.value = await hrAlertsService.list(windowDays.value)
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  text-align: left;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease, transform 140ms ease;
}
.summary-card:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
  transform: translateY(-1px);
}
.summary-card--active {
  border-color: var(--primary);
  background: color-mix(in oklab, var(--primary) 8%, var(--card));
}
.summary-card__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
}
.summary-card__icon--primary { background: color-mix(in oklab, var(--primary) 12%, transparent); color: var(--primary); }
.summary-card__icon--info { background: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent); color: var(--pluse-cyan-500, #06b6d4); }
.summary-card__icon--warning { background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent); color: var(--pluse-amber-600, #d97706); }
.summary-card__icon--danger { background: color-mix(in oklab, var(--destructive) 14%, transparent); color: var(--destructive); }
.summary-card__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted-foreground);
  flex: 1;
  min-width: 0;
}
.summary-card__value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--mono);
}

.alert-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  text-decoration: none;
  color: inherit;
  transition: border-color 140ms ease, background 140ms ease;
}
.alert-row:hover {
  border-color: color-mix(in oklab, var(--primary) 26%, var(--border));
  background: color-mix(in oklab, var(--muted) 30%, transparent);
}
.alert-row--critical { border-left: 3px solid var(--destructive); }
.alert-row--warning { border-left: 3px solid var(--pluse-amber-500, #f59e0b); }
.alert-row__dot {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
}
.alert-row__dot--critical { background: var(--destructive); }
.alert-row__dot--warning { background: var(--pluse-amber-500, #f59e0b); }
.alert-row__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.alert-row__meta {
  font-size: 0.76rem;
  color: var(--muted-foreground);
}
.alert-row__when {
  font-size: 0.82rem;
  font-weight: 800;
  white-space: nowrap;
}
.alert-row__when--critical { color: var(--destructive); }
.alert-row__when--warning { color: var(--pluse-amber-600, #d97706); }
</style>
