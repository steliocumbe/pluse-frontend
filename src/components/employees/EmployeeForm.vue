<!--
  EmployeeForm — shared stepper form for creating / editing colaboradores (RH-1).

  4 steps on create, 3 on edit (Documentos step is create-only — in edit mode
  documents are managed from the detail page's Documentos tab):
    1. Dados pessoais   — identificação + contactos + família
    2. Função e posto   — departamento/posto + função/salário
    3. Pagamento e acesso — banca/M-pesa + conta de acesso
    4. Documentos        — documentos iniciais (create only)

  Each step is its own <q-form> so "Continuar" validates only the current
  step. Emits `submit` with { payload, initialDocuments }.
-->
<template>
  <q-stepper
    v-model="step"
    ref="stepperRef"
    flat
    animated
    alternative-labels
    color="primary"
    class="employee-stepper"
  >
    <!-- ─────────────── Step 1 — Dados pessoais ─────────────── -->
    <q-step :name="1" title="Dados pessoais" icon="person" :done="step > 1">
      <q-form ref="form1" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Identificação</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.full_name" label="Nome completo *" outlined dense
                   :rules="[req]" class="md:col-span-2" />
          <q-input v-model="form.birth_date" label="Data de nascimento *" type="date"
                   outlined dense stack-label :rules="[req]" />
          <q-select v-model="form.gender" :options="genderOptions" label="Género *"
                    outlined dense emit-value map-options :rules="[req]" />
          <q-select v-model="form.document_type" :options="documentTypeOptions"
                    label="Tipo de documento *" outlined dense emit-value map-options
                    :rules="[req]" />
          <q-input v-model="form.document_number" label="Número do documento *"
                   outlined dense :rules="[req]" />
          <q-input v-model="form.document_expiry" label="Validade do documento"
                   type="date" outlined dense stack-label />
          <q-input v-model="form.nuit" label="NUIT" outlined dense
                   hint="9 dígitos (opcional)"
                   :rules="[(v) => !v || /^\d{9}$/.test(v) || 'NUIT deve ter 9 dígitos']" />
          <q-input v-model="form.nationality" label="Nacionalidade" outlined dense />
          <q-select v-model="form.military_status" :options="militaryOptions"
                    label="Situação militar" outlined dense emit-value map-options
                    hint="Relevante para colaboradores entre 18 e 35 anos" />
          <q-input v-model="form.address" label="Morada" type="textarea" outlined dense
                   autogrow class="md:col-span-2" />
        </div>

        <div class="form-group-label">Contactos</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.phone" label="Telefone *" outlined dense inputmode="tel"
                   hint="9 dígitos, com ou sem +258" :rules="[req]" />
          <q-input v-model="form.email"
                   :label="form.create_account ? 'E-mail *' : 'E-mail'"
                   type="email" outlined dense
                   inputmode="email" autocomplete="off"
                   :hint="form.create_account
                     ? 'Será o utilizador da conta de acesso — obrigatório'
                     : 'Opcional. Necessário apenas para criar conta de acesso.'"
                   :rules="[(v) => !form.create_account || !!v || 'Obrigatório para criar conta']" />
        </div>

        <div class="form-group-label">Família</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.father_name" label="Nome do pai" outlined dense />
          <q-input v-model="form.father_phone" label="Contacto do pai" outlined dense inputmode="tel" />
          <q-input v-model="form.mother_name" label="Nome da mãe" outlined dense />
          <q-input v-model="form.mother_phone" label="Contacto da mãe" outlined dense inputmode="tel" />
          <q-input v-model="form.spouse_name" label="Nome do/a cônjuge" outlined dense />
          <q-input v-model="form.spouse_phone" label="Contacto do/a cônjuge" outlined dense inputmode="tel" />
          <q-input v-model="form.emergency_contact_name" label="Nome do contacto de emergência" outlined dense />
          <q-input v-model="form.emergency_contact_phone" label="Telefone de emergência" outlined dense inputmode="tel" />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Step 2 — Função e posto ─────────────── -->
    <q-step :name="2" title="Função e posto" icon="badge" :done="step > 2">
      <q-form ref="form2" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Departamento e posto</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-select v-model="form.department" :options="departmentOptions"
                    label="Departamento *" outlined dense emit-value map-options
                    :rules="[req]" />
          <q-select v-if="form.department === 'operations'" v-model="form.client"
                    :options="clientOptions" label="Cliente *" outlined dense
                    emit-value map-options :loading="loadingClients"
                    :rules="[(v) => !!v || 'Obrigatório para Operações']" />
          <q-select v-if="form.department === 'support'" v-model="form.support_unit"
                    :options="supportUnitOptions" label="Unidade de suporte *"
                    outlined dense emit-value map-options
                    :rules="[(v) => !!v || 'Obrigatório para Suporte']" />
          <q-select v-model="form.post" :options="postOptions" label="Posto"
                    outlined dense emit-value map-options clearable :loading="loadingPosts" />
          <q-input v-model="form.shift" label="Turno" outlined dense class="md:col-span-2"
                   hint="Padrão livre nesta fase (ex: 12h trabalho / 24h descanso). Formalizado nas Escalas." />
        </div>

        <div class="form-group-label">Função e admissão</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-select v-model="form.types" :options="groupOptions" label="Tipos de função *"
                    outlined dense multiple use-chips emit-value map-options options-dense
                    class="md:col-span-2"
                    hint="Pode acumular várias funções (ex: Vigilante + Supervisor)"
                    :rules="[(v) => (Array.isArray(v) && v.length > 0) || 'Selecione pelo menos um tipo']" />
          <q-input v-model="form.hire_date" label="Data de admissão *" type="date"
                   outlined dense stack-label :rules="[req]"
                   hint="Data de entrada na empresa. O cargo e o salário são definidos no contrato." />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Step 3 — Pagamento e acesso ─────────────── -->
    <q-step :name="3" title="Pagamento e acesso" icon="payments" :done="step > 3">
      <q-form ref="form3" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Banca e M-pesa</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.inss_number" label="Número INSS" outlined dense />
          <q-input v-model="form.mpesa_number" label="Número M-pesa" outlined dense inputmode="tel" />
          <q-input v-model="form.mpesa_name" label="Nome M-pesa" outlined dense />
          <q-input v-model="form.bank" label="Banco" outlined dense />
          <q-input v-model="form.bank_account_number" label="Número de conta" outlined dense />
          <q-input v-model="form.nib" label="NIB" outlined dense />
        </div>

        <template v-if="mode === 'create'">
          <div class="form-group-label">Acesso à plataforma</div>
          <q-checkbox v-model="form.create_account"
                      label="Criar conta de utilizador para este colaborador" />
          <q-banner v-if="form.create_account" class="bg-blue-1 text-blue-9" rounded>
            <template #avatar>
              <AppIcon name="ki-information-2" :size="18" icon-class="text-primary" />
            </template>
            Será gerada uma palavra-passe temporária e mostrada uma única vez após guardar.
            A conta fica inactiva até à aprovação do Diretor Financeiro.
          </q-banner>
        </template>
      </q-form>
    </q-step>

    <!-- ─────────────── Step 4 — Documentos (create only) ─────────────── -->
    <q-step v-if="mode === 'create'" :name="4" title="Documentos" icon="folder">
      <div class="form-group-label">Documentos iniciais</div>
      <p class="text-sm text-muted-foreground mb-3">
        Anexe já BI, NUIT, registo criminal, termos ou outros documentos.
        Pode também adicioná-los mais tarde, no detalhe do colaborador.
      </p>
      <EmployeeFormDocuments v-model="form.initial_documents" />
    </q-step>

    <!-- ─────────────── Step 5 — Contrato inicial (create only) ─────────────── -->
    <q-step v-if="mode === 'create'" :name="5" title="Contrato inicial" icon="description">
      <q-form ref="form5" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Contrato de trabalho</div>
        <p class="text-sm text-muted-foreground">
          O colaborador é registado já com o seu primeiro contrato — é aqui que
          se define o cargo e o salário. O contrato fica pendente até aprovação
          do Diretor Financeiro.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-select v-model="contract.contract_type" :options="contractTypeOptions"
                    label="Tipo de contrato *" outlined dense emit-value map-options
                    :rules="[req]" />
          <q-input v-model="contract.job_title" label="Cargo *" outlined dense :rules="[req]"
                   hint="Ex: Vigilante, Supervisor de Zona" />
          <q-input v-model="contract.start_date" label="Início do contrato *" type="date"
                   outlined dense stack-label :rules="[req]" />
          <q-input v-if="contractNeedsEnd" v-model="contract.end_date"
                   label="Fim do contrato *" type="date" outlined dense stack-label
                   :rules="[req]" />
          <q-input v-model="contract.probation_end_date" label="Fim do período probatório"
                   type="date" outlined dense stack-label />
          <q-input v-model.number="contract.weekly_hours" label="Horas semanais"
                   type="number" outlined dense min="0" max="80" />
          <q-select v-model="contract.salary_category" :options="salaryCategoryOptions"
                    label="Categoria salarial" outlined dense emit-value map-options
                    clearable :loading="loadingSalary"
                    hint="Aplicável a vigilantes (4 escalões fixos)" />
          <q-input v-model="contract.base_salary" label="Salário do contrato (MZN)"
                   type="number" outlined dense step="0.01"
                   :disable="!!contract.salary_category"
                   :rules="[(v) => !!contract.salary_category || !!v
                     || 'Indique o salário ou escolha uma categoria']"
                   :hint="contract.salary_category
                     ? 'Definido pela categoria salarial'
                     : 'Salário livre acordado (MZN)'" />
          <q-input v-model="contract.workplace" label="Local de trabalho" outlined dense
                   class="md:col-span-2"
                   hint="Posto, cliente ou unidade à data da assinatura" />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Navigation ─────────────── -->
    <template #navigation>
      <q-stepper-navigation class="flex flex-wrap items-center justify-between gap-2">
        <q-btn
          flat no-caps label="Voltar"
          icon="arrow_back"
          :disable="step === 1 || submitting"
          @click="back"
        />
        <div class="flex items-center gap-2">
          <q-btn flat no-caps label="Cancelar" :disable="submitting" @click="$emit('cancel')" />
          <q-btn
            v-if="step < lastStep"
            no-caps unelevated color="primary"
            label="Continuar" icon-right="arrow_forward"
            @click="next"
          />
          <q-btn
            v-else
            no-caps unelevated color="primary"
            :label="submitLabel"
            :loading="submitting"
            @click="onSubmit"
          />
        </div>
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'src/composables/useToast'
import AppIcon from 'src/components/ui/AppIcon.vue'
import EmployeeFormDocuments from 'src/components/employees/EmployeeFormDocuments.vue'
import { groupService } from 'src/services/group.service'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { salaryCategoryService } from 'src/services/salary-category.service'
import { contractTypeOptions, termedContractTypes } from 'src/config/employment'

