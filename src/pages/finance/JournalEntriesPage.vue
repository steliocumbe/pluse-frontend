<template>
  <AdminPageTemplate
    eyebrow="Contabilidade e Finanças"
    title="Diário contabilístico"
    description="Lançamentos com regra de dupla entrada: débitos = créditos."
  >
    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary" icon="add" label="Novo lançamento" @click="openCreate" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading" no-data-label="Sem lançamentos.">
        <template #body-cell-reference="props">
          <q-td :props="props">
            <div class="text-mono font-semibold">{{ props.row.reference }}</div>
            <div class="text-xs text-muted-foreground">{{ formatDate(props.row.date) }}</div>
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
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.date" type="date" label="Data *" outlined dense stack-label :rules="[req]" />
            <q-input v-model="form.reference" label="Referência *" outlined dense :rules="[req]" />
          </div>
          <q-input v-model="form.description" type="textarea" autogrow outlined dense label="Descrição" />

          <div class="text-sm font-semibold mt-2">Linhas</div>
          <div v-for="(line, idx) in form.lines" :key="idx" class="grid grid-cols-12 gap-2 items-center">
            <q-select
              class="col-span-6"
              v-model="line.account"
              :options="accountOptions"
              emit-value
              map-options
              outlined
              dense
              label="Conta *"
              :rules="[req]"
            />
            <q-input class="col-span-2" v-model.number="line.debit_amount" type="number" min="0" step="0.01" outlined dense label="Débito" />
            <q-input class="col-span-2" v-model.number="line.credit_amount" type="number" min="0" step="0.01" outlined dense label="Crédito" />
            <q-btn class="col-span-2" flat dense no-caps color="negative" label="Remover" @click="removeLine(idx)" />
          </div>

          <div class="flex justify-between items-center mt-2">
            <q-btn flat dense no-caps icon="add" label="Adicionar linha" @click="addLine" />
            <div class="text-sm text-muted-foreground">
              Débitos: {{ money(totalDebit) }} | Créditos: {{ money(totalCredit) }}
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
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import { financeAccountService, financeSystemSettingService, journalEntryService } from 'src/services/finance.service'
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
const companySettings = ref(null)
const loading = ref(false)
const saving = ref(false)

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
  description: '',
  status: 'draft',
  lines: [
    { account: null, debit_amount: 0, credit_amount: 0 },
    { account: null, debit_amount: 0, credit_amount: 0 },
  ],
})

const accountOptions = computed(() => accounts.value.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` })))
const totalDebit = computed(() => form.lines.reduce((acc, l) => acc + Number(l.debit_amount || 0), 0))
const totalCredit = computed(() => form.lines.reduce((acc, l) => acc + Number(l.credit_amount || 0), 0))

function normalizeLine(line) {
  return {
    account: line.account,
    debit_amount: Number(line.debit_amount || 0),
    credit_amount: Number(line.credit_amount || 0),
  }
}

function isEffectivelyEmptyLine(line) {
  const current = normalizeLine(line)
  return !current.account && current.debit_amount === 0 && current.credit_amount === 0
}

function firstLineError(lines) {
  if (!lines.length) return 'Adicione pelo menos duas linhas ao lançamento.'

  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index])
    const label = `Linha ${index + 1}`

    if (!line.account) return `${label}: selecione a conta.`
    if (line.debit_amount < 0 || line.credit_amount < 0) {
      return `${label}: débito e crédito não podem ser negativos.`
    }
    if (line.debit_amount === 0 && line.credit_amount === 0) {
      return `${label}: indique um valor em débito ou crédito.`
    }
    if (line.debit_amount > 0 && line.credit_amount > 0) {
      return `${label}: preencha apenas débito ou crédito, não ambos.`
    }
  }

  if (lines.length < 2) return 'O lançamento deve ter pelo menos duas linhas.'
  return ''
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

function addLine() {
  form.lines.push({ account: null, debit_amount: 0, credit_amount: 0 })
}

function removeLine(idx) {
  if (form.lines.length <= 2) return
  form.lines.splice(idx, 1)
}

function openCreate() {
  Object.assign(form, {
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    description: '',
    status: 'draft',
    lines: [
      { account: null, debit_amount: 0, credit_amount: 0 },
      { account: null, debit_amount: 0, credit_amount: 0 },
    ],
  })
  showCreate.value = true
}

async function fetchRows() {
  loading.value = true
  try {
    const [entriesData, accountData, settingsData] = await Promise.all([
      journalEntryService.list({ page_size: 200 }),
      financeAccountService.list({ page_size: 500, is_active: true }),
      financeSystemSettingService.get().catch(() => null),
    ])
    rows.value = entriesData?.results ?? entriesData ?? []
    accounts.value = accountData?.results ?? accountData ?? []
    companySettings.value = settingsData
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

  const preparedLines = form.lines
    .map(normalizeLine)
    .filter((line) => !isEffectivelyEmptyLine(line))

  const lineError = firstLineError(preparedLines)
  if (lineError) {
    toast.error('Verifique as linhas do lançamento.', { caption: lineError })
    return
  }

  saving.value = true
  try {
    await journalEntryService.create({ ...form, lines: preparedLines })
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
</script>

<style scoped>
.pluse-card { background: var(--card); }
.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}
</style>
