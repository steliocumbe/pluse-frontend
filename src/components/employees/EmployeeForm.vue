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
    header-nav
    color="primary"
    class="employee-stepper"
  >
    <!-- ─────────────── Step 1 — Dados pessoais ─────────────── -->
    <q-step :name="1" title="Dados pessoais" icon="person" :done="maxStepReached > 1">
      <q-form ref="form1" greedy class="flex flex-col gap-5">
        <!-- Erros globais do servidor -->
        <div v-if="globalErrors.length"
          class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p v-for="(e, i) in globalErrors" :key="i" class="m-0">{{ e }}</p>
        </div>

        <div class="form-group-label">Identificação</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.full_name" label="Nome completo *" outlined dense
                   :rules="[req]" class="md:col-span-2"
                   :error="!!fieldErrors.full_name" :error-message="fieldErrors.full_name"
                   @update:model-value="() => clearField('full_name')" />
          <q-input v-model="form.birth_date" label="Data de nascimento *" type="date"
                   outlined dense stack-label :rules="[req, dateNotFuture()]"
                   :error="!!fieldErrors.birth_date" :error-message="fieldErrors.birth_date"
                   @update:model-value="() => clearField('birth_date')" />
          <q-select v-model="form.gender" :options="genderOptions" label="Género *"
                    outlined dense emit-value map-options :rules="[req]"
                    :error="!!fieldErrors.gender" :error-message="fieldErrors.gender"
                    @update:model-value="() => clearField('gender')" />
          <q-select v-model="form.document_type" :options="documentTypeOptions"
                    label="Tipo de documento *" outlined dense emit-value map-options
                    :rules="[req]"
                    :error="!!fieldErrors.document_type" :error-message="fieldErrors.document_type"
                    @update:model-value="() => clearField('document_type')" />
          <q-input v-model="form.document_number" label="Número do documento *"
                   outlined dense
                   :rules="[req, form.document_type === 'id_card' ? bilheteIdentidade() : () => true]"
                   :error="!!fieldErrors.document_number" :error-message="fieldErrors.document_number"
                   @update:model-value="() => clearField('document_number')" />
          <q-input v-model="form.document_expiry" label="Validade do documento"
                   type="date" outlined dense stack-label
                   :error="!!fieldErrors.document_expiry" :error-message="fieldErrors.document_expiry"
                   @update:model-value="() => clearField('document_expiry')" />
          <q-input v-model="form.nuit" label="NUIT" outlined dense
                   hint="9 dígitos (opcional)"
                   :rules="[nuit()]"
                   :error="!!fieldErrors.nuit" :error-message="fieldErrors.nuit"
                   @update:model-value="() => clearField('nuit')" />
          <q-input v-model="form.nationality" label="Nacionalidade" outlined dense
                   :error="!!fieldErrors.nationality" :error-message="fieldErrors.nationality"
                   @update:model-value="() => clearField('nationality')" />
          <q-select v-model="form.military_status" :options="militaryOptions"
                    label="Situação militar" outlined dense emit-value map-options
                    hint="Relevante para colaboradores entre 18 e 35 anos"
                    :error="!!fieldErrors.military_status" :error-message="fieldErrors.military_status"
                    @update:model-value="() => clearField('military_status')" />
          <q-input v-model="form.address" label="Morada" type="textarea" outlined dense
                   autogrow class="md:col-span-2"
                   :error="!!fieldErrors.address" :error-message="fieldErrors.address"
                   @update:model-value="() => clearField('address')" />
        </div>

        <div class="form-group-label">Contactos</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.phone" label="Telefone *" outlined dense inputmode="tel"
                   hint="9 dígitos, com ou sem +258" :rules="[req, mozambicanPhone()]"
                   :error="!!fieldErrors.phone" :error-message="fieldErrors.phone"
                   @update:model-value="() => clearField('phone')" />
          <q-input v-model="form.email"
                   :label="form.create_account ? 'E-mail *' : 'E-mail'"
                   type="email" outlined dense
                   inputmode="email" autocomplete="off"
                   :hint="form.create_account
                     ? 'Será o utilizador da conta de acesso — obrigatório'
                     : 'Opcional. Necessário apenas para criar conta de acesso.'"
                   :rules="[(v) => !form.create_account || !!v || 'Obrigatório para criar conta', email()]"
                   :error="!!fieldErrors.email" :error-message="fieldErrors.email"
                   @update:model-value="() => clearField('email')" />
        </div>

        <div class="form-group-label">Família</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.father_name" label="Nome do pai" outlined dense
                   :error="!!fieldErrors.father_name" :error-message="fieldErrors.father_name"
                   @update:model-value="() => clearField('father_name')" />
          <q-input v-model="form.father_phone" label="Contacto do pai" outlined dense inputmode="tel"
                   :rules="[mozambicanPhone()]"
                   :error="!!fieldErrors.father_phone" :error-message="fieldErrors.father_phone"
                   @update:model-value="() => clearField('father_phone')" />
          <q-input v-model="form.mother_name" label="Nome da mãe" outlined dense
                   :error="!!fieldErrors.mother_name" :error-message="fieldErrors.mother_name"
                   @update:model-value="() => clearField('mother_name')" />
          <q-input v-model="form.mother_phone" label="Contacto da mãe" outlined dense inputmode="tel"
                   :rules="[mozambicanPhone()]"
                   :error="!!fieldErrors.mother_phone" :error-message="fieldErrors.mother_phone"
                   @update:model-value="() => clearField('mother_phone')" />
          <q-input v-model="form.spouse_name" label="Nome do/a cônjuge" outlined dense
                   :error="!!fieldErrors.spouse_name" :error-message="fieldErrors.spouse_name"
                   @update:model-value="() => clearField('spouse_name')" />
          <q-input v-model="form.spouse_phone" label="Contacto do/a cônjuge" outlined dense inputmode="tel"
                   :rules="[mozambicanPhone()]"
                   :error="!!fieldErrors.spouse_phone" :error-message="fieldErrors.spouse_phone"
                   @update:model-value="() => clearField('spouse_phone')" />
          <q-input v-model="form.emergency_contact_name" label="Nome do contacto de emergência *" outlined dense
                   :rules="[reqEmergency]"
                   :error="!!fieldErrors.emergency_contact_name" :error-message="fieldErrors.emergency_contact_name"
                   @update:model-value="() => clearField('emergency_contact_name')" />
          <q-input v-model="form.emergency_contact_phone" label="Telefone de emergência *" outlined dense inputmode="tel"
                   :rules="[reqEmergency, mozambicanPhone()]"
                   :error="!!fieldErrors.emergency_contact_phone" :error-message="fieldErrors.emergency_contact_phone"
                   @update:model-value="() => clearField('emergency_contact_phone')" />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Step 2 — Função e posto ─────────────── -->
    <q-step
      :name="2"
      title="Função e posto"
      icon="badge"
      :done="maxStepReached > 2"
      :disable="isStepDisabled(2)"
    >
      <q-form ref="form2" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Departamento e posto</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-select v-model="form.department" :options="departmentOptions"
                    label="Área de Trabalho / Departamento *" outlined dense emit-value map-options
                    :rules="[req]"
                    :error="!!fieldErrors.department" :error-message="fieldErrors.department"
                    @update:model-value="() => clearField('department')" />
          <q-select v-model="form.client"
                    :options="clientOptions" label="Alocar ao Cliente" outlined dense clearable
                    emit-value map-options :loading="loadingClients"
                    :error="!!fieldErrors.client" :error-message="fieldErrors.client"
                    @update:model-value="() => clearField('client')" />
          <q-select v-model="form.post" :options="postOptions" label="Posto"
                    outlined dense emit-value map-options clearable :loading="loadingPosts"
                    :error="!!fieldErrors.post" :error-message="fieldErrors.post"
                    @update:model-value="() => clearField('post')" />
          <q-input v-model="form.shift" label="Turno" outlined dense class="md:col-span-2"
                   hint="Padrão livre nesta fase (ex: 12h trabalho / 24h descanso). Formalizado nas Escalas."
                   :error="!!fieldErrors.shift" :error-message="fieldErrors.shift"
                   @update:model-value="() => clearField('shift')" />
        </div>

        <div class="form-group-label">Função e admissão</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-select v-model="form.types" :options="groupOptions" label="Tipos de função *"
                    outlined dense multiple use-chips emit-value map-options options-dense
                    class="md:col-span-2"
                    hint="Pode acumular várias funções (ex: Vigilante + Supervisor)"
                    :rules="[(v) => (Array.isArray(v) && v.length > 0) || 'Selecione pelo menos um tipo']"
                    :error="!!fieldErrors.types" :error-message="fieldErrors.types"
                    @update:model-value="() => clearField('types')" />
          <q-input v-model="form.hire_date" label="Data de admissão *" type="date"
                   outlined dense stack-label :rules="[req, dateNotFuture()]"
                   hint="Data de entrada na empresa. O cargo e o salário são definidos no contrato."
                   :error="!!fieldErrors.hire_date" :error-message="fieldErrors.hire_date"
                   @update:model-value="() => clearField('hire_date')" />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Step 3 — Pagamento e acesso ─────────────── -->
    <q-step
      :name="3"
      title="Pagamento e acesso"
      icon="payments"
      :done="maxStepReached > 3"
      :disable="isStepDisabled(3)"
    >
      <q-form ref="form3" greedy class="flex flex-col gap-5">
        <div class="form-group-label">Banca e M-pesa</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <q-input v-model="form.inss_number" label="Número INSS" outlined dense
                   :rules="[inss()]"
                   :error="!!fieldErrors.inss_number" :error-message="fieldErrors.inss_number"
                   @update:model-value="() => clearField('inss_number')" />
          <q-input v-model="form.mpesa_number" label="Número M-pesa" outlined dense inputmode="tel"
                   :rules="[mpesa()]"
                   :error="!!fieldErrors.mpesa_number" :error-message="fieldErrors.mpesa_number"
                   @update:model-value="() => clearField('mpesa_number')" />
          <q-input v-model="form.mpesa_name" label="Nome M-pesa" outlined dense
                   :error="!!fieldErrors.mpesa_name" :error-message="fieldErrors.mpesa_name"
                   @update:model-value="() => clearField('mpesa_name')" />
          <q-input v-model="form.bank" label="Banco" outlined dense
                   :error="!!fieldErrors.bank" :error-message="fieldErrors.bank"
                   @update:model-value="() => clearField('bank')" />
          <q-input v-model="form.bank_account_number" label="Número de conta" outlined dense
                   :rules="[ibanMz()]"
                   hint="IBAN moçambicano (MZ59 + 21 dígitos), se aplicável"
                   :error="!!fieldErrors.bank_account_number" :error-message="fieldErrors.bank_account_number"
                   @update:model-value="() => clearField('bank_account_number')" />
          <q-input v-model="form.nib" label="NIB" outlined dense
                   :rules="[nib()]"
                   :error="!!fieldErrors.nib" :error-message="fieldErrors.nib"
                   @update:model-value="() => clearField('nib')" />
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
    <q-step
      v-if="mode === 'create'"
      :name="4"
      title="Documentos"
      icon="folder"
      :done="maxStepReached > 4"
      :disable="isStepDisabled(4)"
    >
      <div class="form-group-label">Documentos iniciais</div>
      <p class="text-sm text-muted-foreground mb-3">
        Anexe já BI, NUIT, registo criminal, termos ou outros documentos.
        Pode também adicioná-los mais tarde, no detalhe do colaborador.
      </p>
      <EmployeeFormDocuments v-model="form.initial_documents" />
    </q-step>

    <!-- ─────────────── Step 5 — Contrato inicial (create only) ─────────────── -->
    <q-step
      v-if="mode === 'create'"
      :name="5"
      title="Contrato inicial"
      icon="description"
      :disable="isStepDisabled(5)"
    >
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
                    :rules="[req]"
                    :error="!!fieldErrors['initial_contract.contract_type']"
                    :error-message="fieldErrors['initial_contract.contract_type']"
                    @update:model-value="() => clearField('initial_contract.contract_type')" />
          <q-select v-model="contract.job_title" :options="jobTitleFiltered"
                    label="Cargo *" outlined dense use-input fill-input hide-selected
                    new-value-mode="add-unique" input-debounce="200"
                    @filter="filterJobTitles" :rules="[req]"
                    hint="Escolha da lista ou escreva um cargo novo"
                    :error="!!fieldErrors['initial_contract.job_title']"
                    :error-message="fieldErrors['initial_contract.job_title']"
                    @update:model-value="() => clearField('initial_contract.job_title')" />
          <q-input v-model="contract.start_date" label="Início do contrato *" type="date"
                   outlined dense stack-label :rules="[req]"
                   :error="!!fieldErrors['initial_contract.start_date']"
                   :error-message="fieldErrors['initial_contract.start_date']"
                   @update:model-value="() => clearField('initial_contract.start_date')" />
          <q-input v-if="contractNeedsEnd" v-model="contract.end_date"
                   label="Fim do contrato *" type="date" outlined dense stack-label
                   :rules="[req, dateAfter(contract.start_date)]"
                   :error="!!fieldErrors['initial_contract.end_date']"
                   :error-message="fieldErrors['initial_contract.end_date']"
                   @update:model-value="() => clearField('initial_contract.end_date')" />
          <q-input v-model="contract.probation_end_date" label="Fim do período probatório"
                   type="date" outlined dense stack-label
                   :rules="[dateAfter(contract.start_date)]"
                   :error="!!fieldErrors['initial_contract.probation_end_date']"
                   :error-message="fieldErrors['initial_contract.probation_end_date']"
                   @update:model-value="() => clearField('initial_contract.probation_end_date')" />
          <q-input v-model.number="contract.weekly_hours" label="Horas semanais"
                   type="number" outlined dense min="0" max="80"
                   :error="!!fieldErrors['initial_contract.weekly_hours']"
                   :error-message="fieldErrors['initial_contract.weekly_hours']"
                   @update:model-value="() => clearField('initial_contract.weekly_hours')" />
          <q-select v-model="contract.salary_category" :options="salaryCategoryOptions"
                    label="Categoria salarial" outlined dense emit-value map-options
                    clearable :loading="loadingSalary"
                    hint="Aplicável a vigilantes (4 escalões fixos)"
                    :error="!!fieldErrors['initial_contract.salary_category']"
                    :error-message="fieldErrors['initial_contract.salary_category']"
                    @update:model-value="() => clearField('initial_contract.salary_category')" />
          <q-input v-model="contract.base_salary" label="Salário do contrato (MZN)"
                   type="number" outlined dense step="0.01"
                   :disable="!!contract.salary_category"
                   :rules="[(v) => !!contract.salary_category || !!v
                     || 'Indique o salário ou escolha uma categoria', decimalAmount()]"
                   :hint="contract.salary_category
                     ? 'Definido pela categoria salarial'
                     : 'Salário livre acordado (MZN)'"
                   :error="!!fieldErrors['initial_contract.base_salary']"
                   :error-message="fieldErrors['initial_contract.base_salary']"
                   @update:model-value="() => clearField('initial_contract.base_salary')" />
          <q-input v-model="contract.workplace" label="Local de trabalho" outlined dense
                   class="md:col-span-2"
                   hint="Posto, cliente ou unidade à data da assinatura"
                   :error="!!fieldErrors['initial_contract.workplace']"
                   :error-message="fieldErrors['initial_contract.workplace']"
                   @update:model-value="() => clearField('initial_contract.workplace')" />
        </div>
      </q-form>
    </q-step>

    <!-- ─────────────── Navigation ─────────────── -->
    <template #navigation>
      <q-stepper-navigation class="employee-stepper-nav">
        <div class="step-status" :class="{ 'step-status--blocked': isCurrentStepBlocked }">
          <div class="step-status__meta">Passo {{ step }} de {{ lastStep }}</div>
          <div class="step-status__message">
            {{ currentStepBlockReason || 'Todos os campos obrigatórios deste passo estão preenchidos.' }}
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
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
              :disable="submitting || isCurrentStepBlocked"
              @click="next"
            />
            <q-btn
              v-else
              no-caps unelevated color="primary"
              :label="submitLabel"
              :loading="submitting"
              :disable="submitting"
              @click="onSubmit"
            />
          </div>
        </div>
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import {
  mozambicanPhone, nuit, email, bilheteIdentidade, mpesa, nib, ibanMz, inss,
  dateNotFuture, dateAfter,
} from 'src/utils/validators'
import AppIcon from 'src/components/ui/AppIcon.vue'
import EmployeeFormDocuments from 'src/components/employees/EmployeeFormDocuments.vue'
import { groupService } from 'src/services/group.service'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { salaryCategoryService } from 'src/services/salary-category.service'
import { jobTitleService } from 'src/services/employment.service'
import { contractTypeOptions, termedContractTypes } from 'src/config/employment'

