<template>
  <AdminPageTemplate
    eyebrow="Contabilidade e Finanças"
    title="Diário contabilístico"
    description="Lançamentos com regra de dupla entrada: débitos = créditos."
  >
    <template #hero>
      <div class="kpi-grid">
        <q-card flat bordered class="kpi-card">
          <small>Total de entradas</small>
          <strong>{{ money(totalEntradas) }}</strong>
        </q-card>
        <q-card flat bordered class="kpi-card">
          <small>Total de saídas</small>
          <strong>{{ money(totalSaidas) }}</strong>
        </q-card>
        <q-card flat bordered class="kpi-card">
          <small>Total remanescente</small>
          <strong :class="remainingTotal < 0 ? 'text-negative' : ''">{{ money(remainingTotal) }}</strong>
        </q-card>
        <q-card flat bordered class="kpi-card">
          <small>IVA estimado</small>
          <strong>{{ money(estimatedVat) }}</strong>
          <span class="kpi-hint">Taxa: {{ vatRatePercent.toFixed(2).replace('.', ',') }}%</span>
        </q-card>
      </div>
    </template>

    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary" icon="add" label="Novo lançamento" @click="openCreate" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table :rows="rows" :columns="columns" row-key="id" flat class="pluse-light-table" :loading="loading" no-data-label="Sem lançamentos.">
        <template #body-cell-reference="props">
          <q-td :props="props">
            <div class="text-mono font-semibold">{{ props.row.reference }}</div>
            <div class="text-xs text-muted-foreground">{{ formatDate(props.row.date) }} · {{ props.row.entry_type_display }}</div>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.status === 'validated' ? 'success' : 'warning'">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>
        <template #body-cell-balance="props">
          <q-td :props="props">
            <div>{{ money(props.row.debit_total) }} / {{ money(props.row.credit_total) }}</div>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <div class="row-actions">
              <q-btn
                v-if="props.row.status === 'draft'"
                flat
                dense
                no-caps
                color="primary"
                label="Validar"
                @click="validateEntry(props.row)"
              />
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="picture_as_pdf"
                @click="exportEntryPdf(props.row)"
              />
              <q-btn
                flat
                dense
                round
                color="secondary"
                icon="print"
                @click="printEntry(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showCreate" size="lg" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">Novo lançamento</AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-3" @submit="submitCreate">
          <div class="grid grid-cols-3 gap-3">
            <q-input v-model="form.date" type="date" label="Data *" outlined dense stack-label :rules="[req]" />
            <q-select
              v-model="form.entry_type"
              :options="entryTypeOptions"
              emit-value
              map-options
              outlined
              dense
              label="Tipo *"
              :rules="[req]"
            />
            <q-input v-model="form.reference" label="Referência automática" outlined dense readonly />
          </div>
          <q-input v-model="form.description" type="textarea" autogrow outlined dense label="Descrição" />

          <div v-if="form.entry_type === 'expense'" class="grid grid-cols-2 gap-3">
            <q-select
              v-model="form.employee_id"
              :options="employeeOptions"
              emit-value
              map-options
              outlined
              dense
              label="Colaborador *"
              :rules="[req]"
            />
            <q-input
              v-model.number="form.amount"
              type="number"
              min="0"
              step="0.01"
              outlined
              dense
              label="Valor da despesa *"
              :rules="[req]"
            />
          </div>

          <div v-else class="grid grid-cols-2 gap-3">
            <q-select
              v-model="form.client_id"
              :options="clientOptions"
              emit-value
              map-options
              outlined
              dense
              label="Cliente *"
              :rules="[req]"
            />
            <q-select
              v-model="form.paid_billing_document_id"
              :options="paidBillingOptions"
              emit-value
              map-options
              outlined
              dense
              :loading="loadingPaidDocuments"
              label="Faturação paga *"
              :rules="[req]"
              hint="Apenas documentos com status pago são exibidos."
            />
            <q-input
              class="col-span-2"
              v-model.number="form.amount"
              type="number"
              min="0"
              step="0.01"
              outlined
              dense
              readonly
              label="Valor da entrada (automático)"
            />
          </div>

          <div class="flex justify-end items-center mt-2">
            <div class="text-sm text-muted-foreground">
              Débito automático: {{ money(totalDebit) }} | Crédito automático: {{ money(totalCredit) }}
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-3">
            <q-btn flat no-caps label="Cancelar" @click="showCreate = false" :disable="saving" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import { clientService } from 'src/services/client.service'
