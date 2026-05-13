<!--
  EmployeeForm — shared form for creating and editing colaboradores.

  Sections (collapsible via AppFormSection):
    1. Dados pessoais
    2. Contactos
    3. Função e contrato
    4. Dados bancários (opcional, collapsed by default)
    5. Acesso à plataforma (only in create mode)

  Emits `submit` with the full payload. The parent page handles the API call,
  so this component stays presentational/validation-focused.

  Built on Quasar primitives (q-input, q-select, q-checkbox, q-form) because
  they already handle validation rules, dense mode, dark mode and a11y.
-->
<template>
  <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <AppFormSection title="Dados pessoais" step="1">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <q-input
          v-model="form.full_name"
          label="Nome completo *"
          outlined
          dense
          :rules="[(v) => !!v || 'Obrigatório']"
          class="md:col-span-2"
        />
        <q-input
          v-model="form.birth_date"
          label="Data de nascimento *"
          type="date"
          outlined
          dense
          stack-label
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-select
          v-model="form.gender"
          :options="genderOptions"
          label="Género *"
          outlined
          dense
          emit-value
          map-options
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-select
          v-model="form.document_type"
          :options="documentTypeOptions"
          label="Tipo de documento *"
          outlined
          dense
          emit-value
          map-options
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-input
          v-model="form.document_number"
          label="Número do documento *"
          outlined
          dense
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-input
          v-model="form.nuit"
          label="NUIT"
          outlined
          dense
          hint="Número Único de Identificação Tributária (opcional)"
          :rules="[
            (v) => !v || /^\d{9}$/.test(v) || 'NUIT deve ter 9 dígitos',
          ]"
        />
        <q-input
          v-model="form.nationality"
          label="Nacionalidade"
          outlined
          dense
        />
        <q-input
          v-model="form.address"
          label="Morada"
          type="textarea"
          outlined
          dense
          autogrow
          class="md:col-span-2"
        />
      </div>
    </AppFormSection>

    <AppFormSection title="Contactos" step="2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <q-input
          v-model="form.phone"
          label="Telefone *"
          outlined
          dense
          inputmode="tel"
          hint="9 dígitos, com ou sem +258"
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-input
          v-model="form.email"
          label="E-mail"
          type="email"
          outlined
          dense
          inputmode="email"
          autocomplete="off"
          :hint="form.create_account ? 'Será o utilizador da conta de acesso' : ''"
          :rules="[
            (v) => !form.create_account || !!v || 'Obrigatório para criar conta',
          ]"
        />
        <q-input
          v-model="form.emergency_contact_name"
          label="Nome do contacto de emergência"
          outlined
          dense
        />
        <q-input
          v-model="form.emergency_contact_phone"
          label="Telefone de emergência"
          outlined
          dense
          inputmode="tel"
        />
      </div>
    </AppFormSection>

    <AppFormSection title="Função e contrato" step="3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <q-select
          v-model="form.types"
          :options="groupOptions"
          label="Tipos de função *"
          outlined
          dense
          multiple
          use-chips
          emit-value
          map-options
          options-dense
          class="md:col-span-2"
          hint="Pode acumular várias funções (ex: Vigilante + Supervisor)"
          :rules="[(v) => (Array.isArray(v) && v.length > 0) || 'Selecione pelo menos um tipo']"
        />
        <q-input
          v-model="form.role_title"
          label="Cargo"
          outlined
          dense
          hint="Texto livre (ex: Vigilante Senior)"
        />
        <q-input
          v-model="form.hire_date"
          label="Data de admissão *"
          type="date"
          outlined
          dense
          stack-label
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-input
          v-model="form.base_salary"
          label="Salário base"
          type="number"
          outlined
          dense
          step="0.01"
          hint="Em MZN. Visível apenas a Admin/RH/Financeiro."
        />
      </div>
    </AppFormSection>

    <AppFormSection title="Dados bancários" step="4" :default-expanded="false">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <q-input v-model="form.nib" label="NIB" outlined dense />
        <q-input v-model="form.bank" label="Banco" outlined dense />
      </div>
    </AppFormSection>

    <AppFormSection
      v-if="mode === 'create'"
      title="Acesso à plataforma"
      step="5"
      description="Crie a conta de acesso já — fica inactiva até à aprovação do colaborador."
    >
      <q-checkbox
        v-model="form.create_account"
        label="Criar conta de utilizador para este colaborador"
      />
      <q-banner
        v-if="form.create_account"
        class="bg-blue-1 text-blue-9 q-mt-sm"
        rounded
      >
        <template #avatar>
          <AppIcon name="ki-information-2" :size="18" icon-class="text-primary" />
        </template>
        Será gerada uma palavra-passe temporária e mostrada uma única vez após guardar.
        Pode entregá-la ao colaborador por SMS ou e-mail.
      </q-banner>
    </AppFormSection>

    <div class="flex flex-wrap items-center justify-end gap-2 pt-2">
      <q-btn label="Cancelar" flat no-caps :disable="submitting" @click="$emit('cancel')" />
      <q-btn
        type="submit"
        :label="submitLabel"
        color="primary"
        unelevated
        no-caps
        :loading="submitting"
      />
    </div>
  </q-form>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppFormSection from 'src/components/ui/AppFormSection.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { groupService } from 'src/services/group.service'

const props = defineProps({
  mode: { type: String, default: 'create', validator: (v) => ['create', 'edit'].includes(v) },
  initial: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)

const blank = {
  full_name: '',
  birth_date: '',
  gender: '',
  document_type: '',
  document_number: '',
  nuit: '',
  nationality: 'Moçambicana',
  address: '',
  phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  email: '',
  nib: '',
  bank: '',
  types: [],
  role_title: '',
  hire_date: '',
  base_salary: '',
  create_account: false,
}

const form = reactive({ ...blank })

watch(
  () => props.initial,
  (val) => {
    Object.assign(form, blank, val || {})
    // The backend serialises types as [{id, name}, ...] — normalise to ids.
    if (Array.isArray(form.types) && form.types.length && typeof form.types[0] === 'object') {
      form.types = form.types.map((t) => t.id)
    }
  },
  { immediate: true, deep: true },
)

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

const groupOptions = ref([])
onMounted(async () => {
  try {
    const groups = await groupService.list()
    groupOptions.value = groups.map((g) => ({ label: g.name, value: g.id }))
  } catch {
    // Toast handled by axios interceptor (when wired); fail silent here.
  }
})

const submitLabel = computed(() =>
  props.mode === 'create' ? 'Guardar (pendente)' : 'Guardar alterações',
)

async function onSubmit() {
  const ok = await formRef.value?.validate?.()
  if (ok === false) return

  // Strip empty optional strings so the backend treats them as null.
  const payload = {}
  for (const [k, v] of Object.entries(form)) {
    if (v === '' || v === null || v === undefined) continue
    payload[k] = v
  }
  // base_salary must be a string per DRF DecimalField (or omit if empty).
  if (payload.base_salary !== undefined) {
    payload.base_salary = String(payload.base_salary)
  }
  emit('submit', payload)
}
</script>