const props = defineProps({
  mode: { type: String, default: 'create', validator: (v) => ['create', 'edit'].includes(v) },
  initial: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const toast = useToast()
const req = (v) => !!v || 'Obrigatório'

const step = ref(1)
const stepperRef = ref(null)
const form1 = ref(null)
const form2 = ref(null)
const form3 = ref(null)
// Step 4 (documents) has no required fields. Step 5 (initial contract) does.
const form5 = ref(null)
const stepForms = { 1: form1, 2: form2, 3: form3, 5: form5 }

// Last step depends on mode — documents + contract steps are create-only.
const lastStep = computed(() => (props.mode === 'create' ? 5 : 3))

const blank = {
  full_name: '',
  birth_date: '',
  gender: '',
  document_type: '',
  document_number: '',
  document_expiry: '',
  nuit: '',
  nationality: 'Moçambicana',
  military_status: 'not_applicable',
  address: '',
  father_name: '',
  father_phone: '',
  mother_name: '',
  mother_phone: '',
  spouse_name: '',
  spouse_phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  department: '',
  client: null,
  support_unit: null,
  post: null,
  shift: '',
  phone: '',
  email: '',
  types: [],
  hire_date: '',
  inss_number: '',
  mpesa_number: '',
  mpesa_name: '',
  bank: '',
  bank_account_number: '',
  nib: '',
  create_account: false,
  initial_documents: [],
}

const form = reactive({ ...blank })

// Step 5 — the initial work contract. Kept separate from `form` because it
// is a distinct entity; emitted to the parent as `initialContract`.
const blankContract = {
  contract_type: 'fixed_term',
  job_title: '',
  start_date: '',
  end_date: '',
  probation_end_date: '',
  weekly_hours: null,
  salary_category: null,
  base_salary: '',
  workplace: '',
}
const contract = reactive({ ...blankContract })

const contractNeedsEnd = computed(
  () => termedContractTypes.includes(contract.contract_type),
)

watch(
  () => props.initial,
  (val) => {
    Object.assign(form, blank, val || {})
    if (Array.isArray(form.types) && form.types.length && typeof form.types[0] === 'object') {
      form.types = form.types.map((t) => t.id)
    }
  },
  { immediate: true, deep: true },
)

// Salary category overrides the free salary field on the contract.
watch(
  () => contract.salary_category,
  (cat) => {
    if (cat) contract.base_salary = ''
  },
)
// Prefill the contract start with the admission date (until edited).
watch(
  () => form.hire_date,
  (date) => {
    if (date && !contract.start_date) contract.start_date = date
  },
)
watch(
  () => form.department,
  (dep) => {
    if (dep === 'operations') form.support_unit = null
    if (dep === 'support') form.client = null
  },
)

// ── Options ───────────────────────────────────────────────────────────
const genderOptions = [
  { label: 'Masculino', value: 'male' },
  { label: 'Feminino', value: 'female' },
  { label: 'Outro', value: 'other' },
]
const documentTypeOptions = [
  { label: 'Bilhete de Identidade', value: 'id_card' },
  { label: 'Passaporte', value: 'passport' },
  { label: 'DIRE', value: 'dire' },
]
const militaryOptions = [
  { label: 'Não aplicável', value: 'not_applicable' },
  { label: 'Regularizada', value: 'regularized' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Isento', value: 'exempt' },
]
const departmentOptions = [
  { label: 'Operações', value: 'operations' },
  { label: 'Suporte', value: 'support' },
]
const supportUnitOptions = [
  { label: 'Direção', value: 'direction' },
  { label: 'Administração', value: 'administration' },
  { label: 'Finanças', value: 'finance' },
  { label: 'Recursos Humanos', value: 'hr' },
  { label: 'Inspeção', value: 'inspection' },
  { label: 'Supervisão', value: 'supervision' },
]

const groupOptions = ref([])
const clientOptions = ref([])
const postOptions = ref([])
const salaryCategoryOptions = ref([])
const loadingClients = ref(false)
const loadingPosts = ref(false)
const loadingSalary = ref(false)

onMounted(async () => {
  try {
    const groups = await groupService.list()
    groupOptions.value = groups.map((g) => ({ label: g.name, value: g.id }))
  } catch {
    /* axios interceptor handles the toast */
  }

  loadingClients.value = true
  try {
    const data = await clientService.list({ page_size: 200 })
    const rows = data?.results ?? data ?? []
    clientOptions.value = rows.map((c) => ({ label: c.name, value: c.id }))
  } catch {
    /* ignore */
  } finally {
    loadingClients.value = false
  }

  loadingPosts.value = true
  try {
    const data = await postService.list({ page_size: 200 })
    const rows = data?.results ?? data ?? []
    postOptions.value = rows.map((p) => {
      const base = p.client_name ? `${p.name} — ${p.client_name}` : p.name
      const cap = p.max_guards != null
        ? ` (${p.current_guards}/${p.max_guards}${p.has_capacity ? '' : ' · cheio'})`
        : ''
      return { label: base + cap, value: p.id, disable: p.has_capacity === false }
    })
  } catch {
    /* ignore */
  } finally {
    loadingPosts.value = false
  }

  loadingSalary.value = true
  try {
    const cats = await salaryCategoryService.list()
    salaryCategoryOptions.value = cats.map((c) => ({
      label: `${c.label} — ${c.amount} MZN`,
      value: c.id,
    }))
  } catch {
    /* ignore */
  } finally {
    loadingSalary.value = false
  }
})

const submitLabel = computed(() =>
  props.mode === 'create' ? 'Guardar (pendente)' : 'Guardar alterações',
)

async function validateStep(n) {
  const formRef = stepForms[n]?.value
  if (!formRef) return true // steps without a form (e.g. documents) always pass
  const ok = await formRef.validate()
  return ok !== false
}

async function next() {
  if (await validateStep(step.value)) {
    stepperRef.value?.next()
  } else {
    toast.warning('Há campos por preencher neste passo.')
  }
}

function back() {
  stepperRef.value?.previous()
}

async function onSubmit() {
  // Validate every step that has a form — guards against header navigation
  // skipping a step or editing a prior field after advancing.
  for (const n of [1, 2, 3, 5]) {
    if (!(await validateStep(n))) {
      step.value = n
      toast.warning('Há campos por preencher. Reveja os passos destacados.')
      return
    }
  }

  const initialDocuments = (form.initial_documents || []).filter((d) => d.type && d.file)
  const payload = {}
  for (const [k, v] of Object.entries(form)) {
    if (k === 'initial_documents') continue
    if (v === '' || v === null || v === undefined) continue
    payload[k] = v
  }

  // Build the initial contract payload — drop empty fields.
  const initialContract = {}
  for (const [k, v] of Object.entries(contract)) {
    if (v === '' || v === null || v === undefined) continue
    initialContract[k] = v
  }
  if (initialContract.base_salary !== undefined) {
    initialContract.base_salary = String(initialContract.base_salary)
  }

  emit('submit', { payload, initialDocuments, initialContract })
}
</script>

<style scoped>
.employee-stepper {
  background: transparent;
}
/* Light section label inside a step — separates sub-groups without the
   weight of a full collapsible AppFormSection. */
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
