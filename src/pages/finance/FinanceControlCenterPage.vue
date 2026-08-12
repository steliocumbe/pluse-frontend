<template>
  <AdminPageTemplate
    eyebrow="Contabilidade e Finanças"
    title="Centro financeiro"
    description="Controlo de rentabilidade, saídas, contas a pagar, comunicações e relatórios."
  >
    <template #actions>
      <q-btn
        v-if="tab === 'requisitions'"
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Nova requisição"
        @click="openRequisitionModal"
      />
      <q-btn
        v-else-if="tab === 'debts'"
        unelevated
        no-caps
        color="primary"
        icon="add"
        label="Nova dívida"
        @click="openDebtModal"
      />
      <q-btn
        v-else-if="tab === 'overview' || tab === 'reports'"
        outline
        no-caps
        color="primary"
        icon="picture_as_pdf"
        label="Exportar livro diário"
        :loading="exportingLedger"
        @click="exportLedgerPdf"
      />
      <q-btn
        v-else
        outline
        no-caps
        color="primary"
        icon="notifications_active"
        label="Enviar lembretes"
        :loading="dispatchingReminders"
        @click="dispatchReminders"
      />
    </template>

    <q-card flat bordered class="finance-toolbar pluse-wave-card">
      <q-input v-model="filters.start_date" type="date" outlined dense stack-label label="Data inicial" @update:model-value="refreshScoped" />
      <q-input v-model="filters.end_date" type="date" outlined dense stack-label label="Data final" @update:model-value="refreshScoped" />
      <q-select
        v-model="filters.department"
        :options="departmentOptions"
        outlined
        dense
        clearable
        emit-value
        map-options
        label="Departamento"
        @update:model-value="refreshScoped"
      />
      <q-btn flat round icon="refresh" color="primary" :loading="loading" @click="loadAll">
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </q-card>

    <q-tabs v-model="tab" align="left" dense class="finance-tabs" active-color="primary" indicator-color="primary">
      <q-tab name="overview" icon="dashboard" label="Visão" />
      <q-tab name="requisitions" icon="request_quote" label="Requisições" />
      <q-tab name="debts" icon="assignment_late" label="Dívidas" />
      <q-tab name="reports" icon="receipt_long" label="Extratos" />
      <q-tab name="logs" icon="mark_email_read" label="Comunicações" />
      <q-tab name="audit" icon="manage_search" label="Auditoria" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="finance-panels">
      <q-tab-panel name="overview">
        <div class="kpi-grid">
          <div v-for="card in overviewCards" :key="card.key" class="kpi-tile">
            <span>{{ card.label }}</span>
            <strong :class="card.negative ? 'text-negative' : ''">{{ money(card.value) }}</strong>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="requisitions">
        <q-table :rows="requisitions" :columns="requisitionColumns" row-key="id" flat bordered class="pluse-light-table" :loading="loading" no-data-label="Sem requisições.">
          <template #body-cell-status="props">
            <q-td :props="props">
              <AppBadge :variant="statusVariant(props.row.status)">{{ props.row.status_display }}</AppBadge>
            </q-td>
          </template>
          <template #body-cell-amount="props">
            <q-td :props="props" class="text-right">{{ money(props.row.amount) }}</q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" auto-width>
              <div class="row-actions">
                <q-btn v-if="props.row.status === 'pending'" flat round dense icon="check_circle" color="positive" @click="approveRequisition(props.row)">
                  <q-tooltip>Aprovar</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.status === 'pending'" flat round dense icon="cancel" color="negative" @click="rejectRequisition(props.row)">
                  <q-tooltip>Rejeitar</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.status === 'approved'" flat round dense icon="payments" color="primary" @click="payRequisition(props.row)">
                  <q-tooltip>Marcar pago</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="debts">
        <q-table :rows="debts" :columns="debtColumns" row-key="id" flat bordered class="pluse-light-table" :loading="loading" no-data-label="Sem dívidas.">
          <template #body-cell-status="props">
            <q-td :props="props">
              <AppBadge :variant="props.row.is_overdue ? 'danger' : statusVariant(props.row.status)">
                {{ props.row.is_overdue ? 'Vencida' : props.row.status_display }}
              </AppBadge>
            </q-td>
          </template>
          <template #body-cell-amount="props">
            <q-td :props="props" class="text-right">{{ money(props.row.amount) }}</q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" auto-width>
              <div class="row-actions">
                <q-btn v-if="props.row.status === 'unpaid'" flat round dense icon="payments" color="primary" @click="payDebt(props.row)">
                  <q-tooltip>Marcar pago</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.status === 'unpaid'" flat round dense icon="block" color="negative" @click="cancelDebt(props.row)">
                  <q-tooltip>Anular</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="reports">
        <div class="report-head">
          <q-select
            v-model="selectedClient"
            :options="clientOptions"
            outlined
            dense
            emit-value
            map-options
            label="Cliente"
            class="grow"
          />
          <q-btn unelevated no-caps color="primary" icon="search" label="Gerar extrato" :loading="loadingStatement" @click="loadClientStatement" />
          <q-btn outline round color="negative" icon="picture_as_pdf" :disable="!statement.lines.length" @click="exportStatementPdf">
            <q-tooltip>Exportar extrato em PDF</q-tooltip>
          </q-btn>
        </div>

        <div class="statement-total">
          <span>Saldo atual</span>
          <strong :class="Number(statement.current_balance || 0) > 0 ? 'text-negative' : 'text-positive'">
            {{ money(statement.current_balance) }}
          </strong>
        </div>

        <q-table :rows="statement.lines" :columns="statementColumns" row-key="document_id" flat bordered class="pluse-light-table" :loading="loadingStatement" no-data-label="Sem movimentos.">
          <template #body-cell-debit="props"><q-td :props="props" class="text-right">{{ money(props.row.debit) }}</q-td></template>
          <template #body-cell-credit="props"><q-td :props="props" class="text-right">{{ money(props.row.credit) }}</q-td></template>
          <template #body-cell-balance="props"><q-td :props="props" class="text-right">{{ money(props.row.balance) }}</q-td></template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="logs">
        <q-table :rows="communicationLogs" :columns="communicationColumns" row-key="id" flat bordered class="pluse-light-table" :loading="loading" no-data-label="Sem comunicações.">
          <template #body-cell-status="props">
            <q-td :props="props">
              <AppBadge :variant="communicationVariant(props.row.status)">{{ props.row.status_display }}</AppBadge>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="audit">
        <q-table :rows="activityLogs" :columns="activityColumns" row-key="id" flat bordered class="pluse-light-table" :loading="loading" no-data-label="Sem atividades.">
          <template #body-cell-created_at="props">
            <q-td :props="props">{{ formatDateTime(props.row.created_at) }}</q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <AppModal v-model="showRequisitionModal" size="lg" persistent>
      <div class="modal-body">
        <AppHeading :level="3" class="modal-title">Nova requisição</AppHeading>
        <q-form ref="requisitionFormRef" greedy class="modal-form" @submit="submitRequisition">
          <q-select v-model="requisitionForm.department" :options="departmentOptions" outlined dense emit-value map-options label="Departamento *" :rules="[req]" />
          <q-input v-model.number="requisitionForm.amount" type="number" min="0.01" step="0.01" outlined dense label="Valor *" :rules="[req]" />
          <q-input v-model="requisitionForm.description" type="textarea" autogrow outlined dense label="Descrição *" :rules="[req]" />
          <q-file v-model="requisitionForm.justification_file" outlined dense clearable label="Anexo justificativo">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="modal-actions">
            <q-btn flat no-caps label="Cancelar" @click="showRequisitionModal = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showDebtModal" size="lg" persistent>
      <div class="modal-body">
        <AppHeading :level="3" class="modal-title">Nova dívida</AppHeading>
        <q-form ref="debtFormRef" greedy class="modal-form" @submit="submitDebt">
          <q-select v-model="debtForm.department" :options="departmentOptions" outlined dense emit-value map-options label="Departamento *" :rules="[req]" />
          <q-input v-model="debtForm.partner_name" outlined dense label="Parceiro / Fornecedor *" :rules="[req]" />
          <q-input v-model="debtForm.reference_document" outlined dense label="Documento de referência" />
          <q-input v-model.number="debtForm.amount" type="number" min="0.01" step="0.01" outlined dense label="Valor *" :rules="[req]" />
          <q-input v-model="debtForm.due_date" type="date" outlined dense stack-label label="Vencimento *" :rules="[req]" />
          <q-input v-model="debtForm.notes" type="textarea" autogrow outlined dense label="Notas" />
          <div class="modal-actions">
            <q-btn flat no-caps label="Cancelar" @click="showDebtModal = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import { clientService } from 'src/services/client.service'
