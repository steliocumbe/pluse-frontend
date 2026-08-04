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
    :description="employee?.current_job_title || 'Detalhes do colaborador'"
    :breadcrumb="[
      { label: 'Colaboradores', to: { name: 'employees-list' } },
      { label: employee?.full_name || 'Detalhe' },
    ]"
    :back-to="{ name: 'employees-list' }"
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
      <q-btn flat round dense icon="more_vert" size="sm">
        <q-menu>
          <q-list dense style="min-width: 180px">
            <q-item clickable v-close-popup @click="inactivate">
              <q-item-section avatar><q-icon name="block" color="negative" /></q-item-section>
              <q-item-section>Inactivar</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="deleteEmployee">
              <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
              <q-item-section>Apagar</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
          <q-tab name="contracts" no-caps icon="description" label="Contratos" />
          <q-tab name="documents" no-caps icon="folder">
            <template #default>
              <div class="flex items-center gap-2">
                <span>Documentos</span>
                <span v-if="documents.length" class="tab-count">{{ documents.length }}</span>
              </div>
            </template>
          </q-tab>
          <q-tab name="disciplinary" no-caps icon="gavel" label="Disciplina" />
          <q-tab name="transfers" no-caps icon="swap_horiz" label="Transferências" />
          <q-tab name="assets" no-caps icon="inventory_2" label="Ativos" />
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
                <span class="field-row__label">Validade do documento</span>
                <span class="field-row__value">{{ formatDate(employee.document_expiry) || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">NUIT</span>
                <span class="field-row__value">{{ employee.nuit || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Situação militar</span>
                <span class="field-row__value">{{ employee.military_status_display || '—' }}</span>
              </div>
              <div class="field-row field-row--wide">
                <span class="field-row__label">Morada</span>
                <span class="field-row__value">{{ employee.address || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- Departamento e posto -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-geolocation" :size="16" /></span>
              <span class="detail-section__title">Departamento e posto</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Departamento</span>
                <span class="field-row__value">{{ employee.department_display || '—' }}</span>
              </div>
              <div v-if="employee.department === 'operations'" class="field-row">
                <span class="field-row__label">Cliente</span>
                <span class="field-row__value">{{ employee.client_name || '—' }}</span>
              </div>
              <div v-if="employee.department === 'support'" class="field-row">
                <span class="field-row__label">Unidade de suporte</span>
                <span class="field-row__value">{{ employee.support_unit_display || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Posto</span>
                <span class="field-row__value">{{ employee.post_name || '—' }}</span>
              </div>
              <div class="field-row field-row--wide">
                <span class="field-row__label">Turno</span>
                <span class="field-row__value">{{ employee.shift || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- Família e contactos -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-people" :size="16" /></span>
              <span class="detail-section__title">Família e contactos</span>
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
                <span class="field-row__label">Pai</span>
                <span class="field-row__value">{{ pairOf(employee.father_name, employee.father_phone) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Mãe</span>
                <span class="field-row__value">{{ pairOf(employee.mother_name, employee.mother_phone) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Cônjuge</span>
                <span class="field-row__value">{{ pairOf(employee.spouse_name, employee.spouse_phone) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Emergência</span>
                <span class="field-row__value">
                  {{ pairOf(employee.emergency_contact_name, employee.emergency_contact_phone) }}
                </span>
              </div>
            </div>
          </section>

          <!-- Função e admissão -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-calendar-tick" :size="16" /></span>
              <span class="detail-section__title">Função e admissão</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Data de admissão</span>
                <span class="field-row__value">{{ formatDate(employee.hire_date) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Cargo actual</span>
                <span class="field-row__value">{{ employee.current_job_title || '—' }}</span>
              </div>
              <div class="field-row field-row--wide">
                <span class="field-row__label">Salário em vigor</span>
                <span class="field-row__value">
                  {{ employee.effective_salary ? `${employee.effective_salary} MZN` : '—' }}
                  <span class="field-hint">
                    Definido pelo contrato activo — ver separador <strong>Contratos</strong>.
                  </span>
                </span>
              </div>
            </div>
          </section>

          <!-- Banca e M-pesa -->
          <section class="detail-section">
            <header class="detail-section__head">
              <span class="detail-section__icon"><AppIcon name="ki-bank" :size="16" /></span>
              <span class="detail-section__title">Banca e M-pesa</span>
            </header>
            <div class="detail-section__body">
              <div class="field-row">
                <span class="field-row__label">Número INSS</span>
                <span class="field-row__value">{{ employee.inss_number || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">M-pesa</span>
                <span class="field-row__value">{{ pairOf(employee.mpesa_name, employee.mpesa_number) }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Banco</span>
                <span class="field-row__value">{{ employee.bank || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-row__label">Número de conta</span>
                <span class="field-row__value">{{ employee.bank_account_number || '—' }}</span>
              </div>
              <div class="field-row field-row--wide">
                <span class="field-row__label">NIB</span>
                <span class="field-row__value">{{ employee.nib || '—' }}</span>
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

      <!-- Contratos -->
      <q-tab-panel name="contracts" class="p-0">
        <EmployeeContractsTab :employee-id="employee.id" />
      </q-tab-panel>

      <!-- Documentos -->
      <q-tab-panel name="documents" class="p-0">
        <!-- Header: summary + add button -->
        <div class="docs-head">
          <div class="docs-head__info">
            <AppHeading :level="3" class="docs-head__title">Documentos do colaborador</AppHeading>
            <span class="docs-head__summary">
              {{ documents.length }} anexado{{ documents.length === 1 ? '' : 's' }}
              <template v-if="expiringCount">
                · <span class="docs-head__alert">{{ expiringCount }} a renovar</span>
              </template>
            </span>
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="add"
            label="Adicionar documentos"
            @click="openDocModal"
          />
        </div>

        <!-- Categorised list -->
        <div v-if="categoriesWithDocs.length" class="docs-categories">
          <section
            v-for="cat in categoriesWithDocs"
            :key="cat.key"
            class="doc-category"
          >
            <header class="doc-category__head">
              <span class="doc-category__icon"><AppIcon :name="cat.icon" :size="16" /></span>
              <span class="doc-category__title">{{ cat.label }}</span>
              <span class="doc-category__count">{{ cat.docs.length }} / {{ cat.types.length }}</span>
            </header>
            <div class="documents-grid">
              <div v-for="doc in cat.docs" :key="doc.id" class="doc-card">
                <div class="doc-card__head">
                  <span class="doc-card__icon">
                    <AppIcon :name="cat.icon" :size="18" />
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
                  <div class="doc-card__title">{{ documentTypeLabel(doc.type) }}</div>
                  <div v-if="doc.title" class="doc-card__subtitle">{{ doc.title }}</div>
                  <div v-if="doc.issue_date || doc.expiry_date" class="doc-card__meta">
                    <span v-if="doc.issue_date">Emitido {{ formatDate(doc.issue_date) }}</span>
                    <span v-if="doc.expiry_date">
                      {{ doc.issue_date ? ' · ' : '' }}Validade {{ formatDate(doc.expiry_date) }}
                    </span>
                  </div>
                  <span
                    class="doc-badge"
                    :class="`doc-badge--${expiryStatus(doc).tone}`"
                  >
                    <q-icon :name="expiryStatus(doc).icon" size="12px" />
                    {{ expiryStatus(doc).label }}
                  </span>
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
          </section>
        </div>

        <AppEmptyState
          v-else-if="!loadingDocs"
          title="Sem documentos"
          description="Anexe BI, NUIT, registo criminal, certificados ou contratos. Pode também adicioná-los logo no momento do registo."
          icon="ki-document"
        />
      </q-tab-panel>

      <!-- Disciplina -->
      <q-tab-panel name="disciplinary" class="p-0">
        <EmployeeDisciplinaryTab :employee-id="employee.id" />
      </q-tab-panel>

      <!-- Transferências -->
      <q-tab-panel name="transfers" class="p-0">
        <EmployeeTransfersTab :employee-id="employee.id" @changed="reloadEmployee" />
      </q-tab-panel>

      <!-- Ativos -->
      <q-tab-panel name="assets" class="p-0">
        <EmployeeAssetsTab :employee-id="employee.id" />
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

    <!-- Batch document upload modal -->
    <AppModal v-model="showDocModal" size="xl" persistent>
      <div class="p-5">
        <div class="flex items-center gap-3 mb-4">
          <span class="doc-modal__icon"><AppIcon name="ki-document" :size="20" /></span>
          <div>
            <AppHeading :level="3" class="text-base font-semibold text-mono">
              Adicionar documentos
            </AppHeading>
            <p class="text-xs text-muted-foreground m-0">
              Anexe vários documentos de uma só vez — todos serão carregados em conjunto.
            </p>
          </div>
        </div>
        <EmployeeFormDocuments v-model="pendingDocs" />
        <div class="flex justify-end gap-2 mt-5">
          <q-btn flat no-caps label="Cancelar" :disable="uploading" @click="showDocModal = false" />
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="cloud_upload"
            label="Carregar todos"
            :loading="uploading"
            :disable="!pendingDocs.length"
            @click="uploadAll"
          />
        </div>
      </div>
    </AppModal>

    <ModernAlert
      v-model="confirmState.open"
      :tone="confirmState.mode === 'delete' ? 'negative' : confirmState.mode === 'approve' ? 'positive' : 'warning'"
      :title="confirmState.mode === 'delete' ? 'Apagar colaborador' : confirmState.mode === 'approve' ? 'Aprovar colaborador' : 'Inactivar colaborador'"
      :message="employee
        ? (confirmState.mode === 'delete'
          ? `Apagar <b>${employee.full_name}</b>? Esta acção remove o registo da lista.`
          : confirmState.mode === 'approve'
            ? `Aprovar <b>${employee.full_name}</b>?`
            : `Inactivar <b>${employee.full_name}</b>?`)
        : ''"
      :confirm-label="confirmState.mode === 'delete' ? 'Apagar' : confirmState.mode === 'approve' ? 'Aprovar' : 'Inactivar'"
      :confirm-icon="confirmState.mode === 'delete' ? 'delete' : confirmState.mode === 'approve' ? 'check_circle' : 'block'"
      :confirm-tone="confirmState.mode === 'delete' ? 'negative' : confirmState.mode === 'approve' ? 'positive' : 'negative'"
      @confirm="runConfirmAction"
      @cancel="confirmState.open = false"
    />

    <ModernAlert
      v-model="deleteDocState.open"
      tone="negative"
      title="Eliminar documento"
      :message="deleteDocState.doc
        ? `Eliminar <b>${documentTypeLabel(deleteDocState.doc.type)}</b>?`
        : ''"
      confirm-label="Eliminar"
      confirm-icon="delete"
      confirm-tone="negative"
      @confirm="runDeleteDocument"
      @cancel="deleteDocState.open = false"
    />
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeesStore } from 'src/stores/employees'
import { employeeService } from 'src/services/employee.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import ModernAlert from 'src/components/ui/ModernAlert.vue'
import EmployeeFormDocuments from 'src/components/employees/EmployeeFormDocuments.vue'
import EmployeeContractsTab from 'src/components/employment/EmployeeContractsTab.vue'
import EmployeeDisciplinaryTab from 'src/components/employment/EmployeeDisciplinaryTab.vue'
import EmployeeTransfersTab from 'src/components/employment/EmployeeTransfersTab.vue'
import EmployeeAssetsTab from 'src/components/employees/EmployeeAssetsTab.vue'
import { absoluteFileUrl } from 'src/utils/file-url'
import { documentCategories, documentTypeMap, documentTypeLabel } from 'src/config/document-types'

const route = useRoute()
const router = useRouter()
const store = useEmployeesStore()
const toast = useToast()

const employee = computed(() => store.current)

// Tab activa — lê `?tab=` da URL no init e sincroniza ao mudar
const VALID_TABS = ['general', 'contracts', 'documents', 'disciplinary', 'transfers', 'assets', 'history']
const tab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'general')

watch(tab, (next) => {
  if (next === (route.query.tab || 'general')) return
  router.replace({ query: { ...route.query, tab: next === 'general' ? undefined : next } })
})

const documents = ref([])
const loadingDocs = ref(false)
const uploading = ref(false)
const showDocModal = ref(false)
const pendingDocs = ref([])
const confirmState = ref({ open: false, mode: 'inactivate' })
const deleteDocState = ref({ open: false, doc: null })

/* Documents grouped by their config category — empty categories are hidden. */
const categoriesWithDocs = computed(() =>
  documentCategories
    .map((cat) => ({
      ...cat,
      docs: documents.value.filter(
        (d) => (documentTypeMap[d.type]?.categoryKey || 'other') === cat.key,
      ),
    }))
    .filter((cat) => cat.docs.length),
)

/* Validity badge for a document. */
function expiryStatus(doc) {
  if (!doc.expiry_date) {
    return { tone: 'neutral', icon: 'remove', label: 'Sem validade' }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((new Date(doc.expiry_date) - today) / 86400000)
  if (days < 0) return { tone: 'negative', icon: 'error', label: 'Expirado' }
  if (days === 0) return { tone: 'warning', icon: 'schedule', label: 'Expira hoje' }
  if (days <= 30) {
    return { tone: 'warning', icon: 'schedule', label: `Expira em ${days} dia${days === 1 ? '' : 's'}` }
  }
  return { tone: 'positive', icon: 'check_circle', label: 'Válido' }
}

/* Count of documents that are expired or expiring within 30 days. */
const expiringCount = computed(
  () => documents.value.filter((d) => ['warning', 'negative'].includes(expiryStatus(d).tone)).length,
)

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
/* Joins a name + phone pair into "Nome · +258..." — "—" when both empty. */
function pairOf(name, phone) {
  const parts = [name, phone].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
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
  confirmState.value = { open: true, mode: 'approve' }
}

async function inactivate() {
  confirmState.value = { open: true, mode: 'inactivate' }
}

function deleteEmployee() {
  confirmState.value = { open: true, mode: 'delete' }
}

async function runConfirmAction() {
  const mode = confirmState.value.mode
  confirmState.value.open = false

  try {
    if (mode === 'approve') {
      await store.approve(employee.value.id)
      toast.success('Aprovado.')
      return
    }
    if (mode === 'delete') {
      await store.remove(employee.value.id)
      toast.success('Colaborador apagado.')
      await router.push('/employees')
      return
    }
    await store.inactivate(employee.value.id)
    toast.success('Inactivado.')
  } catch (err) {
    toast.error('Não foi possível concluir a acção.', { caption: err?.response?.data?.detail })
  }
}

/* Re-fetch the employee — used after a transfer is approved (placement changes). */
async function reloadEmployee() {
  try {
    await store.fetchOne(route.params.id)
  } catch { /* ignore */ }
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

function openDocModal() {
  pendingDocs.value = []
  showDocModal.value = true
}

/* Uploads every complete row in the modal, one request per document. */
async function uploadAll() {
  const rows = pendingDocs.value.filter((d) => d.type && d.file)
  if (!rows.length) {
    toast.error('Adicione pelo menos um documento com tipo e ficheiro.')
    return
  }
  uploading.value = true
  let done = 0
  try {
    for (const d of rows) {
      const fd = new FormData()
      fd.append('type', d.type)
      fd.append('file', d.file)
      if (d.title) fd.append('title', d.title)
      if (d.issue_date) fd.append('issue_date', d.issue_date)
      if (d.expiry_date) fd.append('expiry_date', d.expiry_date)
      await employeeService.uploadDocument(employee.value.id, fd)
      done++
    }
    toast.success(`${done} documento${done === 1 ? '' : 's'} adicionado${done === 1 ? '' : 's'}.`)
    showDocModal.value = false
    pendingDocs.value = []
    await fetchDocuments()
  } catch (err) {
    toast.error(
      done ? `${done} enviado(s), mas houve uma falha.` : 'Não foi possível enviar.',
      { caption: err?.response?.data?.detail },
    )
    if (done) await fetchDocuments()
  } finally {
    uploading.value = false
  }
}

async function deleteDocument(doc) {
  deleteDocState.value = { open: true, doc }
}

async function runDeleteDocument() {
  const doc = deleteDocState.value.doc
  deleteDocState.value.open = false
  if (!doc) return

  try {
    await employeeService.deleteDocument(employee.value.id, doc.id)
    toast.success('Documento eliminado.')
    await fetchDocuments()
  } catch (err) {
    toast.error('Não foi possível eliminar.', { caption: err?.response?.data?.detail })
  }
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
.field-hint {
  display: block;
  margin-top: 2px;
  font-size: 0.74rem;
  color: var(--muted-foreground);
}

/* ── Documents — header ────────────────────────────────────────────────── */
.docs-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}
.docs-head__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.docs-head__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mono);
}
.docs-head__summary {
  font-size: 0.82rem;
  color: var(--muted-foreground);
}
.docs-head__alert {
  font-weight: 700;
  color: var(--pluse-amber-500, #f59e0b);
}

/* ── Documents — categories ────────────────────────────────────────────── */
.docs-categories {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.doc-category__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.doc-category__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.doc-category__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
}
.doc-category__count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
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
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.doc-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.doc-card__title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--mono);
  line-height: 1.3;
}
.doc-card__subtitle {
  font-size: 0.8rem;
  color: var(--foreground);
}
.doc-card__meta {
  font-size: 0.76rem;
  color: var(--muted-foreground);
}

/* ── Validity badge ────────────────────────────────────────────────────── */
.doc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 2px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}
.doc-badge--positive {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 16%, transparent);
  color: var(--pluse-emerald-600, #059669);
}
.doc-badge--warning {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 20%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.doc-badge--negative {
  background: color-mix(in oklab, var(--destructive) 16%, transparent);
  color: var(--destructive);
}
.doc-badge--neutral {
  background: var(--muted);
  color: var(--muted-foreground);
}

/* ── Document upload modal ─────────────────────────────────────────────── */
.doc-modal__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
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
