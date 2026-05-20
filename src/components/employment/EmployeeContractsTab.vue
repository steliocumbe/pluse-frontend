<!--
  Contracts tab on the employee detail page — lists this colaborador's work
  contracts. Creation/approval happens on the dedicated contract pages.
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <AppHeading :level="3" class="text-sm font-semibold text-mono">
        Contratos de trabalho
      </AppHeading>
      <q-btn
        unelevated no-caps color="primary" size="sm" icon="add"
        label="Novo contrato"
        :to="{ name: 'employment-contracts-new', query: { employee: employeeId } }"
      />
    </div>

    <div v-if="loading" class="loading-row">
      <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!items.length"
      title="Sem contratos"
      description="Este colaborador ainda não tem contratos de trabalho registados."
      icon="ki-document"
    />

    <div v-else class="flex flex-col gap-2">
      <router-link
        v-for="c in items"
        :key="c.id"
        :to="{ name: 'employment-contracts-detail', params: { id: c.id } }"
        class="contract-row"
      >
        <span class="contract-row__icon"><AppIcon name="ki-document" :size="18" /></span>
        <div class="grow min-w-0">
          <div class="text-sm font-semibold text-mono">
            {{ c.reference }} — {{ c.job_title }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ c.contract_type_display }} ·
            {{ formatDate(c.start_date) }}
            {{ c.end_date ? '→ ' + formatDate(c.end_date) : '(sem termo)' }}
          </div>
        </div>
        <AppBadge :variant="statusVariant(c.status)">{{ c.status_display }}</AppBadge>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { contractService } from 'src/services/employment.service'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  employeeId: { type: [Number, String], required: true },
})

const items = ref([])
const loading = ref(false)

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function statusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await contractService.list({
      employee: props.employeeId,
      page_size: 100,
    })
    items.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--muted-foreground);
}
.contract-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  text-decoration: none;
  transition: border-color 160ms ease;
}
.contract-row:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
}
.contract-row__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
</style>