import { departmentService } from 'src/services/hr.service'
import {
  billingDocumentService,
  financeActivityLogService,
  financeCommunicationLogService,
  financePartnerDebtService,
  financeReportService,
  financeRequisitionService,
  financeSystemSettingService,
} from 'src/services/finance.service'
import { useToast } from 'src/composables/useToast'
import {
  buildFinanceDocumentHtml,
  formatDocumentDate,
  formatDocumentMoney,
  openFinancePrintWindow,
} from 'src/utils/financeDocumentPrint'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const tab = ref('overview')
const loading = ref(false)
const saving = ref(false)
const dispatchingReminders = ref(false)
const exportingLedger = ref(false)
const loadingStatement = ref(false)
const clients = ref([])
const departments = ref([])
const requisitions = ref([])
const debts = ref([])
const communicationLogs = ref([])
const activityLogs = ref([])
const companySettings = ref(null)
const selectedClient = ref(null)
const overview = ref({})
const statement = ref({ lines: [], current_balance: 0 })

const filters = reactive({
  start_date: '',
  end_date: '',
  department: null,
})

const showRequisitionModal = ref(false)
const showDebtModal = ref(false)
const requisitionFormRef = ref(null)
const debtFormRef = ref(null)

const requisitionForm = reactive({
  department: null,
  amount: null,
  description: '',
  justification_file: null,
})

