<!--
  /posts — Postos de segurança (Fase 1.2).
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Postos"
    description="Locais onde prestamos serviço a um cliente. Cada posto tem um tipo de serviço, capacidade máxima de vigilantes e custos associados."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-geolocation" :size="14" />
        {{ count }} posto{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Novo posto" :to="{ name: 'posts-new' }"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined dense clearable debounce="350"
          placeholder="Procurar por nome, localização, cliente…"
          class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.service_type" :options="serviceTypeOptions"
          outlined dense emit-value map-options clearable
          label="Tipo de serviço" style="min-width: 190px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.status" :options="statusOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 160px"
          @update:model-value="onFiltersChanged"
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
        no-data-label="Sem postos registados."
        @request="onTableRequest"
        @row-click="onRowClick"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.client_name }}</div>
          </q-td>
        </template>

        <template #body-cell-capacity="props">
          <q-td :props="props">
            <AppBadge :variant="capacityVariant(props.row)" size="sm">
              {{ props.row.current_guards }} /
              {{ props.row.max_guards ?? '∞' }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-is_armed="props">
          <q-td :props="props">
            <AppBadge v-if="props.row.is_armed" variant="danger" size="sm">Armado</AppBadge>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Ainda não há postos"
            description="Registe o primeiro posto de um cliente."
            icon="ki-geolocation"
            cta-label="Novo posto"
            :cta-to="{ name: 'posts-new' }"
          />
        </template>
      </q-table>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { postService } from 'src/services/post.service'
import { serviceTypeOptions } from 'src/config/posts'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const router = useRouter()

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const filters = reactive({ search: '', service_type: '', status: '' })
const pagination = ref({
  sortBy: 'name', descending: false, page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'name', label: 'Posto', field: 'name', align: 'left', sortable: true },
  { name: 'service_type_display', label: 'Serviço', field: 'service_type_display', align: 'left' },
  { name: 'capacity', label: 'Vigilantes', field: 'current_guards', align: 'center' },
  { name: 'is_armed', label: 'Armado', field: 'is_armed', align: 'center' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
]

const statusOptions = [
  { label: 'Em configuração', value: 'pending' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]

function statusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}
function capacityVariant(row) {
  if (row.max_guards == null) return 'neutral'
  if (!row.has_capacity) return 'danger'
  if (row.current_guards >= row.max_guards - 1) return 'warning'
  return 'success'
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
    if (filters.service_type) params.service_type = filters.service_type
    if (filters.status) params.status = filters.status
    const data = await postService.list(params)
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
  router.push({ name: 'posts-detail', params: { id: row.id } })
}

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