import { employeeService } from 'src/services/employee.service'
import { billingDocumentService, financeAccountService, financeSystemSettingService, journalEntryService } from 'src/services/finance.service'
import { useToast } from 'src/composables/useToast'
import {
  buildFinanceDocumentHtml,
  formatDocumentDate,
  formatDocumentMoney,
  openFinancePrintWindow,
} from 'src/utils/financeDocumentPrint'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const accounts = ref([])
const clients = ref([])
const employees = ref([])
const companySettings = ref(null)
const loading = ref(false)
const saving = ref(false)
const loadingPaidDocuments = ref(false)
const paidBillingDocuments = ref([])

const columns = [
  { name: 'reference', label: 'Referência', field: 'reference', align: 'left', sortable: true },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'balance', label: 'Débito / Crédito', field: 'debit_total', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  reference: '',
  entry_type: 'expense',
  description: '',
  amount: 0,
  employee_id: null,
  client_id: null,
  paid_billing_document_id: null,
  status: 'draft',
})
const entryTypeOptions = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Entrada' },
]

const clientOptions = computed(() => clients.value.map((c) => ({ value: c.id, label: c.name })))
const employeeOptions = computed(() => employees.value.map((e) => ({ value: e.id, label: `${e.employee_number || 'SEM-NUM'} - ${e.full_name}` })))
const paidBillingOptions = computed(() => paidBillingDocuments.value.map((doc) => ({
  value: doc.id,
  label: `${doc.document_number || `DOC-${doc.id}`} · ${money(doc.total_amount)} · ${doc.issue_date || ''}`,
})))
const selectedPaidDocument = computed(() => paidBillingDocuments.value.find((doc) => doc.id === form.paid_billing_document_id) || null)
const totalDebit = computed(() => Number(form.amount || 0))
const totalCredit = computed(() => Number(form.amount || 0))
const vatRatePercent = computed(() => {
  const value = Number(companySettings.value?.vat_rate_percent)
  if (!Number.isFinite(value)) return 16
  return Math.max(0, Math.min(100, value))
})
const totalEntradas = computed(() => rows.value
  .filter((entry) => entry.entry_type === 'income')
  .reduce((acc, entry) => acc + Number(entry.credit_total || 0), 0))
const totalSaidas = computed(() => rows.value
  .filter((entry) => entry.entry_type === 'expense')
  .reduce((acc, entry) => acc + Number(entry.debit_total || 0), 0))
const remainingTotal = computed(() => totalEntradas.value - totalSaidas.value)
const estimatedVat = computed(() => (totalEntradas.value * vatRatePercent.value) / 100)

function accountByType(accountType) {
  return accounts.value.find((account) => account.account_type === accountType) || null
}

function buildAutoLines() {
  const amount = Number(form.amount || 0)
  if (amount <= 0) {
    return { error: 'Indique um valor maior que zero para o lançamento.' }
  }

  const assetAccount = accountByType('asset')
  if (!assetAccount) {
    return { error: 'Nenhuma conta ativa do tipo Ativo foi encontrada para contrapartida.' }
  }

  if (form.entry_type === 'expense') {
    const expenseAccount = accountByType('expense')
    if (!expenseAccount) {
      return { error: 'Nenhuma conta ativa do tipo Custo foi encontrada para registrar despesa.' }
    }
    return {
      lines: [
        { account: expenseAccount.id, debit_amount: amount, credit_amount: 0 },
        { account: assetAccount.id, debit_amount: 0, credit_amount: amount },
      ],
    }
  }

  const revenueAccount = accountByType('revenue')
  if (!revenueAccount) {
    return { error: 'Nenhuma conta ativa do tipo Proveitos foi encontrada para registrar entrada.' }
  }
  return {
    lines: [
      { account: assetAccount.id, debit_amount: amount, credit_amount: 0 },
      { account: revenueAccount.id, debit_amount: 0, credit_amount: amount },
    ],
  }
}

function extractErrorCaption(err) {
  const data = err?.response?.data
  if (!data) return undefined
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.lines) && data.lines[0]) return String(data.lines[0])

  const firstValue = Object.values(data)[0]
  if (Array.isArray(firstValue) && firstValue[0]) return String(firstValue[0])
  if (typeof firstValue === 'string') return firstValue
  if (firstValue && typeof firstValue === 'object') {
    const nested = Object.values(firstValue)[0]
    if (Array.isArray(nested) && nested[0]) return String(nested[0])
    if (typeof nested === 'string') return nested
  }
  return undefined
}

function money(v) {
  return `${Number(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MZN`
}

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString('pt-PT') : '—'
}