const debtForm = reactive({
  department: null,
  partner_name: '',
  reference_document: '',
  amount: null,
  due_date: '',
  notes: '',
})

const departmentOptions = computed(() => departments.value.map((d) => ({ value: d.id, label: d.name })))
const clientOptions = computed(() => clients.value.map((c) => ({ value: c.id, label: c.name })))
const selectedDepartmentLabel = computed(() => {
  if (!filters.department) return 'Geral'
  return departments.value.find((department) => String(department.id) === String(filters.department))?.name || 'Geral'
})
const overviewCards = computed(() => [
  { key: 'income', label: 'Entradas contabilizadas', value: overview.value.income_total },
  { key: 'expense', label: 'Saídas contabilizadas', value: overview.value.expense_total },
  { key: 'net', label: 'Resultado líquido', value: overview.value.net_total, negative: Number(overview.value.net_total || 0) < 0 },
  { key: 'receivable', label: 'Faturas por receber', value: overview.value.receivable_total },
  { key: 'req', label: 'Requisições pendentes', value: overview.value.pending_requisitions_total },
  { key: 'debt', label: 'Dívidas em aberto', value: overview.value.open_debts_total },
  { key: 'overdue', label: 'Dívidas vencidas', value: overview.value.overdue_debts_total, negative: Number(overview.value.overdue_debts_total || 0) > 0 },
  { key: 'paid', label: 'Documentos pagos', value: overview.value.paid_documents_total },
])

