<!--
  /employees/:id — colaborador detail page.

  Layout:
    - AdminPageTemplate hero (status + types + account chips on #meta;
      Approve/Inactivate/Edit on #actions)
    - "At-a-glance" cards: photo/avatar + key quick info (4 cards)
    - q-tabs inside a flat card via the #tabs slot
    - Content area: tab panels
        * Geral      — grouped sections of fields (Identificação / Contactos / Função / Bancário / Notas)
        * Documentos — grid of document cards with upload form on top
        * Histórico  — visual timeline (created → approved → updated)
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Colaboradores · ${employee?.employee_number || '…'}`"
    :title="employee?.full_name || 'Colaborador'"
    :description="employee?.role_title || 'Detalhes do colaborador'"
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

    <!-- Quick summary cards (above tabs) -->
    <template v-if="employee" #hero>
      <div class="summary-grid">
        <div class="summary-card summary-card--identity">
          <div class="summary-avatar">
            <img v-if="employee.photo" :src="absoluteFileUrl(employee.photo)" :alt="employee.full_name" />
            <span v-else>{{ initialsOf(employee.full_name) }}</span>
          </div>
          <div class="summary-card__body">
            <span class="summary-card__label">Identificação</span>
            <span class="summary-card__value">
              {{ documentTypeLabel(employee.document_type) }} · {{ employee.document_number }}
            </span>
            <span v-if="employee.nuit" class="summary-card__hint">NUIT {{ employee.nuit }}</span>
          </div>
        </div>

        <div class="summary-card">
          <span class="summary-card__icon">
            <AppIcon name="ki-phone" :size="18" />
          </span>
          <div class="summary-card__body">
            <span class="summary-card__label">Contacto</span>
            <span class="summary-card__value">{{ employee.phone || '—' }}</span>
            <span class="summary-card__hint">{{ employee.email || 'sem e-mail' }}</span>
          </div>
        </div>

        <div class="summary-card">
          <span class="summary-card__icon">
            <AppIcon name="ki-calendar" :size="18" />
          </span>
          <div class="summary-card__body">
            <span class="summary-card__label">Admissão</span>
            <span class="summary-card__value">{{ formatDate(employee.hire_date) }}</span>
            <span class="summary-card__hint">há {{ humanDuration(employee.hire_date) }}</span>
          </div>
        </div>

        <div class="summary-card">
          <span class="summary-card__icon">
            <AppIcon :name="employee.user ? 'ki-key' : 'ki-information-2'" :size="18" />
          </span>
          <div class="summary-card__body">
            <span class="summary-card__label">Conta de acesso</span>
            <span class="summary-card__value">
              {{ employee.user?.username || 'Sem conta' }}
            </span>
            <span class="summary-card__hint">
              {{
                employee.user
                  ? employee.user.is_active ? 'Activa' : 'Inactiva'
                  : 'Não foi criada na inscrição'
              }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Tabs -->
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
          <q-tab name="documents" no-caps icon="folder">
            <template #default>
              <div class="flex items-center gap-2">
                <span>Documentos</span>
                <span v-if="documents.length" class="tab-count">{{ documents.length }}</span>
              </div>
            </template>
          </q-tab>
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Identificação pessoal -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-profile-circle" :size="16" /></span>
              <span class="detail-section__title">Identificação pessoal</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Nome completo</span>
                <span class="field-row__value">{{ employee.full_name }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Data de nascimento</span>
                <span class="field-row__value">{{ formatDate(employee.birth_date) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Género</span>
                <span class="field-row__value">{{ genderLabel(employee.gender) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Nacionalidade</span>
                <span class="field-row__value">{{ employee.nationality || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Documento</span>
                <span class="field-row__value">
                  {{ documentTypeLabel(employee.document_type) }} · {{ employee.document_number }}
                </span>
              </div>
              <div class="field-row">
                <span class="field-row__label">NUIT</span>
                <span class="field-row__value">{{ employee.nuit || '—' }}</span>
              </div>
              <div class="field-row field-row--wide">
                <span class="field-row__label">Morada</span>
                <span class="field-row__value">{{ employee.address || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- Contactos -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-phone" :size="16" /></span>
              <span class="detail-section__title">Contactos</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Telefone</span>
                <span class="field-row__value">{{ employee.phone || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">E-mail</span>
                <span class="field-row__value">{{ employee.email || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Contacto de emergência</span>
                <span class="field-row__value">{{ employee.emergency_contact_name || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Telefone de emergência</span>
                <span class="field-row__value">{{ employee.emergency_contact_phone || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- Função e contrato -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-calendar-tick" :size="16" /></span>
              <span class="detail-section__title">Função e contrato</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Cargo</span>
                <span class="field-row__value">{{ employee.role_title || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Data de admissão</span>
                <span class="field-row__value">{{ formatDate(employee.hire_date) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Salário base</span>
                <span class="field-row__value">
                  {{ employee.base_salary ? `${employee.base_salary} MZN` : '—' }}
                </span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Estado</span>
                <span class="field-row__value">{{ employee.status_display }}</span>
              </div>
            </div>
          </section>

          <!-- Dados bancários -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-bank" :size="16" /></span>
              <span class="detail-section__title">Dados bancários</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">NIB</span>
                <span class="field-row__value">{{ employee.nib || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Banco</span>
                <span class="field-row__value">{{ employee.bank || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- Notas (only when present) -->
          <section v-if="employee.notes" class="detail-section lg:col-span-2">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
              <span class="detail-section__title">Notas</span>
            </header>
            <div class="detail-section__body">
              <p class="text-sm text-foreground whitespace-pre-line">{{ employee.notes }}</p>
            </div>
          </section>
        </div>
      </q-tab-panel>

      <!-- Documentos -->
      <q-tab-panel name="documents" class="p-0">
        <!-- Upload bar -->
        <q-card flat bordered class="pluse-card q-mb-md">
          <q-card-section>
            <AppHeading :level="3" class="text-sm font-semibold text-mono mb-3">
              Adicionar documento
            </AppHeading>
            <div class="flex flex-wrap items-end gap-3">
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
          </q-card-section>
        </q-card>

        <!-- Grid -->
        <div v-if="documents.length" class="documents-grid">
          <div v-for="doc in documents" :key="doc.id" class="doc-card">
            <div class="doc-card__head">
              <span class="doc-card__icon" :style="{ background: docPalette(doc.type).bg, color: docPalette(doc.type).fg }">
                <AppIcon :name="docPalette(doc.type).icon" :size="20" />
              </span>
              <q-btn flat round dense icon="more_vert" size="sm">
                <q-menu>
                  <q-list dense style="min-width: 160px">
                    <q-item
                      clickable
                      v-close-popup
                      :href="absoluteFileUrl(doc.file)"
                      target="_blank"
                      rel="noopener"
                    >
                      <q-item-section avatar><q-icon name="open_in_new" /></q-item-section>
                      <q-item-section>Abrir</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="deleteDocument(doc)">
                      <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div class="doc-card__body">
              <div class="doc-card__title">{{ doc.type_display }}</div>
              <div v-if="doc.issue_date || doc.expiry_date" class="doc-card__meta">
                <span v-if="doc.issue_date">
                  Emitido {{ formatDate(doc.issue_date) }}
                </span>
                <span v-if="doc.expiry_date" :class="isExpired(doc.expiry_date) ? 'text-destructive' : ''">
                  · Válido até {{ formatDate(doc.expiry_date) }}
                  <span v-if="isExpired(doc.expiry_date)">(expirado)</span>
                </span>
              </div>
            </div>
            <div class="doc-card__footer">
              <a
                :href="absoluteFileUrl(doc.file)"
                target="_blank"
                rel="noopener"
                class="doc-card__link"
              >
                <AppIcon name="ki-document" :size="14" />
                Ver ficheiro
              </a>
            </div>
          </div>
        </div>

        <AppEmptyState
          v-else-if="!loadingDocs"
          title="Sem documentos"
          description="Anexe BI, NUIT, registo criminal, certificados ou contratos. Pode também adicioná-los logo no momento do registo."
          icon="ki-document"
        />
      </q-tab-panel>

      <!-- Histórico -->
      <q-tab-panel name="history" class="p-0">
        <q-card flat bordered class="pluse-card">
          <q-card-section>
            <AppHeading :level="3" class="text-sm font-semibold text-mono mb-4">
              Linha do tempo
            </AppHeading>
            <ol class="timeline">
              <li class="timeline-item timeline-item--created">
                <span class="timeline-dot"><q-icon name="add_circle" size="14px" /></span>
                <div class="timeline-content">
                  <div class="timeline-title">Registo criado</div>
                  <div class="timeline-meta">{{ formatDateTime(employee.created_at) }}</div>
                </div>
              </li>
              <li
                v-if="employee.approved_at"
                class="timeline-item timeline-item--approved"
              >
                <span class="timeline-dot"><q-icon name="check_circle" size="14px" /></span>
                <div class="timeline-content">
                  <div class="timeline-title">Aprovado</div>
                  <div class="timeline-meta">{{ formatDateTime(employee.approved_at) }}</div>
                </div>
              </li>
              <li
                v-if="employee.updated_at && employee.updated_at !== employee.created_at"
                class="timeline-item timeline-item--updated"
              >
                <span class="timeline-dot"><q-icon name="edit" size="14px" /></span>
                <div class="timeline-content">
                  <div class="timeline-title">Última actualização</div>
                  <div class="timeline-meta">{{ formatDateTime(employee.updated_at) }}</div>
                </div>
              </li>
              <li
                v-if="employee.status === 'inactive'"
                class="timeline-item timeline-item--inactive"
              >
                <span class="timeline-dot"><q-icon name="block" size="14px" /></span>
                <div class="timeline-content">
                  <div class="timeline-title">Inactivado</div>
                  <div class="timeline-meta">{{ formatDateTime(employee.updated_at) }}</div>
                </div>
              </li>
            </ol>
            <q-banner rounded class="bg-blue-1 text-blue-9 q-mt-md">
              <template #avatar>
                <AppIcon name="ki-information-2" :size="18" icon-class="text-primary" />
              </template>
              O histórico detalhado de alterações (campo a campo, autor, data) virá no módulo de
              <strong>Auditoria</strong>.
            </q-banner>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { employeeService } from 'src/services/employee.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import { absoluteFileUrl } from 'src/utils/file-url'

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

function docPalette(type) {
  return ({
    id_card: { icon: 'ki-shield-tick', bg: 'color-mix(in oklab, var(--primary) 14%, transparent)', fg: 'var(--primary)' },
    passport: { icon: 'ki-route', bg: 'color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent)', fg: 'var(--pluse-cyan-500, #06b6d4)' },
    dire: { icon: 'ki-document', bg: 'color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent)', fg: 'var(--pluse-cyan-500, #06b6d4)' },
    nuit: { icon: 'ki-cheque', bg: 'color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent)', fg: 'var(--pluse-amber-500, #f59e0b)' },
    criminal_record: { icon: 'ki-shield', bg: 'color-mix(in oklab, var(--destructive) 12%, transparent)', fg: 'var(--destructive)' },
    certificate: { icon: 'ki-medal-star', bg: 'color-mix(in oklab, var(--pluse-emerald-500, #10b981) 14%, transparent)', fg: 'var(--pluse-emerald-500, #10b981)' },
    employment_contract: { icon: 'ki-document', bg: 'color-mix(in oklab, var(--primary) 14%, transparent)', fg: 'var(--primary)' },
    medical: { icon: 'ki-information-2', bg: 'color-mix(in oklab, var(--pluse-emerald-500, #10b981) 14%, transparent)', fg: 'var(--pluse-emerald-500, #10b981)' },
    other: { icon: 'ki-document', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
  })[type] || { icon: 'ki-document', bg: 'var(--muted)', fg: 'var(--muted-foreground)' }
}

function statusIcon(status) {
  return {
    active: 'check_circle',
    approved: 'check_circle',
    pending: 'schedule',
    inactive: 'block',
  }[status] || 'info'
}

function formatDate(s) {
  if (!s) return '—'
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
function isExpired(date) {
  if (!date) return false
  return new Date(date) < new Date()
}
function humanDuration(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const then = new Date(dateStr)
  const months =
    (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
  if (months < 1) return 'menos de 1 mês'
  if (months < 12) return `${months} mes${months === 1 ? '' : 'es'}`
  const years = Math.floor(months / 12)
  const remaining = months % 12
  if (remaining === 0) return `${years} ano${years === 1 ? '' : 's'}`
  return `${years}a ${remaining}m`
}
function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
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
.pluse-card { background: var(--card); }

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}

/* ── Summary cards ─────────────────────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.summary-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  color: white;
}
.summary-card__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.summary-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.summary-card__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
}
.summary-card__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  line-height: 1.3;
  word-break: break-word;
}
.summary-card__hint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
}
.summary-card--identity {
  align-items: center;
}
.summary-avatar {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in oklab, white 12%, transparent), color-mix(in oklab, white 4%, transparent));
  border: 1px solid rgba(255, 255, 255, 0.22);
  overflow: hidden;
  font-weight: 700;
  color: white;
}
.summary-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Tabs count badge ──────────────────────────────────────────────────── */
.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--primary) 16%, transparent);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
}

/* ── Detail sections (Geral) ───────────────────────────────────────────── */
.detail-section {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.detail-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 30%, transparent);
}
.detail-section__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.detail-section__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.detail-section__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  padding: 18px;
}
@media (max-width: 640px) {
  .detail-section__body {
    grid-template-columns: 1fr;
  }
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.field-row--wide {
  grid-column: 1 / -1;
}
.field-row__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.field-row__value {
  font-size: 0.9rem;
  color: var(--foreground);
  word-break: break-word;
}

/* ── Documents grid ────────────────────────────────────────────────────── */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.doc-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}
.doc-card:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
  transform: translateY(-1px);
  box-shadow: 0 8px 22px color-mix(in oklab, var(--pluse-navy-950, #07111f) 8%, transparent);
}
.doc-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-card__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.doc-card__title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--mono);
  line-height: 1.3;
}
.doc-card__meta {
  font-size: 0.76rem;
  color: var(--muted-foreground);
}
.doc-card__footer {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}
.doc-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.doc-card__link:hover {
  text-decoration: underline;
}

/* ── Timeline (Histórico) ──────────────────────────────────────────────── */
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}
.timeline::before {
  position: absolute;
  inset: 0 auto 0 16px;
  width: 2px;
  content: '';
  background: var(--border);
}
.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 0 0 16px 0;
}
.timeline-item:last-child {
  padding-bottom: 0;
}
.timeline-dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 50%;
  background: var(--card);
  border: 2px solid var(--border);
  color: var(--muted-foreground);
  z-index: 1;
}
.timeline-item--created .timeline-dot {
  border-color: var(--primary);
  color: var(--primary);
}
.timeline-item--approved .timeline-dot {
  border-color: var(--pluse-emerald-500, #10b981);
  color: var(--pluse-emerald-500, #10b981);
}
.timeline-item--updated .timeline-dot {
  border-color: var(--pluse-cyan-500, #06b6d4);
  color: var(--pluse-cyan-500, #06b6d4);
}
.timeline-item--inactive .timeline-dot {
  border-color: var(--destructive);
  color: var(--destructive);
}
.timeline-content {
  padding-top: 4px;
}
.timeline-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--foreground);
}
.timeline-meta {
  font-size: 0.78rem;
  color: var(--muted-foreground);
  margin-top: 2px;
}
</style>
