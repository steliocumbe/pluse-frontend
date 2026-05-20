<!--
  RH red-flags panel — surfaces the /alerts/ endpoint: contracts ending,
  probation periods ending and employee documents expiring. Designed to drop
  into the dashboard; self-contained (fetches on mount).
-->
<template>
  <section class="alerts-panel">
    <header class="alerts-panel__head">
      <div class="flex items-center gap-2">
        <span class="alerts-panel__icon"><AppIcon name="ki-warning-2" :size="16" /></span>
        <div>
          <strong class="alerts-panel__title">Alertas de RH</strong>
          <span class="alerts-panel__sub">Próximos {{ windowDays }} dias</span>
        </div>
      </div>
      <div class="alerts-panel__counts">
        <span class="alert-chip alert-chip--critical" v-if="summary.critical">
          {{ summary.critical }} crítico{{ summary.critical === 1 ? '' : 's' }}
        </span>
        <span class="alert-chip">{{ summary.total }} no total</span>
      </div>
    </header>

    <div v-if="loading" class="alerts-panel__state">
      <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
    </div>

    <div v-else-if="!items.length" class="alerts-panel__state alerts-panel__state--ok">
      <AppIcon name="ki-check-circle" :size="20" />
      <span>Sem alertas — contratos e documentos em dia.</span>
    </div>

    <ul v-else class="alerts-list">
      <li v-for="(item, i) in visibleItems" :key="i">
        <router-link :to="linkTo(item)" class="alert-row">
          <span class="alert-dot" :class="`alert-dot--${item.severity}`" />
          <div class="grow min-w-0">
            <div class="alert-row__title">{{ item.title }}</div>
            <div class="alert-row__meta">
              {{ item.employee_name }} · {{ item.reference }}
            </div>
          </div>
          <span class="alert-row__when" :class="`alert-row__when--${item.severity}`">
            {{ whenLabel(item.days) }}
          </span>
        </router-link>
      </li>
    </ul>

    <button
      v-if="items.length > limit"
      type="button" class="alerts-panel__more"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Ver menos' : `Ver mais ${items.length - limit}` }}
    </button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { hrAlertsService } from 'src/services/employment.service'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  days: { type: Number, default: 30 },
  limit: { type: Number, default: 5 },
})

const loading = ref(false)
const items = ref([])
const summary = ref({ total: 0, critical: 0 })
const windowDays = ref(props.days)
const expanded = ref(false)

const visibleItems = computed(() =>
  expanded.value ? items.value : items.value.slice(0, props.limit),
)

function whenLabel(days) {
  if (days < 0) return `há ${Math.abs(days)}d`
  if (days === 0) return 'hoje'
  return `em ${days}d`
}

function linkTo(item) {
  if (item.link_type === 'contract') {
    return { name: 'employment-contracts-detail', params: { id: item.link_id } }
  }
  return `/employees/${item.link_id}`
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await hrAlertsService.list(props.days)
    items.value = data.items || []
    summary.value = data.summary || { total: 0, critical: 0 }
    windowDays.value = data.window_days || props.days
  } catch {
    /* interceptor toasts */
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.alerts-panel {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  padding: 18px;
}
.alerts-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.alerts-panel__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.alerts-panel__title {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--mono);
}
.alerts-panel__sub {
  font-size: 0.74rem;
  color: var(--muted-foreground);
}
.alerts-panel__counts {
  display: flex;
  gap: 6px;
}
.alert-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.alert-chip--critical {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.alerts-panel__state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
  color: var(--muted-foreground);
  font-size: 0.86rem;
}
.alerts-panel__state--ok { color: var(--pluse-emerald-600, #059669); }
.alerts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.alert-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 140ms ease;
}
.alert-row:hover { background: color-mix(in oklab, var(--muted) 50%, transparent); }
.alert-dot {
  width: 9px;
  height: 9px;
  flex: none;
  border-radius: 50%;
}
.alert-dot--critical { background: var(--destructive); }
.alert-dot--warning { background: var(--pluse-amber-500, #f59e0b); }
.alert-row__title {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--foreground);
}
.alert-row__meta {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
.alert-row__when {
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
}
.alert-row__when--critical { color: var(--destructive); }
.alert-row__when--warning { color: var(--pluse-amber-600, #d97706); }
.alerts-panel__more {
  margin-top: 8px;
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.alerts-panel__more:hover { background: color-mix(in oklab, var(--primary) 6%, transparent); }
</style>