const props = defineProps({
  mode: { type: String, default: 'create', validator: (v) => ['create', 'edit'].includes(v) },
  initial: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const toast = useToast()
const req = (v) => !!v || 'Obrigatório'
const emergencyContactMessage = 'O Contacto de Emergência é obrigatório para a segurança do colaborador.'
const reqEmergency = (v) => !!String(v || '').trim() || emergencyContactMessage

// Erros do backend mapeados por campo. Exposed for parent via defineExpose.
const { fieldErrors, globalErrors, setFromResponse, clear: clearErrors, clearField } = useFormErrors()

const step = ref(1)
const maxStepReached = ref(1)
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
  () => {
    form.support_unit = null
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
  { label: 'Administrativo', value: 'administrative' },
  { label: 'Operativo', value: 'operative' },
  { label: 'Técnico', value: 'technical' },
]

const groupOptions = ref([])
const clientOptions = ref([])
const postOptions = ref([])
const salaryCategoryOptions = ref([])
const loadingClients = ref(false)
const loadingPosts = ref(false)
const loadingSalary = ref(false)

// Cargos — lista gerida com texto livre permitido.
const allJobTitles = ref([])
const jobTitleFiltered = ref([])
function filterJobTitles(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    jobTitleFiltered.value = n
      ? allJobTitles.value.filter((t) => t.toLowerCase().includes(n))
      : allJobTitles.value
  })
}

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

  try {
    const titles = await jobTitleService.list()
    allJobTitles.value = titles.map((t) => t.name)
    jobTitleFiltered.value = allJobTitles.value
  } catch {
    /* ignore */
  }
})

