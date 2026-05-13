<!--
  /employees/:id — colaborador detail using AdminPageTemplate.

  Hero meta slot shows status + types + employee_number.
  Tabs slot houses q-tabs; content slot holds q-tab-panels.
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Colaboradores · ${employee?.employee_number || '…'}`"
    :title="employee?.full_name || 'Colaborador'"
    :description="employee?.role_title || ''"
  >
    <template #meta>
      <span v-if="employee" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="statusIcon(employee.status)" size="14px" />
        {{ employee.status_display }}
      </span>
      <span v-for="t in employee?.types || []" :key="t.id" class="admin-meta-chip">
        <AppIcon name="ki-people" :size="13" />
        {{ t.name }}
      </span>
      <span v-if="employee?.user" class="admin-meta-chip">
        <AppIcon name="ki-key" :size="13" />
        {{ employee.user.username }} ·
        {{ employee.user.is_active ? 'conta activa' : 'conta inactiva' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        outline
        no-caps
        class="admin-hero-button"
        icon="arrow_back"
        :to="{ name: 'employees-list' }"
        label="Voltar"
      />
      <q-btn
        v-if="employee && employee.status === 'pending'"
        unelevated
        no-caps
        class="admin-hero-primary"
        icon="check_circle"
        label="Aprovar"
        @click="approve"
      />
      <q-btn
        v-if="employee && employee.status === 'active'"
        outline
        no-caps
        class="admin-hero-button"
        icon="block"
        label="Inactivar"
        @click="inactivate"
      />
      <q-btn
        v-if="employee"
        unelevated
        no-caps
        class="admin-hero-primary"
        icon="edit"
        label="Editar"
        :to="`/employees/${employee.id}/edit`"
      />
    </template>

    <template v-if="employee" #tabs>
      <q-card flat bordered class="pluse-card">
        <q-tabs
          v-model="tab"
          dense
          align="left"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          inline-label
        >
          <q-tab name="general" no-caps icon="info" label="Geral" />
          <q-tab name="documents" no-caps icon="folder" label="Documentos" />
          <q-tab name="history" no-caps icon="history" label="Histórico" />
        </q-tabs>
      </q-card>
    </template>

    <div v-if="!employee" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <q-tab-panels
      v-else
      v-model="tab"
      animated
      class="bg-transparent"
    >
      <!-- Geral -->
      <q-tab-panel name="general" class="p-0">
        <q-card flat bordered class="pluse-card">
          <q-card-section>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Nome completo" :value="employee.full_name" />
              <Field label="Data de nascimento" :value="formatDate(employee.birth_date)" />
              <Field label="Género" :value="genderLabel(employee.gender)" />
              <Field label="Nacionalidade" :value="employee.nationality" />
              <Field
                label="Documento"
                :value="`${documentTypeLabel(employee.document_type)} · ${employee.document_number}`"
              />
              <Field label="NUIT" :value="employee.nuit || '—'" />
              <Field label="Telefone" :value="employee.phone" />
              <Field label="E-mail" :value="employee.email || '—'" />
              <Field label="Contacto de emergência" :value="formatEmergencyContact(employee)" />
              <Field label="Cargo" :value="employee.role_title || '—'" />
              <Field label="Data de admissão" :value="formatDate(employee.hire_date)" />
              <Field label="Salário base" :value="employee.base_salary ? `${employee.base_salary} MZN` : '—'" />
              <Field label="NIB" :value="employee.nib || '—'" />
              <Field label="Banco" :value="employee.bank || '—'" />
              <Field
                label="Morada"
                :value="employee.address || '—'"
                class="md:col-span-2"
              />
              <Field
                v-if="employee.notes"
                label="Notas"
                :value="employee.notes"
                class="md:col-span-2"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Documentos -->
      <q-tab-panel name="documents" class="p-0">
        <q-card flat bordered class="pluse-card">
          <q-card-section>
            <div class="flex flex-wrap items-end gap-3 mb-4">
              <q-select
                v-model="newDoc.type"
                :options="docTypeOptions"
                label="Tipo *"
                outlined
                dense
                emit-value
                map-options
                style="min-width: 220px"
              />
              <q-input
                v-model="newDoc.issue_date"
                label="Data de emissão"
                type="date"
                outlined
                dense
                stack-label
              />
              <q-input
                v-model="newDoc.expiry_date"
                label="Validade"
                type="date"
                outlined
                dense
                stack-label
              />
              <q-file
                v-model="newDoc.file"
                label="Ficheiro *"
                outlined
                dense
                class="grow"
                max-file-size="10485760"
                accept=".pdf,.jpg,.jpeg,.png"
              >
                <template #prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="cloud_upload"
                label="Adicionar"
                :loading="uploading"
                :disable="!newDoc.type || !newDoc.file"
                @click="uploadDocument"
              />
            </div>

            <q-list v-if="documents.length" separator>
              <q-item v-for="doc in documents" :key="doc.id" class="rounded">
                <q-item-section avatar>
                  <q-icon name="description" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.type_display }}</q-item-label>
                  <q-item-label caption>
                    <template v-if="doc.issue_date">Emitido em {{ formatDate(doc.issue_date) }}</template>
                    <template v-if="doc.expiry_date"> · Válido até {{ formatDate(doc.expiry_date) }}</template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="flex gap-1">
                    <q-btn
                      flat
                      round
                      dense
                      icon="open_in_new"
                      size="sm"
                      :href="doc.file"
                      target="_blank"
                      rel="noopener"
                      title="Abrir"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      size="sm"
                      color="negative"
                      title="Eliminar"
                      @click="deleteDocument(doc)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <AppEmptyState
              v-else-if="!loadingDocs"
              title="Sem documentos"
              description="Adicione BI, NUIT, registo criminal, certificados ou contrato de trabalho."
              icon="ki-document"
            />
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Histórico -->
      <q-tab-panel name="history" class="p-0">
        <q-card flat bordered class="pluse-card">
          <q-card-section>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Criado em" :value="formatDateTime(employee.created_at)" />
              <Field label="Última actualização" :value="formatDateTime(employee.updated_at)" />
              <Field label="Aprovado em" :value="formatDateTime(employee.approved_at) || '—'" />
            </div>
            <div class="mt-4 text-xs text-muted-foreground">
              O histórico completo de alterações ficará disponível assim que o módulo de
              Auditoria estiver implementado.
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { employeeService } from 'src/services/employee.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

// Inline read-only field component (kept inline to avoid a separate file
// for a single-purpose render). Uses div+role for headings/labels because
// Quasar's typography reset hits <hN>.
const Field = (props) =>
  h('div', { class: 'flex flex-col gap-0.5' }, [
    h('span', { class: 'text-xs text-muted-foreground uppercase tracking-wider' }, props.label),
    h('span', { class: 'text-sm text-foreground break-words' }, props.value || '—'),
  ])
Field.props = ['label', 'value']

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useEmployeesStore()
const toast = useToast()

const employee = computed(() => store.current)
const tab = ref('general')

const documents = ref([])
const loadingDocs = ref(false)
const uploading = ref(false)
const newDoc = reactive({ type: '', issue_date: '', expiry_date: '', file: null })

const docTypeOptions = [
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

function statusIcon(status) {
  return {
    active: 'check_circle',
    approved: 'check_circle',
    pending: 'schedule',
    inactive: 'block',
  }[status] || 'info'
}

function formatDate(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function formatDateTime(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString('pt-PT') } catch { return s }
}
function genderLabel(g) {
  return { male: 'Masculino', female: 'Feminino', other: 'Outro' }[g] || '—'
}
function documentTypeLabel(t) {
  return { id_card: 'BI', passport: 'Passaporte', dire: 'DIRE' }[t] || t
}
function formatEmergencyContact(e) {
  if (!e.emergency_contact_name && !e.emergency_contact_phone) return '—'
  return [e.emergency_contact_name, e.emergency_contact_phone].filter(Boolean).join(' · ')
}

async function approve() {
  $q.dialog({
    title: 'Aprovar colaborador',
    message: `Aprovar <b>${employee.value.full_name}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await store.approve(employee.value.id)
      toast.success('Aprovado.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function inactivate() {
  $q.dialog({
    title: 'Inactivar colaborador',
    message: `Inactivar <b>${employee.value.full_name}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Inactivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await store.inactivate(employee.value.id)
      toast.success('Inactivado.')
    } catch (err) {
      toast.error('Não foi possível inactivar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function fetchDocuments() {
  if (!employee.value) return
  loadingDocs.value = true
  try {
    documents.value = await employeeService.listDocuments(employee.value.id)
  } finally {
    loadingDocs.value = false
  }
}

async function uploadDocument() {
  if (!newDoc.type || !newDoc.file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('type', newDoc.type)
    fd.append('file', newDoc.file)
    if (newDoc.issue_date) fd.append('issue_date', newDoc.issue_date)
    if (newDoc.expiry_date) fd.append('expiry_date', newDoc.expiry_date)
    await employeeService.uploadDocument(employee.value.id, fd)
    toast.success('Documento adicionado.')
    Object.assign(newDoc, { type: '', issue_date: '', expiry_date: '', file: null })
    await fetchDocuments()
  } catch (err) {
    toast.error('Não foi possível enviar.', { caption: err?.response?.data?.detail })
  } finally {
    uploading.value = false
  }
}

async function deleteDocument(doc) {
  $q.dialog({
    title: 'Eliminar documento',
    message: `Tem a certeza?`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await employeeService.deleteDocument(employee.value.id, doc.id)
      toast.success('Documento eliminado.')
      await fetchDocuments()
    } catch (err) {
      toast.error('Não foi possível eliminar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  try {
    await store.fetchOne(route.params.id)
    await fetchDocuments()
  } catch {
    toast.error('Colaborador não encontrado.')
    router.push('/employees')
  }
})
</script>

<style scoped>
.pluse-card {
  background: var(--card);
}
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
</style>