function buildEntryPrintHtml(entry) {
  const cfg = companySettings.value || {}
  return buildFinanceDocumentHtml({
    company: cfg,
    accent: '#0f766e',
    document: {
      title: `Lançamento ${entry.reference}`,
      number: entry.reference,
      operator: entry.status_display || entry.status || 'Draft',
    },
    hero: {
      kickerPt: 'Diário contabilístico',
      kickerEn: 'General ledger',
      titlePt: 'Lançamento',
      titleEn: 'Journal entry',
    },
    counterparty: {
      labelPt: 'Empresa / documento',
      labelEn: 'Company / document',
      value: cfg.trade_name || cfg.legal_name || 'PLUSE',
    },
    metaCards: [
      { labelPt: 'Data', labelEn: 'Date', value: formatDocumentDate(entry.date) },
      { labelPt: 'Estado', labelEn: 'Status', value: entry.status_display || entry.status || '—' },
      { labelPt: 'NUIT', labelEn: 'Tax number', value: cfg.nuit || '—' },
    ],
    lineTable: {
      columns: [
        { key: 'index', labelPt: 'Item', labelEn: '#' },
        { key: 'code', labelPt: 'Código da conta', labelEn: 'Account code' },
        { key: 'name', labelPt: 'Descrição', labelEn: 'Description' },
        { key: 'debit', labelPt: 'Débito', labelEn: 'Debit', align: 'right' },
        { key: 'credit', labelPt: 'Crédito', labelEn: 'Credit', align: 'right' },
      ],
      rows: (entry.lines || []).map((line, index) => ({
        index: String(index + 1).padStart(2, '0'),
        code: line.account_code || '—',
        name: line.account_name || '—',
        debit: formatDocumentMoney(line.debit_amount),
        credit: formatDocumentMoney(line.credit_amount),
      })),
    },
    paymentBlocks: [
      {
        titlePt: 'Descrição operacional',
        titleEn: 'Operational note',
        name: entry.description || 'Sem descrição registada',
        detail: 'Documento interno do diário contabilístico / Internal accounting document',
      },
    ],
    totals: [
      { labelPt: 'Total de débitos', labelEn: 'Debit total', value: formatDocumentMoney(entry.debit_total) },
      { labelPt: 'Total de créditos', labelEn: 'Credit total', value: formatDocumentMoney(entry.credit_total), highlight: true },
    ],
    footerNote: 'Documento gerado automaticamente a partir do PLUSE. Use este comprovativo para arquivo interno e auditoria.',
  })
}

async function openEntryDocument(row, mode = 'print') {
  try {
    const entry = await journalEntryService.get(row.id)
    if (!companySettings.value) {
      try {
        companySettings.value = await financeSystemSettingService.get()
      } catch {
        companySettings.value = null
      }
    }

    openFinancePrintWindow({
      title: `Lançamento ${entry.reference}`,
      html: buildEntryPrintHtml(entry),
      mode,
      toast,
    })
  } catch (err) {
    toast.error('Não foi possível gerar o documento do lançamento.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  }
}

function exportEntryPdf(row) {
  openEntryDocument(row, 'pdf')
}

function printEntry(row) {
  openEntryDocument(row, 'print')
}

function fallbackNextReference(entryType) {
  const currentYear = new Date().getFullYear()
  const prefix = entryType === 'income' ? `ENT-${currentYear}-` : `DSP-${currentYear}-`
  const sameTypeReferences = rows.value
    .map((row) => String(row.reference || ''))
    .filter((reference) => reference.startsWith(prefix))

  const seq = sameTypeReferences.reduce((max, reference) => {
    const value = Number(reference.split('-').pop())
    return Number.isFinite(value) ? Math.max(max, value) : max
  }, 0)

  return `${prefix}${String(seq + 1).padStart(5, '0')}`
}

async function refreshNextReference() {
  try {
    const response = await journalEntryService.nextReference(form.entry_type)
    form.reference = response?.reference || fallbackNextReference(form.entry_type)
  } catch {
    form.reference = fallbackNextReference(form.entry_type)
  }
}

async function fetchPaidDocuments(clientId) {
  if (!clientId) {
    paidBillingDocuments.value = []
    form.paid_billing_document_id = null
    return
  }

  loadingPaidDocuments.value = true
  try {
    const data = await billingDocumentService.list({ client: clientId, status: 'paid', page_size: 200 })
    paidBillingDocuments.value = data?.results ?? data ?? []
    if (!paidBillingDocuments.value.some((doc) => doc.id === form.paid_billing_document_id)) {
      form.paid_billing_document_id = null
    }
  } catch {
    paidBillingDocuments.value = []
    form.paid_billing_document_id = null
  } finally {
    loadingPaidDocuments.value = false
  }
}

function openCreate() {
  Object.assign(form, {
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    entry_type: 'expense',
    description: '',
    amount: 0,
    employee_id: null,
    client_id: null,
    paid_billing_document_id: null,
    status: 'draft',
  })
  paidBillingDocuments.value = []
  showCreate.value = true
  refreshNextReference()
}

async function fetchRows() {
  loading.value = true
  try {
    const [entriesData, accountData, settingsData, clientData, employeeData] = await Promise.all([
      journalEntryService.list({ page_size: 200 }),
      financeAccountService.list({ page_size: 500, is_active: true }),
      financeSystemSettingService.get().catch(() => null),
      clientService.list({ page_size: 300 }),
      employeeService.list({ page_size: 300 }),
    ])
    rows.value = entriesData?.results ?? entriesData ?? []
    accounts.value = accountData?.results ?? accountData ?? []
    companySettings.value = settingsData
    clients.value = clientData?.results ?? clientData ?? []
    employees.value = employeeData?.results ?? employeeData ?? []
  } finally {
    loading.value = false
  }
}

async function validateEntry(row) {
  try {
    await journalEntryService.validate(row.id)
    toast.success('Lançamento validado.')
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao validar lançamento.', {
      caption: err?.response?.data?.detail,
    })
  }
}