const submitLabel = computed(() =>
  props.mode === 'create' ? 'Guardar (pendente)' : 'Guardar alterações',
)

function isBlank(v) {
  if (v === null || v === undefined) return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'string') return v.trim() === ''
  return false
}

function getStepBlockReason(stepNumber) {
  if (stepNumber === 1) {
    if (isBlank(form.full_name)) return 'Preencha o campo obrigatório: Nome completo.'
    if (isBlank(form.birth_date)) return 'Preencha o campo obrigatório: Data de nascimento.'
    if (isBlank(form.gender)) return 'Preencha o campo obrigatório: Género.'
    if (isBlank(form.document_type)) return 'Preencha o campo obrigatório: Tipo de documento.'
    if (isBlank(form.document_number)) return 'Preencha o campo obrigatório: Número do documento.'
    if (isBlank(form.phone)) return 'Preencha o campo obrigatório: Telefone.'
    if (isBlank(form.emergency_contact_name) || isBlank(form.emergency_contact_phone)) {
      return emergencyContactMessage
    }
    return ''
  }

  if (stepNumber === 2) {
    if (isBlank(form.department)) return 'Selecione a Área de Trabalho / Departamento.'
    if (isBlank(form.types)) return 'Selecione pelo menos um Tipo de função.'
    if (isBlank(form.hire_date)) return 'Preencha a Data de admissão.'
    return ''
  }

  if (stepNumber === 3) {
    if (form.create_account && isBlank(form.email)) {
      return 'E-mail é obrigatório quando criar conta de utilizador.'
    }
    return ''
  }

  if (stepNumber === 5) {
    if (isBlank(contract.contract_type)) return 'Selecione o Tipo de contrato.'
    if (isBlank(contract.job_title)) return 'Preencha o Cargo.'
    if (isBlank(contract.start_date)) return 'Preencha o Início do contrato.'
    if (contractNeedsEnd.value && isBlank(contract.end_date)) {
      return 'Preencha o Fim do contrato para o tipo selecionado.'
    }
    if (!contract.salary_category && isBlank(contract.base_salary)) {
      return 'Indique o Salário do contrato ou escolha uma Categoria salarial.'
    }
    return ''
  }

  return ''
}

