<!--
  /leaves & /sick-leaves — Pedidos de ausência (Fase 3.2).
  Página parametrizável pelo tipo: férias ou baixa médica.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    :title="title"
    :description="description"
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-calendar-tick" :size="14" />
        {{ count }} pedido{{ count === 1 ? '' : 's' }}
      </span>
      <span v-if="pendingCount" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ pendingCount }} por aprovar
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" :label="newLabel" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por colaborador…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.status" :options="leaveStatusOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 200px"
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
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        class="pluse-table"
        no-data-label="Sem pedidos registados."
        @request="onTableRequest"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-period="props">
          <q-td :props="props">
            {{ formatDate(props.row.start_date) }} → {{ formatDate(props.row.end_date) }}
            <div class="text-xs text-muted-foreground">{{ props.row.days }} dia(s)</div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="leaveStatusVariant(props.row.status)">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn
              v-if="props.row.status === 'pending' && canApprove"
              flat round dense icon="more_vert" size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 170px">
                  <q-item clickable v-close-popup @click="approve(props.row)">
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Aprovar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="reject(props.row)">
                    <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                    <q-item-section>Rejeitar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            :title="`Sem ${typeLabelLower}`"
            description="Crie o primeiro pedido."
            icon="ki-calendar-tick"
            :cta-label="newLabel" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Novo pedido -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          {{ newLabel }}
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submitCreate">
          <!-- Erros globais do servidor -->
          <div v-if="globalErrors.length" class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p v-for="(e, i) in globalErrors" :key="i" class="m-0">{{ e }}</p>
          </div>

          <q-select
            v-model="form.employee" :options="employeeOptions" label="Colaborador *"
            outlined dense emit-value map-options use-input input-debounce="200"
            @filter="filterEmployees" :rules="[req]"
            :error="!!fieldErrors.employee" :error-message="fieldErrors.employee"
          />
          <q-input v-model="form.leave_type_display" label="Tipo"
                   outlined dense readonly />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.start_date" label="Início *" type="date" outlined dense
                     stack-label :rules="[req]"
                     :error="!!fieldErrors.start_date" :error-message="fieldErrors.start_date" />
            <q-input v-model="form.end_date" label="Fim *" type="date" outlined dense
                     stack-label :rules="[req]"
                     :error="!!fieldErrors.end_date" :error-message="fieldErrors.end_date" />
          </div>
          <q-input v-model="form.reason" label="Motivo / observações" type="textarea"
                   outlined dense autogrow
                   :error="!!fieldErrors.reason" :error-message="fieldErrors.reason" />
          <q-file v-model="form.document" label="Documento (opcional)"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :error="!!fieldErrors.document" :error-message="fieldErrors.document">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Submeter" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { leaveRequestService } from 'src/services/leaves.service'
import { employeeService } from 'src/services/employee.service'
import {
  leaveStatusOptions, leaveStatusVariant, leaveTypeLabel,
} from 'src/config/leaves'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'

const props = defineProps({
  defaultType: { type: String, default: 'vacation' },
})

const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

// Erros do backend mapeados por campo
const { fieldErrors, globalErrors, setFromResponse, clear: clearErrors } = useFormErrors()

const canApprove = computed(
  () => auth.user?.is_superuser
    || auth.hasAnyGroup('RH', 'Diretor Financeiro', 'Administrador', 'Direcao'),
)

const typeLabel = computed(() => leaveTypeLabel(props.defaultType))
const typeLabelLower = computed(() => typeLabel.value.toLowerCase())
const title = computed(() =>
  props.defaultType === 'vacation' ? 'Pedidos de férias'
    : props.defaultType === 'sick_leave' ? 'Baixas médicas'
      : `Pedidos — ${typeLabel.value}`,
)
const description = computed(() =>
  props.defaultType === 'vacation'
    ? 'Pedidos de férias submetidos pelos colaboradores — aprovação pelo RH.'
    : props.defaultType === 'sick_leave'
      ? 'Registo de baixas médicas com período e atestado anexado.'
      : 'Pedidos de ausência.',
)
const newLabel = computed(() =>
  props.defaultType === 'vacation' ? 'Novo pedido de férias'
    : props.defaultType === 'sick_leave' ? 'Registar baixa médica'
      : 'Novo pedido',
)

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const submitting = ref(false)
const filters = reactive({ search: '', status: '' })
const pagination = ref({
  sortBy: 'start_date', descending: true, page: 1, rowsPerPage: 20, rowsNumber: 0,
})

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'period', label: 'Período', field: 'start_date', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const pendingCount = computed(
  () => rows.value.filter((r) => r.status === 'pending').length,
)

// Config para a barra de filtros activos
const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'status', label: 'Estado', emptyValue: '', options: leaveStatusOptions },
]

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}

function onClearAllFilters() {
  filters.search = ''
  filters.status = ''
  onFiltersChanged()
}

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

// ── Reference options ───────────────────────────────────────────────────
const allEmployees = ref([])
const employeeOptions = ref([])
function filterEmployees(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    employeeOptions.value = n
      ? allEmployees.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEmployees.value
  })
}
async function loadRefs() {
  try {
    const data = await employeeService.list({ page_size: 300, status: 'active' })
    allEmployees.value = (data?.results ?? data ?? []).map((e) => ({
      label: `${e.full_name} (${e.employee_number})`,
      value: e.id,
    }))
    employeeOptions.value = allEmployees.value
  } catch { /* interceptor toasts */ }
}

// ── List ────────────────────────────────────────────────────────────────
async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page, page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy}`,
      leave_type: props.defaultType,
    }
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    const data = await leaveRequestService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}
function onTableRequest(p) {
  pagination.value = { ...pagination.value, ...p.pagination }
  fetchPage()
}
function onFiltersChanged() {
  pagination.value.page = 1
  fetchPage()
}

// ── Approve / reject ────────────────────────────────────────────────────
function approve(row) {
  $q.dialog({
    title: 'Aprovar pedido',
    message: `Aprovar o pedido de <b>${row.employee_name}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await leaveRequestService.approve(row.id)
      toast.success('Pedido aprovado.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}
function reject(row) {
  $q.dialog({
    title: 'Rejeitar pedido',
    message: 'Motivo (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      await leaveRequestService.reject(row.id, reason || '')
      toast.success('Pedido rejeitado.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

// ── Create modal ────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  employee: '', leave_type_display: '', start_date: '', end_date: '',
  reason: '', document: null,
})

function openCreate() {
  Object.assign(form, {
    employee: '', leave_type_display: typeLabel.value,
    start_date: '', end_date: '', reason: '', document: null,
  })
  showCreate.value = true
}

async function submitCreate() {
  clearErrors()
  if (!(await formRef.value?.validate())) return
  submitting.value = true
  try {
    const payload = {
      employee: form.employee,
      leave_type: props.defaultType,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
    }
    if (form.document instanceof File) payload.document = form.document
    await leaveRequestService.create(payload)
    toast.success('Pedido submetido.')
    showCreate.value = false
    await fetchPage()
  } catch (err) {
    setFromResponse(err.response)
    toast.error('Verifique os campos assinalados.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadRefs()
  await fetchPage()
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
