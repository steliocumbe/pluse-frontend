<!--
  /clients — Clientes (Fase 1).
  Lista com filtros por etapa de onboarding e tipo de cliente.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Clientes"
    description="Entidades a quem prestamos serviços de segurança. Cada cliente passa por um processo de admissão com análise de risco antes de ficar operacional."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-profile-user" :size="14" />
        {{ count }} cliente{{ count === 1 ? '' : 's' }}
      </span>
      <span v-if="reviewCount > 0" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ reviewCount }} análise(s) por aprovar
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="auto_awesome" label="Novo cliente (assistente)"
        :to="{ name: 'clients-wizard' }"
      />
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="add" label="Novo (avançado)"
        :to="{ name: 'clients-new' }"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined dense clearable debounce="350"
          placeholder="Procurar por nome, NUIT, contacto…"
          class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.stage" :options="clientStageOptions"
          outlined dense emit-value map-options clearable
          label="Etapa" style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.client_type" :options="clientTypeOptions"
          outlined dense emit-value map-options clearable
          label="Tipo" style="min-width: 170px"
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
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat bordered binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table"
        no-data-label="Sem clientes registados."
        @request="onTableRequest"
        @row-click="onRowClick"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.name }}</div>
            <div v-if="props.row.short_name" class="text-xs text-muted-foreground">
              {{ props.row.short_name }}
            </div>
          </q-td>
        </template>

        <template #body-cell-stage="props">
          <q-td :props="props">
            <AppBadge :variant="stageVariant(props.row.stage)">
              {{ props.row.stage_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-risk_level="props">
          <q-td :props="props">
            <AppBadge v-if="props.row.risk_level" :variant="riskVariant(props.row.risk_level)" size="sm">
              {{ riskLevelLabel(props.row.risk_level) }}
            </AppBadge>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Ainda não há clientes"
            description="Registe o primeiro cliente para iniciar o onboarding."
            icon="ki-profile-user"
            cta-label="Novo cliente (assistente)"
            :cta-to="{ name: 'clients-wizard' }"
          />
        </template>
      </q-table>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { clientService } from 'src/services/client.service'
import {
  clientTypeOptions, clientStageOptions, riskLevelLabel,
} from 'src/config/clients'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'

const router = useRouter()

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const filters = reactive({ search: '', stage: '', client_type: '' })
const pagination = ref({
  sortBy: 'name', descending: false, page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'name', label: 'Cliente', field: 'name', align: 'left', sortable: true },
  { name: 'client_type_display', label: 'Tipo', field: 'client_type_display', align: 'left' },
  { name: 'stage', label: 'Etapa', field: 'stage', align: 'left' },
  { name: 'risk_level', label: 'Risco', field: 'risk_level', align: 'center' },
]

const reviewCount = computed(() => rows.value.filter((c) => c.stage === 'risk_review').length)

// Config para a barra de filtros activos
const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'stage', label: 'Etapa', emptyValue: '', options: clientStageOptions },
  { key: 'client_type', label: 'Tipo', emptyValue: '', options: clientTypeOptions },
]

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}

function onClearAllFilters() {
  filters.search = ''
  filters.stage = ''
  filters.client_type = ''
  onFiltersChanged()
}

function stageVariant(stage) {
  return { prospecting: 'neutral', risk_review: 'warning', approved: 'success' }[stage] || 'neutral'
}
function riskVariant(level) {
  return { low: 'success', medium: 'warning', high: 'danger' }[level] || 'neutral'
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page, page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy}`,
    }
    if (filters.search) params.search = filters.search
    if (filters.stage) params.stage = filters.stage
    if (filters.client_type) params.client_type = filters.client_type
    const data = await clientService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}

function onTableRequest(props) {
  pagination.value = { ...pagination.value, ...props.pagination }
  fetchPage()
}
function onFiltersChanged() {
  pagination.value.page = 1
  fetchPage()
}
function onRowClick(_evt, row) {
  router.push({ name: 'clients-detail', params: { id: row.id } })
}

onMounted(fetchPage)
</script>

<style scoped>
</style>