const currentStepBlockReason = computed(() => getStepBlockReason(step.value))
const isCurrentStepBlocked = computed(() => Boolean(currentStepBlockReason.value))

async function validateStep(n) {
  const formRef = stepForms[n]?.value
  if (!formRef) return true // steps without a form (e.g. documents) always pass
  const ok = await formRef.validate()
  return ok !== false
}

async function next() {
  try {
    if (!(await validateStep(step.value))) {
      toast.warning('Há campos por preencher neste passo.')
      return
    }

    const targetStep = Math.min(lastStep.value, step.value + 1)
    maxStepReached.value = Math.max(maxStepReached.value, targetStep)

    // Use direct model update instead of `stepperRef.next()` because the
    // next step's `:disable` flag may still be true in the same tick.
    step.value = targetStep
  } catch {
    toast.error('Não foi possível avançar. Tente novamente.')
  }
}

function back() {
  step.value = Math.max(1, step.value - 1)
}

function isStepDisabled(n) {
  return n > maxStepReached.value
}

async function onSubmit() {
  // Avoid validating hidden q-forms inside the stepper on final submit. In
  // some browsers that can leave the final action waiting without ever
  // emitting the POST request.
  const stepsToCheck = props.mode === 'create' ? [1, 2, 3, 5] : [1, 2, 3]
  for (const n of stepsToCheck) {
    const reason = getStepBlockReason(n)
    if (reason) {
      maxStepReached.value = Math.max(maxStepReached.value, n)
      step.value = n
      toast.warning(reason)
      return
    }
  }

  if (!(await validateStep(step.value))) {
    toast.warning('Há campos por preencher. Reveja os campos destacados.')
    return
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

// Exposed para o parent injectar erros do backend após uma falha de API.
defineExpose({
  setFromResponse,
  clearErrors,
  clearField,
})
</script>

<style scoped>
.employee-stepper {
  background: transparent;
}

.employee-stepper-nav {
  position: sticky;
  bottom: 0;
  z-index: 6;
  margin-top: 0.75rem;
  border-top: 1px solid var(--border);
  background: color-mix(in oklab, var(--card) 92%, transparent);
  backdrop-filter: blur(4px);
  padding-top: 0.75rem;
}

.step-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid color-mix(in oklab, var(--pluse-emerald-500, #10b981) 28%, var(--border));
  border-radius: 0.625rem;
  padding: 0.55rem 0.7rem;
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 8%, var(--card));
}

.step-status--blocked {
  border-color: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 40%, var(--border));
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 10%, var(--card));
}

.step-status__meta {
  flex: none;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.step-status__message {
  flex: 1;
  min-width: 0;
  font-size: 0.82rem;
  line-height: 1.35;
  color: var(--foreground);
  text-align: right;
}

@media (max-width: 820px) {
  .step-status {
    flex-direction: column;
    align-items: flex-start;
  }

  .step-status__message {
    text-align: left;
  }
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
