<!--
  /assets/assignments — Atribuições de ativos (Fase 4.4).
  Liga uma viatura OU um equipamento a um colaborador, com data de devolução.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · Ativos"
    title="Atribuições"
    description="Quem está com cada viatura e equipamento. Marcar como devolvido fecha a atribuição."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-user-tick" :size="14" />
        {{ count }} atribuiç{{ count === 1 ? 'ão' : 'ões' }}
      </span>
      <span v-if="openCount" class="admin-meta-chip admin-meta-chip--accent">
        {{ openCount }} em curso
      </span>
    </template>

    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary"
             icon="add" label="Nova atribuição" @click="openCreate" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input v-model="filters.search" outlined dense clearable debounce="350"
                 placeholder="Procurar por colaborador, viatura, equipamento…" class="grow"
                 @update:model-value="onFiltersChanged">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-checkbox v-model="filters.openOnly" label="Só em curso"
                    @update:model-value="onFiltersChanged" />
      </q-card-section>

      <q-table v-model:pagination="pagination"
               :rows="rows" :columns="columns" :loading="loading"
               row-key="id" flat bordered binary-state-sort
               :rows-per-page-options="[10, 15, 25, 50]"
               class="pluse-table" no-data-label="Sem atribuições registadas."
               @request="onTableRequest">
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>
        <template #body-cell-asset="props">
          <q-td :props="props">
            <div class="text-sm">
              <AppIcon v-if="props.row.vehicle" name="ki-setting-2" :size="13" />
              <AppIcon v-else name="ki-shield-tick" :size="13" />
              {{ props.row.vehicle_label || props.row.equipment_label }}
            </div>
          </q-td>
        </template>
        <template #body-cell-period="props">
          <q-td :props="props">
            {{ formatDate(props.row.assigned_at) }}
            <span v-if="props.row.returned_at"> → {{ formatDate(props.row.returned_at) }}</span>
            <span v-else class="text-muted-foreground"> → em curso</span>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn
              v-if="props.row.is_open"
              outline no-caps size="sm" icon="undo" label="Devolver"
              @click="markReturned(props.row)"
            />
          </q-td>
        </template>
        <template #no-data>
          <AppEmptyState title="Sem atribuições" description="Registe a primeira atribuição."
                         icon="ki-user-tick" cta-label="Nova atribuição" @cta="openCreate" />
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showModal" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Nova atribuição
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-select v-model="form.employee" :options="employeeOptions"
                    label="Colaborador *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterEmployees" :rules="[req]" />
          <q-btn-toggle
            v-model="form.kind"
            :options="[{label:'Viatura', value:'vehicle'},{label:'Equipamento', value:'equipment'}]"
            outline no-caps spread
          />
          <q-select v-if="form.kind === 'vehicle'"
                    v-model="form.vehicle" :options="vehicleOptions"
                    label="Viatura *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterVehicles" :rules="[req]" />
          <q-select v-if="form.kind === 'equipment'"
                    v-model="form.equipment" :options="equipmentOptions"
                    label="Equipamento *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterEquipment" :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.assigned_at" label="Atribuído em *" type="date"
                     outlined dense stack-label :rules="[req]" />
            <q-input v-model="form.returned_at" label="Devolvido em" type="date"
                     outlined dense stack-label hint="Vazio = em curso" />
          </div>
          <q-input v-model="form.notes" label="Notas" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showModal = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Atribuir" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  assetAssignmentService, equipmentService, vehicleService,
} from 'src/services/assets.service'
import { employeeService } from 'src/services/employee.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ search: '', openOnly: false })
const pagination = ref({ sortBy: 'assigned_at', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0 })

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'asset', label: 'Ativo', field: 'vehicle_label', align: 'left' },
  { name: 'period', label: 'Período', field: 'assigned_at', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const openCount = computed(() => rows.value.filter((r) => r.is_open).length)

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

// ── Refs ────────────────────────────────────────────────────────────────
const allEmployees = ref([])
const employeeOptions = ref([])
const allVehicles = ref([])
const vehicleOptions = ref([])
const allEquipment = ref([])
const equipmentOptions = ref([])

function filterEmployees(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    employeeOptions.value = n
      ? allEmployees.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEmployees.value
  })
}
function filterVehicles(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    vehicleOptions.value = n
      ? allVehicles.value.filter((o) => o.label.toLowerCase().includes(n))
      : allVehicles.value
  })
}
function filterEquipment(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    equipmentOptions.value = n
      ? allEquipment.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEquipment.value
  })
}

async function loadRefs() {
  try {
    const [emps, vhcs, equips] = await Promise.all([
      employeeService.list({ page_size: 300, status: 'active' }),
      vehicleService.list({ page_size: 300 }),
      equipmentService.list({ page_size: 300 }),
    ])
    allEmployees.value = (emps?.results ?? emps ?? []).map((e) => ({
      label: `${e.full_name} (${e.employee_number})`, value: e.id,
    }))
    employeeOptions.value = allEmployees.value
    allVehicles.value = (vhcs?.results ?? vhcs ?? []).map((v) => ({
      label: `${v.registration_plate} — ${v.make || ''} ${v.model || ''}`.trim(),
      value: v.id,
    }))
    vehicleOptions.value = allVehicles.value
    allEquipment.value = (equips?.results ?? equips ?? []).map((e) => ({
      label: `${e.name} (${e.serial_number})`, value: e.id,
    }))
    equipmentOptions.value = allEquipment.value
  } catch { /* interceptor */ }
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = { page, page_size: rowsPerPage, ordering: `${descending ? '-' : ''}${sortBy}` }
    if (filters.search) params.search = filters.search
    if (filters.openOnly) params.returned_at__isnull = 'true'
    const data = await assetAssignmentService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}
function onTableRequest(p) { pagination.value = { ...pagination.value, ...p.pagination }; fetchPage() }
function onFiltersChanged() { pagination.value.page = 1; fetchPage() }

// ── Create ──────────────────────────────────────────────────────────────
const showModal = ref(false)
const formRef = ref(null)
const form = reactive({
  employee: '', kind: 'vehicle', vehicle: '', equipment: '',
  assigned_at: '', returned_at: '', notes: '',
})

function openCreate() {
  const today = new Date().toISOString().slice(0, 10)
  Object.assign(form, {
    employee: '', kind: 'vehicle', vehicle: '', equipment: '',
    assigned_at: today, returned_at: '', notes: '',
  })
  showModal.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = {
      employee: form.employee,
      assigned_at: form.assigned_at,
      returned_at: form.returned_at || null,
      notes: form.notes,
    }
    if (form.kind === 'vehicle') payload.vehicle = form.vehicle
    else payload.equipment = form.equipment
    await assetAssignmentService.create(payload)
    toast.success('Atribuição registada.')
    showModal.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível atribuir.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

function markReturned(row) {
  $q.dialog({
    title: 'Marcar como devolvido',
    message: `Confirma a devolução? A data será hoje.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Devolver', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await assetAssignmentService.returnAsset(row.id)
      toast.success('Marcada como devolvida.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível devolver.', { caption: err?.response?.data?.detail })
    }
  })
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