async function submitCreate() {
  if (!(await formRef.value?.validate())) return

  if (form.entry_type === 'expense' && !form.employee_id) {
    toast.error('Selecione o colaborador para lançar a despesa.')
    return
  }
  if (form.entry_type === 'income' && !form.client_id) {
    toast.error('Selecione o cliente para lançar a entrada.')
    return
  }
  if (form.entry_type === 'income' && !form.paid_billing_document_id) {
    toast.error('Selecione uma faturação paga para criar a entrada.')
    return
  }

  const autoLines = buildAutoLines()
  if (autoLines.error) {
    toast.error('Não foi possível montar as linhas automaticamente.', { caption: autoLines.error })
    return
  }

  saving.value = true
  try {
    const descriptionSuffix = form.entry_type === 'expense'
      ? (() => {
          const employee = employees.value.find((item) => item.id === form.employee_id)
          return employee ? ` · Colaborador: ${employee.full_name}` : ''
        })()
      : (() => {
          const client = clients.value.find((item) => item.id === form.client_id)
          const billing = selectedPaidDocument.value
          const docRef = billing?.document_number || (billing ? `DOC-${billing.id}` : '')
          return `${client ? ` · Cliente: ${client.name}` : ''}${docRef ? ` · Fatura paga: ${docRef}` : ''}`
        })()

    await journalEntryService.create({
      date: form.date,
      reference: form.reference,
      entry_type: form.entry_type,
      description: `${form.description || ''}${descriptionSuffix}`.trim(),
      status: form.status,
      lines: autoLines.lines,
    })
    toast.success('Lançamento criado.')
    showCreate.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível criar lançamento.', {
      caption: extractErrorCaption(err),
    })
  } finally {
    saving.value = false
  }
}

onMounted(fetchRows)

watch(
  () => form.entry_type,
  (entryType) => {
    form.employee_id = null
    form.client_id = null
    form.paid_billing_document_id = null
    paidBillingDocuments.value = []
    if (entryType === 'income') {
      form.amount = 0
    }
    if (showCreate.value) refreshNextReference()
  },
)

watch(
  () => form.client_id,
  (clientId) => {
    if (form.entry_type !== 'income') return
    fetchPaidDocuments(clientId)
  },
)

watch(
  () => form.paid_billing_document_id,
  (billingId) => {
    if (form.entry_type !== 'income') return
    const selected = paidBillingDocuments.value.find((doc) => doc.id === billingId)
    form.amount = Number(selected?.total_amount || 0)
  },
)
</script>

<style scoped>
.pluse-card { background: var(--card); }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.kpi-card {
  padding: 0.9rem 1rem;
  border-color: color-mix(in oklab, var(--border) 75%, var(--primary));
  background: color-mix(in oklab, var(--card) 92%, var(--primary));
}

.kpi-card small {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
}

.kpi-card strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.1rem;
  font-weight: 800;
}

.kpi-hint {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: var(--muted-foreground);
}

.pluse-light-table :deep(.q-table__middle),
.pluse-light-table :deep(.q-table) {
  background: transparent;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