const requisitionColumns = [
  { name: 'created_at', label: 'Criado', field: (row) => formatDate(row.created_at), align: 'left' },
  { name: 'department', label: 'Departamento', field: 'department_name', align: 'left' },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'right' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const debtColumns = [
  { name: 'due_date', label: 'Vencimento', field: (row) => formatDate(row.due_date), align: 'left' },
  { name: 'partner_name', label: 'Parceiro', field: 'partner_name', align: 'left' },
  { name: 'department', label: 'Departamento', field: 'department_name', align: 'left' },
  { name: 'reference_document', label: 'Referência', field: 'reference_document', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'right' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const statementColumns = [
  { name: 'date', label: 'Data', field: (row) => formatDate(row.date), align: 'left' },
  { name: 'document_number', label: 'Documento', field: 'document_number', align: 'left' },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'debit', label: 'Débito', field: 'debit', align: 'right' },
  { name: 'credit', label: 'Crédito', field: 'credit', align: 'right' },
  { name: 'balance', label: 'Saldo', field: 'balance', align: 'right' },
]

const communicationColumns = [
  { name: 'sent_at', label: 'Enviado', field: (row) => formatDateTime(row.sent_at), align: 'left' },
  { name: 'client_name', label: 'Cliente', field: 'client_name', align: 'left' },
  { name: 'document_number', label: 'Documento', field: 'document_number', align: 'left' },
  { name: 'channel', label: 'Canal', field: 'channel_display', align: 'left' },
  { name: 'message_type', label: 'Tipo', field: 'message_type_display', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
]

const activityColumns = [
  { name: 'created_at', label: 'Data', field: 'created_at', align: 'left' },
  { name: 'actor_name', label: 'Utilizador', field: 'actor_name', align: 'left' },
  { name: 'action', label: 'Ação', field: 'action', align: 'left' },
  { name: 'summary', label: 'Resumo', field: 'summary', align: 'left' },
]

function scopedParams() {
  const params = { page_size: 300 }
  if (filters.department) params.department = filters.department
  if (filters.start_date) {
    params.start_date = filters.start_date
    params.date__gte = filters.start_date
    params.due_date__gte = filters.start_date
  }
  if (filters.end_date) {
    params.end_date = filters.end_date
    params.date__lte = filters.end_date
    params.due_date__lte = filters.end_date
  }
  return params
}

function money(value) {
  return formatDocumentMoney(value || 0)
}

function formatDate(value) {
  return formatDocumentDate(value)
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-PT')
}

function statusVariant(status) {
  return {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
    rejected: 'danger',
    unpaid: 'warning',
    canceled: 'neutral',
  }[status] || 'neutral'
}

function communicationVariant(status) {
  return {
    delivered: 'success',
    prepared: 'info',
    failed: 'danger',
  }[status] || 'neutral'
}

async function loadRefs() {
  const [clientData, departmentData, settingsData] = await Promise.all([
    clientService.list({ page_size: 300 }),
    departmentService.list({ page_size: 200, is_active: true }),
    financeSystemSettingService.get().catch(() => null),
  ])
  clients.value = clientData?.results ?? clientData ?? []
  departments.value = departmentData?.results ?? departmentData ?? []
  companySettings.value = settingsData
}

async function loadOverview() {
  overview.value = await financeReportService.overview(scopedParams())
}

async function loadRequisitions() {
  const data = await financeRequisitionService.list(scopedParams())
  requisitions.value = data?.results ?? data ?? []
}

async function loadDebts() {
  const data = await financePartnerDebtService.list(scopedParams())
  debts.value = data?.results ?? data ?? []
}

async function loadLogs() {
  const [communications, activities] = await Promise.all([
    financeCommunicationLogService.list({ page_size: 200 }),
    financeActivityLogService.list({ page_size: 200 }),
  ])
  communicationLogs.value = communications?.results ?? communications ?? []
  activityLogs.value = activities?.results ?? activities ?? []
}

async function loadAll() {
  loading.value = true
  try {
    await loadRefs()
    await Promise.all([loadOverview(), loadRequisitions(), loadDebts(), loadLogs()])
  } catch (err) {
    toast.error('Não foi possível carregar o centro financeiro.', { caption: err?.message })
  } finally {
    loading.value = false
  }
}

async function refreshScoped() {
  loading.value = true
  try {
    await Promise.all([loadOverview(), loadRequisitions(), loadDebts()])
  } finally {
    loading.value = false
  }
}

function openRequisitionModal() {
  Object.assign(requisitionForm, {
    department: filters.department || null,
    amount: null,
    description: '',
    justification_file: null,
  })
  showRequisitionModal.value = true
}

async function submitRequisition() {
  if (!(await requisitionFormRef.value?.validate())) return
  saving.value = true
  try {
    await financeRequisitionService.create({ ...requisitionForm })
    toast.success('Requisição criada.')
    showRequisitionModal.value = false
    await Promise.all([loadOverview(), loadRequisitions()])
  } catch (err) {
    toast.error('Falha ao criar requisição.', { caption: err?.response?.data?.detail || err?.message })
  } finally {
    saving.value = false
  }
}

async function approveRequisition(row) {
  await financeRequisitionService.approve(row.id)
  toast.success('Requisição aprovada.')
  await Promise.all([loadOverview(), loadRequisitions()])
}

async function rejectRequisition(row) {
  const reason = window.prompt('Motivo de rejeição') || ''
  await financeRequisitionService.reject(row.id, reason)
  toast.success('Requisição rejeitada.')
  await Promise.all([loadOverview(), loadRequisitions()])
}

async function payRequisition(row) {
  await financeRequisitionService.markPaid(row.id)
  toast.success('Requisição paga e contabilizada.')
  await Promise.all([loadOverview(), loadRequisitions()])
}

function openDebtModal() {
  Object.assign(debtForm, {
    department: filters.department || null,
    partner_name: '',
    reference_document: '',
    amount: null,
    due_date: '',
    notes: '',
  })
  showDebtModal.value = true
}

async function submitDebt() {
  if (!(await debtFormRef.value?.validate())) return
  saving.value = true
  try {
    await financePartnerDebtService.create({ ...debtForm })
    toast.success('Dívida registada.')
    showDebtModal.value = false
    await Promise.all([loadOverview(), loadDebts()])
  } catch (err) {
    toast.error('Falha ao registar dívida.', { caption: err?.response?.data?.detail || err?.message })
  } finally {
    saving.value = false
  }
}

async function payDebt(row) {
  await financePartnerDebtService.markPaid(row.id)
  toast.success('Dívida paga e contabilizada.')
  await Promise.all([loadOverview(), loadDebts()])
}

async function cancelDebt(row) {
  await financePartnerDebtService.cancel(row.id)
  toast.success('Dívida anulada.')
  await Promise.all([loadOverview(), loadDebts()])
}

async function loadClientStatement() {
  if (!selectedClient.value) {
    toast.warning('Selecione um cliente.')
    return
  }
  loadingStatement.value = true
  try {
    statement.value = await financeReportService.clientStatement({
      client: selectedClient.value,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
  } finally {
    loadingStatement.value = false
  }
}

function buildStatementHtml() {
  const data = statement.value
  const balance = Number(data.current_balance || 0)
  return buildFinanceDocumentHtml({
    company: companySettings.value || {},
    accent: balance > 0 ? '#dc2626' : '#0f766e',
    document: {
      title: `Extrato ${data.client?.name || ''}`.trim(),
      number: data.client?.name || 'Cliente',
      operator: 'Conta corrente',
    },
    hero: {
      kickerPt: 'Extrato de cliente',
      kickerEn: 'Customer statement',
      titlePt: 'Conta corrente',
      titleEn: 'Statement',
    },
    counterparty: {
      labelPt: 'Cliente',
      labelEn: 'Customer',
      value: data.client?.name || '-',
      details: [data.client?.nuit ? `NUIT ${data.client.nuit}` : '', data.client?.address || ''].filter(Boolean),
    },
    metaCards: [
      { labelPt: 'Data inicial', labelEn: 'Start', value: formatDate(data.start_date) },
      { labelPt: 'Data final', labelEn: 'End', value: formatDate(data.end_date) },
      { labelPt: 'Saldo inicial', labelEn: 'Opening balance', value: money(data.opening_balance) },
    ],
    lineTable: {
      columns: [
        { key: 'date', labelPt: 'Data', labelEn: 'Date' },
        { key: 'document', labelPt: 'Documento', labelEn: 'Document' },
        { key: 'debit', labelPt: 'Débito', labelEn: 'Debit', align: 'right' },
        { key: 'credit', labelPt: 'Crédito', labelEn: 'Credit', align: 'right' },
        { key: 'balance', labelPt: 'Saldo', labelEn: 'Balance', align: 'right' },
      ],
      rows: data.lines.map((line) => ({
        date: formatDate(line.date),
        document: line.document_number || '-',
        debit: money(line.debit),
        credit: money(line.credit),
        balance: money(line.balance),
      })),
    },
    totals: [
      { labelPt: 'Débitos', labelEn: 'Debits', value: money(data.debit_total) },
      { labelPt: 'Créditos', labelEn: 'Credits', value: money(data.credit_total) },
      { labelPt: 'Saldo atual', labelEn: 'Current balance', value: money(data.current_balance), highlight: true },
    ],
    footerNote: 'Extrato gerado automaticamente pelo PLUSE para conferência financeira.',
  })
}

function exportStatementPdf() {
  openFinancePrintWindow({
    title: `Extrato ${statement.value.client?.name || ''}`.trim(),
    html: buildStatementHtml(),
    mode: 'pdf',
    toast,
  })
}

async function exportLedgerPdf() {
  exportingLedger.value = true
  try {
    const ledger = await financeReportService.ledger(scopedParams())
    const departmentScope = selectedDepartmentLabel.value
    openFinancePrintWindow({
      title: `Livro diário - ${departmentScope}`,
      mode: 'pdf',
      toast,
      html: buildFinanceDocumentHtml({
        company: companySettings.value || {},
        accent: '#2563eb',
        document: {
          title: 'Livro diário',
          number: departmentScope,
          operator: 'Financeiro',
        },
        hero: {
          kickerPt: 'Livro diário',
          kickerEn: 'Accounting ledger',
          titlePt: departmentScope,
          titleEn: departmentScope === 'Geral' ? 'General' : 'Department report',
        },
        metaCards: [
          { labelPt: 'Departamento', labelEn: 'Department', value: departmentScope },
          { labelPt: 'Data inicial', labelEn: 'Start', value: formatDate(ledger.start_date) },
          { labelPt: 'Data final', labelEn: 'End', value: formatDate(ledger.end_date) },
          { labelPt: 'Resultado', labelEn: 'Net', value: money(ledger.net_total) },
        ],
        lineTable: {
          columns: [
            { key: 'date', labelPt: 'Data', labelEn: 'Date' },
            { key: 'reference', labelPt: 'Referência', labelEn: 'Reference' },
            { key: 'department', labelPt: 'Departamento', labelEn: 'Department' },
            { key: 'debit', labelPt: 'Débito', labelEn: 'Debit', align: 'right' },
            { key: 'credit', labelPt: 'Crédito', labelEn: 'Credit', align: 'right' },
          ],
          rows: ledger.rows.map((row) => ({
            date: formatDate(row.date),
            reference: row.reference,
            department: row.department_name || 'Geral',
            debit: money(row.debit_total),
            credit: money(row.credit_total),
          })),
        },
        totals: [
          { labelPt: 'Total de débitos', labelEn: 'Debits', value: money(ledger.debit_total) },
          { labelPt: 'Total de créditos', labelEn: 'Credits', value: money(ledger.credit_total), highlight: true },
        ],
        footerNote: 'Relatório interno gerado automaticamente pelo PLUSE com os filtros selecionados no Centro Financeiro.',
      }),
    })
  } catch (err) {
    toast.error('Não foi possível exportar o livro diário.', { caption: err?.response?.data?.detail || err?.message })
  } finally {
    exportingLedger.value = false
  }
}

async function dispatchReminders() {
  dispatchingReminders.value = true
  try {
    const summary = await billingDocumentService.dispatchReminders({ days_before_due: 3, include_pdf_attachment: true })
    toast.success('Lembretes processados.', {
      caption: `Enviados: ${summary.sent || 0} | Falhados: ${summary.failed || 0}`,
    })
    await loadLogs()
  } catch (err) {
    toast.error('Falha ao processar lembretes.', { caption: err?.response?.data?.detail || err?.message })
  } finally {
    dispatchingReminders.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.finance-toolbar {
  display: grid;
  grid-template-columns: 170px 170px minmax(220px, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  color: var(--foreground);
}

.finance-tabs {
  margin-bottom: 8px;
  border-bottom: 1px solid var(--pluse-wave-soft-border);
  color: var(--pluse-table-muted);
}

.finance-tabs :deep(.q-tab) {
  color: var(--pluse-table-muted);
}

.finance-tabs :deep(.q-tab--active) {
  color: var(--primary);
}

.finance-panels {
  background: transparent;
  color: var(--foreground);
}

.finance-panels :deep(.q-tab-panel) {
  padding: 12px 0 0;
  color: var(--foreground);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-tile {
  min-height: 92px;
  padding: 14px;
  border: 1px solid var(--pluse-wave-soft-border);
  border-radius: 8px;
  background: var(--pluse-wave-card-bg);
  box-shadow: var(--pluse-wave-shadow);
}

.kpi-tile span {
  display: block;
  font-size: 0.76rem;
  color: var(--muted-foreground);
}

.kpi-tile strong {
  display: block;
  margin-top: 8px;
  font-size: 1.1rem;
  color: var(--foreground);
}

.row-actions,
.report-head,
.modal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-actions,
.modal-actions {
  justify-content: flex-end;
}

.report-head {
  margin-bottom: 12px;
}

.statement-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid var(--pluse-wave-soft-border);
  border-radius: 8px;
  background: var(--pluse-wave-card-bg);
  box-shadow: var(--pluse-wave-shadow);
  color: var(--foreground);
}

.statement-total span {
  color: var(--muted-foreground);
}

.statement-total strong {
  font-size: 1.1rem;
}

.modal-body {
  padding: 18px;
  color: var(--foreground);
}

.modal-title {
  margin-bottom: 14px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 980px) {
  .finance-toolbar,
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .finance-toolbar,
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .report-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
