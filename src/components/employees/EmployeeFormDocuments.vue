<!--
  Inline documents section used inside EmployeeForm during creation.
  Allows the user to attach several documents (BI, NUIT, registo criminal, etc.)
  in the same form submission. Each row is independent — remove/add freely.

  The parent reads `modelValue` (an array) and sends it alongside the employee
  payload; the backend then creates everything atomically in one transaction.
-->
<template>
  <div class="flex flex-col gap-3">
    <div v-if="!docs.length" class="empty-docs">
      <AppIcon name="ki-document" :size="22" icon-class="text-muted-foreground" />
      <span class="text-sm text-muted-foreground">
        Adicione documentos do colaborador agora ou mais tarde na página de detalhe.
      </span>
    </div>

    <q-card
      v-for="(doc, index) in docs"
      :key="doc._localId"
      flat
      bordered
      class="doc-row"
    >
      <q-card-section class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <q-select
          v-model="doc.type"
          :options="typeOptions"
          label="Tipo *"
          outlined
          dense
          emit-value
          map-options
          :rules="[(v) => !!v || 'Obrigatório']"
        />
        <q-file
          v-model="doc.file"
          label="Ficheiro *"
          outlined
          dense
          max-file-size="10485760"
          accept=".pdf,.jpg,.jpeg,.png"
          :rules="[(v) => !!v || 'Obrigatório']"
        >
          <template #prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <q-input
          v-model="doc.issue_date"
          label="Data de emissão"
          type="date"
          outlined
          dense
          stack-label
        />
        <q-input
          v-model="doc.expiry_date"
          label="Validade"
          type="date"
          outlined
          dense
          stack-label
        />
      </q-card-section>
      <q-card-actions align="right" class="pt-0">
        <q-btn
          flat
          no-caps
          color="negative"
          icon="delete"
          label="Remover"
          @click="removeAt(index)"
        />
      </q-card-actions>
    </q-card>

    <div>
      <q-btn
        outline
        no-caps
        color="primary"
        icon="add"
        label="Adicionar documento"
        @click="addRow"
      />
      <span class="ms-3 text-xs text-muted-foreground">
        PDF, JPG ou PNG · até 10 MB cada
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const typeOptions = [
  { label: 'Bilhete de Identidade', value: 'id_card' },
  { label: 'Passaporte', value: 'passport' },
  { label: 'DIRE', value: 'dire' },
  { label: 'NUIT', value: 'nuit' },
  { label: 'Registo Criminal', value: 'criminal_record' },
  { label: 'Certificado', value: 'certificate' },
  { label: 'Contrato de trabalho', value: 'employment_contract' },
  { label: 'Atestado médico', value: 'medical' },
  { label: 'Outro', value: 'other' },
]

let counter = 0
const newRow = () => ({
  _localId: ++counter,
  type: '',
  file: null,
  issue_date: '',
  expiry_date: '',
})

const docs = ref(
  (props.modelValue || []).map((d) => ({ _localId: ++counter, ...d })),
)

function addRow() {
  docs.value.push(newRow())
}
function removeAt(i) {
  docs.value.splice(i, 1)
}

watch(
  docs,
  (val) => emit('update:modelValue', val),
  { deep: true },
)
</script>

<style scoped>
.empty-docs {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border: 1px dashed var(--input);
  border-radius: 0.625rem;
  background: color-mix(in oklab, var(--muted) 50%, transparent);
}
.doc-row {
  background: color-mix(in oklab, var(--background) 88%, var(--muted));
}
</style>
