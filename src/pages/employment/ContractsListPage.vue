<!--
  /employment-contracts — Contratos de trabalho (RH-2).
  Lista com vistas (Todos / Activos / A expirar / Expirados / Pendentes),
  pesquisa e filtro por tipo. Segue o AdminPageTemplate como as restantes
  páginas de administração.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Contratos de trabalho"
    description="Contratos formais dos colaboradores — probatórios, a prazo, por tempo indeterminado. Analise por estado e antecipe renovações."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-document" :size="14" />
        {{ store.count }} {{ view === 'all' ? 'no total' : viewLabel.toLowerCase() }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Novo contrato"
        :to="{ name: 'employment-contracts-new' }"
      />
    </template>

    <template #tabs>
      <q-card flat bordered class="pluse-card">
        <q-tabs
          v-model="view"
          dense align="left"
          active-color="primary" indicator-color="primary"
          narrow-indicator inline-label
          @update:model-value="onViewChanged"
        >
          <q-tab
            v-for="v in views"
            :key="v.name"
            :name="v.name"
            :icon="v.icon"
            :label="v.label"
            no-caps
          />
        </q-tabs>
      </q-card>
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined dense clearable debounce="350"
          placeholder="Procurar por referência, cargo, colaborador…"
          class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.contract_type"
          :options="contractTypeOptions"
          outlined dense emit-value map-options clearable
          label="Tipo" style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-card-section class="pt-0">
        <ActiveFiltersBar
          :filters="filters"
          :config="filterConfig"
          @clear="onClearFilter"
          @clear-all="onClearAllFilters"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="store.items"
        :columns="columns"
        :loading="store.loading"
        row-key="id"
        flat bordered binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table"
        no-data-label="Sem contratos nesta vista."
        @request="onTableRequest"
        @row-click="onRowClick"
      >
        <template #body-cell-reference="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.reference }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.job_title }}</div>
          </q-td>
        </template>

        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-medium">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-end_date="props">
          <q-td :props="props">
            <span v-if="props.row.end_date">{{ formatDate(props.row.end_date) }}</span>
            <span v-else class="text-muted-foreground">Sem termo</span>
            <AppBadge
              v-if="endTone(props.row)"
              size="sm"
              :variant="endTone(props.row).variant"
              class="ms-1"
            >
              {{ endTone(props.row).label }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn flat round dense icon="more_vert" size="sm">
              <q-menu>
                <q-list dense style="min-width: 170px">
                  <q-item clickable v-close-popup :to="contractTo(props.row.id)">
                    <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                    <q-item-section>Ver detalhe</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup :to="contractEditTo(props.row.id)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem contratos nesta vista"
            description="Não há contratos que correspondam aos filtros seleccionados."
            icon="ki-document"
          />
        </template>
      </q-table>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContractsStore } from 'src/stores/contracts'
import { contractTypeOptions } from 'src/config/employment'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'

const router = useRouter()
const store = useContractsStore()

const view = ref('all')
const views = [
  { name: 'all', label: 'Todos', icon: 'list' },
  { name: 'active', label: 'Activos', icon: 'check_circle' },
  { name: 'expiring', label: 'A expirar (30d)', icon: 'schedule' },
  { name: 'expired', label: 'Expirados', icon: 'error' },
  { name: 'pending', label: 'Pendentes', icon: 'pending' },
]
const viewLabel = computed(() => views.find((v) => v.name === view.value)?.label || '')

// Config para a barra de filtros activos
const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'contract_type', label: 'Tipo', emptyValue: '', options: contractTypeOptions },
]

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}

function onClearAllFilters() {
  filters.search = ''
  filters.contract_type = ''
  onFiltersChanged()
}

const filters = reactive({ search: '', contract_type: '' })
const pagination = ref({
  sortBy: 'start_date',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'reference', label: 'Contrato', field: 'reference', align: 'left', sortable: true },
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'contract_type_display', label: 'Tipo', field: 'contract_type_display', align: 'left' },
  { name: 'start_date', label: 'Início', field: 'start_date', align: 'left', sortable: true },
  { name: 'end_date', label: 'Fim', field: 'end_date', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function statusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}
function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/* Highlight contracts ending soon / already expired. */
function endTone(row) {
  if (row.status !== 'active' || row.days_to_end === null || row.days_to_end === undefined) {
    return null
  }
  const d = row.days_to_end
  if (d < 0) return { variant: 'danger', label: 'Expirado' }
  if (d <= 30) return { variant: 'warning', label: `${d}d` }
  return null
}

function contractTo(id) {
  return { name: 'employment-contracts-detail', params: { id } }
}
function contractEditTo(id) {
  return { name: 'employment-contracts-edit', params: { id } }
}

/* Server-side filter params for the current view. */
function viewParams() {
  switch (view.value) {
    case 'active':
      return { status: 'active' }
    case 'expiring':
      return { status: 'active', end_date__gte: isoDate(0), end_date__lte: isoDate(30) }
    case 'expired':
      return { status: 'active', end_date__lt: isoDate(0) }
    case 'pending':
      return { status: 'pending' }
    default:
      return {}
  }
}

async function fetchPage() {
  const { page, rowsPerPage, sortBy, descending } = pagination.value
  const params = {
    page,
    page_size: rowsPerPage,
    ordering: `${descending ? '-' : ''}${sortBy}`,
    ...viewParams(),
  }
  if (filters.search) params.search = filters.search
  if (filters.contract_type) params.contract_type = filters.contract_type
  await store.fetchList(params)
  pagination.value.rowsNumber = store.count
}

function onTableRequest(props) {
  pagination.value = { ...pagination.value, ...props.pagination }
  fetchPage()
}
function onFiltersChanged() {
  pagination.value.page = 1
  fetchPage()
}
function onViewChanged() {
  pagination.value.page = 1
  fetchPage()
}
function onRowClick(_evt, row) {
  router.push(contractTo(row.id))
}

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
