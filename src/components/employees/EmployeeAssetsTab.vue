<!--
  Histórico de ativos do colaborador — viaturas e equipamentos atribuídos
  (abertos e fechados). Read-only: consome `/employees/:id/asset-history/`.
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <AppHeading :level="3" class="text-sm font-semibold text-mono">
        Histórico de ativos
      </AppHeading>
      <span v-if="!loading && total" class="text-xs text-muted-foreground">
        {{ total }} atribuiç{{ total === 1 ? 'ão' : 'ões' }}
        <template v-if="openCount">
          · <span class="open-emph">{{ openCount }} em curso</span>
        </template>
      </span>
    </div>

    <div v-if="loading" class="loading-row">
      <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!items.length"
      title="Sem atribuições"
      description="Este colaborador ainda não recebeu viaturas ou equipamentos."
      icon="ki-setting-2"
    />

    <div v-else class="flex flex-col gap-2">
      <div v-for="it in items" :key="it.id" class="asset-row">
        <span
          class="asset-row__icon"
          :class="`asset-row__icon--${it.asset_type}`"
        >
          <q-icon
            :name="it.asset_type === 'vehicle' ? 'directions_car' : 'inventory_2'"
            size="20px"
          />
        </span>
        <div class="grow min-w-0">
          <div class="text-sm font-semibold text-mono">
            {{ it.asset_label || '—' }}
          </div>
          <div class="text-xs text-muted-foreground">
            <template v-if="it.is_open">
              em curso desde {{ formatDate(it.assigned_at) }}
            </template>
            <template v-else>
              atribuído em {{ formatDate(it.assigned_at) }}
              → {{ formatDate(it.returned_at) }}
            </template>
            <template v-if="it.duration_days != null">
              · {{ it.duration_days }} dia{{ it.duration_days === 1 ? '' : 's' }}
            </template>
          </div>
          <p v-if="it.notes" class="text-sm mt-1 whitespace-pre-line">
            {{ it.notes }}
          </p>
        </div>
        <AppBadge v-if="it.is_open" variant="info">Em curso</AppBadge>
        <AppBadge v-else variant="neutral">Devolvido</AppBadge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/services/api'
import { useToast } from 'src/composables/useToast'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  employeeId: { type: [Number, String], required: true },
})

const toast = useToast()
const items = ref([])
const total = ref(0)
const openCount = ref(0)
const loading = ref(false)

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function fetchHistory() {
  loading.value = true
  try {
    const res = await api.get(`/employees/${props.employeeId}/asset-history/`)
    items.value = res.data?.items ?? []
    total.value = res.data?.total ?? items.value.length
    openCount.value = res.data?.open_count ?? 0
  } catch (err) {
    toast.error('Não foi possível carregar o histórico de ativos.', {
      caption: err?.response?.data?.detail,
    })
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistory)
</script>

<style scoped>
.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--muted-foreground);
}
.open-emph {
  font-weight: 700;
  color: var(--primary);
}
.asset-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.asset-row__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
}
.asset-row__icon--vehicle {
  background: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 16%, transparent);
  color: var(--pluse-cyan-600, #0891b2);
}
.asset-row__icon--equipment {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
</style>
