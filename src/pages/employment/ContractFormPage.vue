<!--
  /employment-contracts/new  &  /employment-contracts/:id/edit
  Single-form create / edit page for a work contract.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    :title="isEdit ? 'Editar contrato' : 'Novo contrato de trabalho'"
    :description="isEdit
      ? 'Actualize os dados do contrato. Alterações não voltam a passar por aprovação automaticamente.'
      : 'Registe um contrato de trabalho. Fica pendente até aprovação do Diretor Financeiro.'"
  >
    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar"
        :to="{ name: 'employment-contracts-list' }"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <q-form ref="formRef" greedy class="flex flex-col gap-5" @submit="onSubmit">
          <div class="form-group-label">Colaborador e função</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select
              v-model="form.employee"
              :options="employeeOptions"
              label="Colaborador *"
              outlined dense emit-value map-options use-input
              :loading="loadingEmployees"
              :disable="lockedEmployee"
              input-debounce="300"
              @filter="filterEmployees"
              :rules="[req]"
              class="md:col-span-2"
              :hint="lockedEmployee ? 'Pré-seleccionado a partir do colaborador.' : ''"
            />
            <q-select
              v-model="form.contract_type"
              :options="contractTypeOptions"
              label="Tipo de contrato *"
              outlined dense emit-value map-options :rules="[req]"
            />
            <q-input v-model="form.job_title" label="Cargo *" outlined dense :rules="[req]" />
            <q-input
              v-model="form.workplace" label="Local de trabalho" outlined dense
              class="md:col-span-2"
              hint="Posto, cliente ou unidade onde exerce funções"
            />
          </div>

          <div class="form-group-label">Vigência</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input
              v-model="form.start_date" label="Data de início *" type="date"
              outlined dense stack-label :rules="[req]"
            />
            <q-input
              v-if="needsEndDate"
              v-model="form.end_date" label="Data de fim *" type="date"
              outlined dense stack-label
              :rules="[req, afterStart]"
            />
            <q-input
              v-model="form.probation_end_date" label="Fim do período probatório"
              type="date" outlined dense stack-label
            />
            <q-input
              v-model.number="form.weekly_hours" label="Horas semanais"
              type="number" outlined dense min="0" max="80"
            />
          </div>

          <div class="form-group-label">Remuneração</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select
              v-model="form.salary_category"
              :options="salaryCategoryOptions"
              label="Categoria salarial" outlined dense
              emit-value map-options clearable :loading="loadingSalary"
              hint="Aplicável a vigilantes"
            />
            <q-input
              v-model="form.base_salary" label="Salário do contrato (MZN) *"
              type="number" outlined dense step="0.01" :rules="[req]"
            />
          </div>

          <div class="form-group-label">Documento</div>
          <div class="grid grid-cols-1 gap-4">
            <q-file
              v-model="form.file" label="Contrato assinado (PDF)"
              outlined dense clearable
              max-file-size="10485760" accept=".pdf,.jpg,.jpeg,.png"
            >
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-input
              v-model="form.notes" label="Notas" type="textarea"
              outlined dense autogrow
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <q-btn
              flat no-caps label="Cancelar" :disable="submitting"
              :to="{ name: 'employment-contracts-list' }"
            />
            <q-btn
              unelevated no-caps color="primary" type="submit"
              :label="isEdit ? 'Guardar alterações' : 'Guardar (pendente)'"
              :loading="submitting"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contractService } from 'src/services/employment.service'
import { employeeService } from 'src/services/employee.service'
import { salaryCategoryService } from 'src/services/salary-category.service'
import { contractTypeOptions, termedContractTypes } from 'src/config/employment'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
// When opened from an employee's page (?employee=ID) the colaborador is
// pre-selected and locked — no need to ask again.
const lockedEmployee = computed(() => !isEdit.value && !!route.query.employee)
const formRef = ref(null)
const submitting = ref(false)
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const form = reactive({
  employee: null,
  contract_type: 'fixed_term',
  job_title: '',
  workplace: '',
  start_date: '',
  end_date: '',
  probation_end_date: '',
  weekly_hours: null,
  base_salary: '',
  salary_category: null,
  file: null,
  notes: '',
})

const needsEndDate = computed(() => termedContractTypes.includes(form.contract_type))
function afterStart(v) {
  if (!v || !form.start_date) return true
  return new Date(v) > new Date(form.start_date) || 'Deve ser posterior ao início'
}

// ── Employee selector (searchable) ──────────────────────────────────────
const allEmployees = ref([])
const employeeOptions = ref([])
const loadingEmployees = ref(false)

function mapEmployee(e) {
  return { label: `${e.full_name} (${e.employee_number})`, value: e.id }
}
function filterEmployees(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    employeeOptions.value = n
      ? allEmployees.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEmployees.value
  })
}

// ── Salary categories ───────────────────────────────────────────────────
const salaryCategoryOptions = ref([])
const loadingSalary = ref(false)

onMounted(async () => {
  loadingEmployees.value = true
  try {
    const data = await employeeService.list({ page_size: 300 })
    const rows = data?.results ?? data ?? []
    allEmployees.value = rows.map(mapEmployee)
    employeeOptions.value = allEmployees.value
  } catch { /* interceptor toasts */ } finally {
    loadingEmployees.value = false
  }

  // Pre-select the colaborador when arriving from their detail page.
  if (lockedEmployee.value) {
    form.employee = Number(route.query.employee)
  }

  loadingSalary.value = true
  try {
    const cats = await salaryCategoryService.list()
    salaryCategoryOptions.value = cats.map((c) => ({
      label: `${c.label} — ${c.amount} MZN`,
      value: c.id,
    }))
  } catch { /* ignore */ } finally {
    loadingSalary.value = false
  }

  if (isEdit.value) {
    try {
      const c = await contractService.get(route.params.id)
      Object.assign(form, {
        employee: c.employee,
        contract_type: c.contract_type,
        job_title: c.job_title,
        workplace: c.workplace || '',
        start_date: c.start_date || '',
        end_date: c.end_date || '',
        probation_end_date: c.probation_end_date || '',
        weekly_hours: c.weekly_hours,
        base_salary: c.base_salary,
        salary_category: c.salary_category,
        notes: c.notes || '',
      })
    } catch {
      toast.error('Contrato não encontrado.')
      router.push({ name: 'employment-contracts-list' })
    }
  }
})

async function onSubmit() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { ...form }
    if (!needsEndDate.value) payload.end_date = ''
    // Drop empty file so PATCH doesn't clear an existing one.
    if (!(payload.file instanceof File)) delete payload.file
    let saved
    if (isEdit.value) {
      saved = await contractService.update(route.params.id, payload)
      toast.success('Contrato actualizado.')
    } else {
      saved = await contractService.create(payload)
      toast.success('Contrato criado — pendente de aprovação.')
    }
    router.push({ name: 'employment-contracts-detail', params: { id: saved.id } })
  } catch (err) {
    toast.error('Não foi possível guardar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.pluse-card { background: var(--card); }
.form-group-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border);
}
</style>
