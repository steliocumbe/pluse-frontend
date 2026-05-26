<!--
  /client-contracts — Contratos comerciais (PLUSE × Cliente).
  Lista com filtros por cliente, estado e modalidade. Stats no topo.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Contratos de clientes"
    description="Contratos comerciais de prestação de serviços de segurança."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-document" :size="14" />
        {{ count }} contrato{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Novo contrato"
        :to="{ name: 'client-contracts-new' }"
      />
    </template>

    <!-- Stats no topo -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__label">Total</span>
        <span class="stat-card__value">{{ stats.total }}</span>
      </div>
      <div class="stat-card stat-card--success">
        <span class="stat-card__label">Activos</span>
        <span class="stat-card__value">{{ stats.active }}</span>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-card__label">A expirar (60d)</span>
        <span class="stat-card__value">{{ stats.expiring }}</span>
      </div>
      <div class="stat-card stat-card--danger">
        <span class="stat-card__label">Expirados</span>
        <span class="stat-card__value">{{ stats.expired }}</span>
      </div>
    </div>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined dense clearable debounce="350"
          placeholder="Procurar por referência, título…"
          class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.client"
          :options="clientOptions"
          outlined dense emit-value map-options clearable use-input
          input-debounce="300"
          label="Cliente" style="min-width: 220px"
          :loading="loadingClients"
          @filter="filterClients"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.contract_status"
          :options="contractStatusOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 170px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.modality"
          :options="modalityOptions"
          outlined dense emit-value map-options clearable
          label="Modalidade" style="min-width: 200px"
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
        no-data-label="Sem contratos."
        @request="onTableRequest"
        @row-click="onRowClick"
      >
        <template #body-cell-reference="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.reference }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.title }}</div>
          </q-td>
        </template>

        <template #body-cell-client_name="props">
          <q-td :props="props">
            <div class="text-sm">{{ props.row.client_name }}</div>
          </q-td>
        </template>

        <template #body-cell-modality="props">
          <q-td :props="props">
            <span class="text-sm">{{ props.row.modality_display }}</span>
          </q-td>
        </template>

        <template #body-cell-period="props">
          <q-td :props="props">
            <div class="text-sm">{{ formatDate(props.row.start_date) }}</div>
            <div class="text-xs text-muted-foreground">
              {{ props.row.end_date ? '→ ' + formatDate(props.row.end_date) : 'Sem termo' }}
            </div>
          </q-td>
        </template>

        <template #body-cell-monthly_value="props">
          <q-td :props="props">
            <span class="text-sm font-medium text-mono">
              {{ formatAmount(props.row.monthly_value, props.row.currency) }}
            </span>
          </q-td>
        </template>

        <template #body-cell-contract_status="props">
          <q-td :props="props">
            <AppBadge :variant="contractStatusVariant(props.row.contract_status)">
              {{ props.row.contract_status_display }}
            </AppBadge>
            <AppBadge
              v-if="props.row.is_expiring_soon && props.row.contract_status === 'active'"
              size="sm" variant="warning" class="ms-1"
            >
              Expira {{ props.row.days_to_expiry }}d
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn flat round dense icon="more_vert" size="sm">
              <q-menu>
                <q-list dense style="min-width: 180px">
                  <q-item clickable v-close-popup :to="contractTo(props.row.id)">
                    <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                    <q-item-section>Ver detalhe</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup :to="contractEditTo(props.row.id)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    v-if="props.row.contract_status === 'draft'"
                    clickable v-close-popup @click="activate(props.row)"
                  >
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Activar</q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.row.contract_status === 'active'"
                    clickable v-close-popup @click="terminate(props.row)"
                  >
                    <q-item-section avatar><q-icon name="block" color="negative" /></q-item-section>
                    <q-item-section>Terminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Nenhum contrato"
            description="Crie o primeiro contrato comercial com um cliente."
            icon="ki-document"
            cta-label="Novo contrato"
            :cta-to="{ name: 'client-contracts-new' }"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo: activar -->
    <AppModal v-model="showActivate" size="sm" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-2">
          Activar contrato
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Marca o contrato como assinado e activo. Indique a data de assinatura.
        </p>
        <q-form ref="activateFormRef" greedy class="flex flex-col gap-3" @submit="submitActivate">
          <q-input
            v-model="activateForm.signed_date" label="Data de assinatura"
            type="date" outlined dense stack-label
          />
          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Cancelar" @click="showActivate = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Activar" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <!-- Diálogo: terminar -->
    <AppModal v-model="showTerminate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-2">
          Terminar contrato
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Marca o contrato como terminado. Indique a data e (opcional) o motivo.
        </p>
        <q-form ref="terminateFormRef" greedy class="flex flex-col gap-3" @submit="submitTerminate">
          <q-input
            v-model="terminateForm.terminated_date" label="Data de cessação *"
            type="date" outlined dense stack-label :rules="[req]"
          />
          <q-input
            v-model="terminateForm.termination_reason" label="Motivo (opcional)"
            type="textarea" outlined dense autogrow
          />
          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Cancelar" @click="showTerminate = false" />
            <q-btn unelevated no-caps color="negative" type="submit" label="Terminar" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { clientContractService } from 'src/services/client-contract.service'
import { clientService } from 'src/services/client.service'
import {
  contractStatusOptions, modalityOptions, contractStatusVariant,
} from 'src/config/client-contracts'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'

const router = useRouter()
const toast = useToast()

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const submitting = ref(false)

const stats = reactive({ total: 0, active: 0, expiring: 0, expired: 0 })

const filters = reactive({ search: '', client: null, contract_status: '', modality: '' })
const pagination = ref({
  sortBy: 'start_date', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'reference', label: 'Referência', field: 'reference', align: 'left', sortable: true },
  { name: 'client_name', label: 'Cliente', field: 'client_name', align: 'left' },
  { name: 'modality', label: 'Modalidade', field: 'modality_display', align: 'left' },
  { name: 'period', label: 'Período', field: 'start_date', align: 'left', sortable: true },
  { name: 'monthly_value', label: 'Valor mensal', field: 'monthly_value', align: 'right' },
  { name: 'contract_status', label: 'Estado', field: 'contract_status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

// ── Clientes para o filtro ───────────────────────────────────────────────
const allClients = ref([])
const clientOptions = ref([])
const loadingClients = ref(false)

function mapClient(c) {
  return { label: c.name, value: c.id }
}
function filterClients(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    clientOptions.value = n
      ? allClients.value.filter((o) => o.label.toLowerCase().includes(n))
      : allClients.value
  })
}

// ── Filtros activos ──────────────────────────────────────────────────────
const filterConfig = computed(() => [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'client', label: 'Cliente', emptyValue: null, options: allClients.value },
  { key: 'contract_status', label: 'Estado', emptyValue: '', options: contractStatusOptions },
  { key: 'modality', label: 'Modalidade', emptyValue: '', options: modalityOptions },
])

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}
function onClearAllFilters() {
  filters.search = ''
  filters.client = null
  filters.contract_status = ''
  filters.modality = ''
  onFiltersChanged()
}

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function formatAmount(v, currency = 'MZN') {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return v
  try {
    return `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  } catch {
    return `${n} ${currency}`
  }
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page, page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy === 'period' ? 'start_date' : sortBy}`,
    }
    if (filters.search) params.search = filters.search
    if (filters.client) params.client = filters.client
    if (filters.contract_status) params.contract_status = filters.contract_status
    if (filters.modality) params.modality = filters.modality
    const data = await clientContractService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  // Para os números do topo, fazemos pequenas chamadas em paralelo.
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  const in60 = new Date(today); in60.setDate(in60.getDate() + 60)
  try {
    const [total, active, expiring, expired] = await Promise.all([
      clientContractService.list({ page_size: 1 }),
      clientContractService.list({ page_size: 1, contract_status: 'active' }),
      clientContractService.list({
        page_size: 1,
        contract_status: 'active',
        end_date__gte: iso(today),
        end_date__lte: iso(in60),
      }),
      clientContractService.list({ page_size: 1, contract_status: 'expired' }),
    ])
    stats.total = total?.count ?? 0
    stats.active = active?.count ?? 0
    stats.expiring = expiring?.count ?? 0
    stats.expired = expired?.count ?? 0
  } catch { /* interceptor toasts */ }
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
  router.push(contractTo(row.id))
}

