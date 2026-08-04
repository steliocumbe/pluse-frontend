<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Planos de férias"
    description="Solicitação, aprovação e rejeição de férias com atualização automática de saldo anual."
  >
    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary" icon="add" label="Novo plano" @click="openCreate" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading" no-data-label="Sem planos de férias.">
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="font-semibold">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>
        <template #body-cell-period="props">
          <q-td :props="props">{{ formatDate(props.row.start_date) }} -> {{ formatDate(props.row.end_date) }}</q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)">{{ props.row.status_display }}</AppBadge>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <div class="flex gap-1 justify-end">
              <q-btn v-if="props.row.status === 'requested' && canApprove" flat dense no-caps color="positive" label="Aprovar" @click="approvePlan(props.row)" />
              <q-btn v-if="props.row.status === 'requested' && canApprove" flat dense no-caps color="negative" label="Rejeitar" @click="rejectPlan(props.row)" />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">Novo plano de férias</AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-3" @submit="submitCreate">
          <q-select v-model="form.employee" :options="employeeOptions" emit-value map-options outlined dense label="Colaborador *" :rules="[req]" />
          <div class="grid grid-cols-3 gap-3">
            <q-input v-model.number="form.reference_year" type="number" outlined dense label="Ano *" :rules="[req]" />
            <q-input v-model="form.start_date" type="date" outlined dense stack-label label="Início *" :rules="[req]" class="col-span-2" />
          </div>
          <q-input v-model="form.end_date" type="date" outlined dense stack-label label="Fim *" :rules="[req]" />
          <q-input v-model.number="form.total_days" type="number" outlined dense label="Total de dias" />
          <q-input v-model="form.notes" type="textarea" autogrow outlined dense label="Notas" />
          <div class="flex justify-end gap-2 mt-2">
            <q-btn flat no-caps label="Cancelar" @click="showCreate = false" :disable="saving" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import { vacationPlanService } from 'src/services/hr.service'
import { employeeService } from 'src/services/employee.service'
import { useToast } from 'src/composables/useToast'

const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const employees = ref([])
const loading = ref(false)
const saving = ref(false)

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'reference_year', label: 'Ano', field: 'reference_year', align: 'left' },
  { name: 'period', label: 'Período', field: 'start_date', align: 'left' },
  { name: 'total_days', label: 'Dias', field: 'total_days', align: 'center' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const canApprove = computed(
  () => auth.user?.is_superuser || auth.hasAnyGroup('RH', 'Diretor Financeiro', 'Administrador', 'Direcao'),
)

const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  employee: null,
  reference_year: new Date().getFullYear(),
  start_date: '',
  end_date: '',
  total_days: null,
  notes: '',
})

const employeeOptions = computed(() =>
  employees.value.map((e) => ({ value: e.id, label: `${e.full_name} (${e.employee_number})` })),
)

function statusVariant(v) {
  return { requested: 'warning', approved: 'success', rejected: 'danger' }[v] || 'neutral'
}

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString('pt-PT') : '—'
}

function openCreate() {
  Object.assign(form, {
    employee: null,
    reference_year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    total_days: null,
    notes: '',
  })
  showCreate.value = true
}

async function fetchRows() {
  loading.value = true
  try {
    const [plansData, empsData] = await Promise.all([
      vacationPlanService.list({ page_size: 300 }),
      employeeService.list({ page_size: 300, status: 'active' }),
    ])
    rows.value = plansData?.results ?? plansData ?? []
    employees.value = empsData?.results ?? empsData ?? []
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    await vacationPlanService.create({ ...form })
    toast.success('Plano de férias criado.')
    showCreate.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível criar plano.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

async function approvePlan(row) {
  try {
    await vacationPlanService.approve(row.id)
    toast.success('Plano aprovado e saldo atualizado.')
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao aprovar plano.', { caption: err?.response?.data?.detail })
  }
}

function rejectPlan(row) {
  $q.dialog({
    title: 'Rejeitar plano',
    message: 'Motivo da rejeição (opcional):',
    prompt: { model: '', type: 'text' },
    cancel: true,
    persistent: true,
  }).onOk(async (reason) => {
    try {
      await vacationPlanService.reject(row.id, reason || '')
      toast.success('Plano rejeitado.')
      await fetchRows()
    } catch (err) {
      toast.error('Falha ao rejeitar plano.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(fetchRows)
</script>

<style scoped>
.pluse-card { background: var(--card); }
</style>