function contractTo(id) {
  return { name: 'client-contracts-detail', params: { id } }
}
function contractEditTo(id) {
  return { name: 'client-contracts-edit', params: { id } }
}

// ── Acções rápidas ───────────────────────────────────────────────────────
const showActivate = ref(false)
const showTerminate = ref(false)
const activeRow = ref(null)
const activateFormRef = ref(null)
const terminateFormRef = ref(null)
const activateForm = reactive({ signed_date: '' })
const terminateForm = reactive({ terminated_date: '', termination_reason: '' })

function activate(row) {
  activeRow.value = row
  activateForm.signed_date = new Date().toISOString().slice(0, 10)
  showActivate.value = true
}
function terminate(row) {
  activeRow.value = row
  terminateForm.terminated_date = new Date().toISOString().slice(0, 10)
  terminateForm.termination_reason = ''
  showTerminate.value = true
}

async function submitActivate() {
  submitting.value = true
  try {
    await clientContractService.activate(activeRow.value.id, { signed_date: activateForm.signed_date })
    toast.success('Contrato activado.')
    showActivate.value = false
    await Promise.all([fetchPage(), fetchStats()])
  } catch (err) {
    toast.error('Não foi possível activar.', { caption: err?.response?.data?.detail })
  } finally {
    submitting.value = false
  }
}

async function submitTerminate() {
  const ok = await terminateFormRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    await clientContractService.terminate(activeRow.value.id, {
      terminated_date: terminateForm.terminated_date,
      termination_reason: terminateForm.termination_reason,
    })
    toast.success('Contrato terminado.')
    showTerminate.value = false
    await Promise.all([fetchPage(), fetchStats()])
  } catch (err) {
    toast.error('Não foi possível terminar.', { caption: err?.response?.data?.detail })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // Carrega lista de clientes para filtro
  loadingClients.value = true
  try {
    const data = await clientService.list({ page_size: 300 })
    const list = data?.results ?? data ?? []
    allClients.value = list.map(mapClient)
    clientOptions.value = allClients.value
  } catch { /* interceptor toasts */ } finally {
    loadingClients.value = false
  }
  await Promise.all([fetchPage(), fetchStats()])
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.stat-card__label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mono);
}
.stat-card--success {
  border-color: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 30%, var(--border));
}
.stat-card--warning {
  border-color: color-mix(in oklab, #f59e0b 30%, var(--border));
}
.stat-card--danger {
  border-color: color-mix(in oklab, var(--destructive) 30%, var(--border));
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
