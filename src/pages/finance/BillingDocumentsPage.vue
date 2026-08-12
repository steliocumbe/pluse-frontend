<template>
  <AdminPageTemplate
    eyebrow="Contabilidade e Finanças / Accounting & Finance"
    title="Documentos de Faturação"
    description="Faturas, recibos e cotações com integração automática. / Invoices, receipts and quotes with auto-integration."
  >
    <template #actions>
      <!-- Botão Snow White Wave: Arredondado, sem elevação pesada, cor primária -->
      <q-btn 
        unelevated 
        no-caps 
        class="wave-btn-primary" 
        icon="add_circle_outline" 
        label="Novo Documento / New" 
        @click="openCreate" 
      />
    </template>

    <!-- Card Snow White: Sem bordas, sombra suave (soft shadow), cantos arredondados (wave) -->
    <q-card flat class="pluse-wave-card mt-4">
      
      <!-- Tabela Leve (Light Table): Sem bordas, cabeçalho sutil, espaçamento orgânico -->
      <q-table 
        :rows="rows" 
        :columns="columns" 
        row-key="id" 
        flat 
        class="pluse-light-table"
        :loading="loading" 
        no-data-label="Nenhum documento encontrado. / No documents found."
      >
        <!-- Coluna Documento (Bilingue nas descrições) -->
        <template #body-cell-document_number="props">
          <q-td :props="props">
            <div class="text-mono font-bold text-dark-wave">
              {{ props.row.document_number || 'A gerar / Pending' }}
            </div>
            <div class="text-xs text-snow-muted font-medium mt-1">
              {{ props.row.client_name }}
            </div>
            <div class="text-[10px] text-snow-muted">
              Serviço: {{ props.row.service_summary || props.row.service_name || '—' }}
            </div>
          </q-td>
        </template>

        <!-- Coluna Estado -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)" class="wave-badge">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-document_type_display="props">
          <q-td :props="props">
            <span class="text-dark-wave font-medium">
              {{ props.row.status === 'paid' ? 'Recibo / Receipt' : props.row.document_type_display }}
            </span>
          </q-td>
        </template>

        <!-- Coluna Total -->
        <template #body-cell-total_amount="props">
          <q-td :props="props">
            <span class="font-semibold text-dark-wave">{{ money(props.row.total_amount) }}</span>
          </q-td>
        </template>

        <!-- Coluna Ações (Ícones limpos com Tooltips para manter a tabela leve) -->
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <div class="doc-actions">
              <q-btn v-if="props.row.status === 'pending'" flat dense round color="primary" icon="play_circle" @click="issueDoc(props.row)">
                <q-tooltip class="wave-tooltip">Emitir / Issue</q-tooltip>
              </q-btn>
              
              <q-btn v-if="props.row.status === 'issued'" flat dense round color="positive" icon="check_circle" @click="markPaid(props.row)">
                <q-tooltip class="wave-tooltip">Marcar Pago / Mark Paid</q-tooltip>
              </q-btn>
              
              <q-btn v-if="props.row.status !== 'paid' && props.row.status !== 'canceled'" flat dense round color="negative" icon="cancel" @click="cancelDoc(props.row)">
                <q-tooltip class="wave-tooltip">Anular / Cancel</q-tooltip>
              </q-btn>
              
              <q-btn flat dense round color="grey-7" icon="picture_as_pdf" @click="exportDocumentPdf(props.row)">
                <q-tooltip class="wave-tooltip">Exportar PDF</q-tooltip>
              </q-btn>

              <q-btn flat dense round color="grey-7" @click="openSendEmailModal(props.row)">
                <AppIcon name="ki-sms" :size="16" />
                <q-tooltip class="wave-tooltip">Enviar por e-mail</q-tooltip>
              </q-btn>

              <q-btn v-if="props.row.status === 'paid'" flat dense round color="indigo-7" @click="openReceiptPlanModal(props.row)">
                <AppIcon name="ki-calendar" :size="16" />
                <q-tooltip class="wave-tooltip">Configurar avença / auto envio</q-tooltip>
              </q-btn>

              <q-btn v-if="props.row.status === 'paid'" flat dense round color="primary" @click="testReceiptAutoEmailFromRow(props.row)">
                <AppIcon name="ki-sms" :size="16" />
                <q-tooltip class="wave-tooltip">Testar auto envio agora</q-tooltip>
              </q-btn>

              <q-btn flat dense round color="green-7" @click="openSendWhatsAppModal(props.row)">
                <AppIcon name="ki-whatsapp" :size="16" />
                <q-tooltip class="wave-tooltip">Enviar por WhatsApp</q-tooltip>
              </q-btn>
              
              <q-btn flat dense round color="grey-7" icon="print" @click="printDocument(props.row)">
                <q-tooltip class="wave-tooltip">Imprimir / Print</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Novo Documento (Estilo Wave) -->
    <AppModal v-model="showCreate" size="3xl" persistent class="wave-modal">
      <div class="p-6 wave-modal-surface rounded-3xl">
        <div class="mb-6">
          <AppHeading :level="3" class="text-xl font-bold text-dark-wave m-0">Novo Documento</AppHeading>
          <span class="text-xs text-snow-muted">New Financial Document</span>
        </div>

        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submitCreate">
          <!-- Inputs com estilo Outlined mas arredondados (rounded) -->
          <q-select rounded v-model="form.client" :options="clientOptions" emit-value map-options outlined dense label="Cliente / Client *" :rules="[req]" />
          <q-select rounded v-model="form.department" :options="departmentOptions" emit-value map-options outlined dense label="Departamento / Department" clearable />

          <div class="wave-soft-surface rounded-2xl p-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="text-sm font-bold text-dark-wave">Serviços do documento / Document services</div>
                <div class="text-xs text-snow-muted">Múltiplos serviços com preço rápido e periodicidade automática.</div>
              </div>
              <q-btn flat rounded no-caps color="primary" icon="add" label="Adicionar" @click="addServiceLine" />
            </div>

            <div v-for="(item, idx) in form.items" :key="`service-line-${idx}`" class="service-line-grid mb-3">
              <q-select
                v-model="item.service"
                :options="serviceOptions"
                emit-value
                map-options
                outlined
                dense
                rounded
                label="Serviço *"
                :rules="[req]"
                @update:model-value="(value) => onServicePicked(idx, value)"
              />

              <q-input
                v-model.number="item.quantity"
                type="number"
                min="0.001"
                step="0.001"
                outlined
                dense
                rounded
                label="Qtd *"
                :rules="[(v) => Number(v) > 0 || 'Quantidade > 0']"
              />

              <q-input
                v-model.number="item.unit_price"
                type="number"
                min="0"
                step="0.01"
                outlined
                dense
                rounded
                label="Preço (MZN) *"
                :rules="[req]"
              />

              <div class="service-period-box rounded-xl">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-snow-muted">Periodicidade</span>
                  <q-toggle v-model="item.periodicity_enabled" color="primary" keep-color dense />
                </div>
                <div class="text-sm font-semibold text-dark-wave mt-1">
                  {{ item.periodicity_enabled ? billingPeriodLabel(item.billing_period) : 'Sem periodicidade' }}
                </div>
              </div>

              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :disable="form.items.length === 1"
                @click="removeServiceLine(idx)"
              />
            </div>
          </div>
          
          <q-select rounded v-model="form.document_type" :options="docTypeOptions" emit-value map-options outlined dense label="Tipo de Documento / Type *" :rules="[req]" />
          
          <!-- Toggle Box Snow White -->
          <div class="wave-soft-surface flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm">
            <div>
              <div class="text-sm font-bold text-dark-wave">Isento de IVA / Tax Exempt</div>
              <div class="text-xs text-snow-muted mt-1">Quando ativo, o imposto fica em 0,00.</div>
            </div>
            <q-toggle v-model="form.is_tax_exempt" color="primary" keep-color />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <q-input rounded v-model="form.issue_date" type="date" label="Emissão / Issue Date *" outlined dense stack-label :rules="[req]" />
            <q-input rounded v-model="form.due_date" type="date" label="Vencimento / Due Date" outlined dense stack-label />
          </div>

          <div class="wave-soft-surface rounded-2xl p-4">
            <div class="text-sm font-bold text-dark-wave">Desconto / Discount</div>
            <div class="text-xs text-snow-muted mt-1">Use a barra de percentagem ou informe o valor. Os dois campos sincronizam automaticamente.</div>

            <div class="discount-grid mt-3">
              <div>
                <div class="text-xs text-snow-muted mb-2">Percentagem de desconto (sobre total com IVA)</div>
                <q-slider
                  v-model.number="form.discount_percent"
                  :min="0"
                  :max="100"
                  :step="0.01"
                  color="primary"
                  track-color="grey-3"
                  @update:model-value="onDiscountPercentChange"
                />
                <q-input
                  v-model.number="form.discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  rounded
                  outlined
                  dense
                  suffix="%"
                  label="Desconto (%)"
                  @update:model-value="onDiscountPercentChange"
                />
              </div>

              <q-input
                v-model.number="form.discount_amount"
                type="number"
                min="0"
                step="0.01"
                rounded
                outlined
                dense
                label="Desconto em valor (MZN)"
                @update:model-value="onDiscountAmountChange"
              />
            </div>
          </div>

          <!-- Totais com fundo levemente destacado -->
          <div class="wave-soft-surface grid grid-cols-4 gap-3 p-4 rounded-2xl">
            <q-input rounded v-model.number="form.subtotal" type="number" min="0" step="0.01" outlined dense label="Subtotal" readonly />
            <q-input rounded v-model.number="form.tax_amount" type="number" min="0" step="0.01" outlined dense :label="`IVA (${vatRatePercentLabel})`" :rules="[req]" readonly />
            <q-input rounded :model-value="totalBeforeDiscount" type="number" min="0" step="0.01" outlined dense label="Total antes desconto" readonly />
            <q-input rounded v-model.number="form.total_amount" type="number" min="0" step="0.01" outlined dense label="Total *" :rules="[req]" readonly class="font-bold" />
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <q-btn flat rounded no-caps label="Cancelar / Cancel" color="grey-7" @click="showCreate = false" :disable="saving" />
            <q-btn unelevated rounded no-caps class="wave-btn-primary px-6" type="submit" label="Guardar / Save" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showSendEmail" size="md" persistent class="wave-modal">
      <div class="p-6 wave-modal-surface rounded-3xl">
        <div class="delivery-modal-head">
          <span class="delivery-modal-icon is-email">
            <AppIcon name="ki-sms" :size="18" />
          </span>
          <div>
            <AppHeading :level="3" class="text-lg font-bold text-dark-wave m-0">Enviar por e-mail</AppHeading>
            <span class="text-xs text-snow-muted">Email delivery with corporate SMTP</span>
          </div>
        </div>

        <q-form ref="sendEmailFormRef" greedy class="flex flex-col gap-4 mt-5" @submit="submitSendEmail">
          <q-input
            v-model="deliveryForm.toEmail"
            type="email"
            outlined
            dense
            rounded
            label="E-mail do destinatário *"
            :rules="[req]"
          />
          <div class="text-xs text-snow-muted">
            O envio usa o e-mail oficial e senha de app configurados em Configurações.
          </div>

          <div class="flex justify-end gap-3 mt-3">
            <q-btn flat rounded no-caps label="Cancelar" @click="showSendEmail = false" :disable="sendingChannel" />
            <q-btn
              unelevated
              rounded
              no-caps
              class="wave-btn-primary px-6"
              type="submit"
              label="Enviar e-mail"
              :loading="sendingChannel"
            />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showSendWhatsApp" size="md" persistent class="wave-modal">
      <div class="p-6 wave-modal-surface rounded-3xl">
        <div class="delivery-modal-head">
          <span class="delivery-modal-icon is-whatsapp">
            <AppIcon name="ki-whatsapp" :size="18" />
          </span>
          <div>
            <AppHeading :level="3" class="text-lg font-bold text-dark-wave m-0">Enviar por WhatsApp</AppHeading>
            <span class="text-xs text-snow-muted">Mensagem bilingue rica e PDF automático</span>
          </div>
        </div>

        <q-form ref="sendWhatsAppFormRef" greedy class="flex flex-col gap-4 mt-5" @submit="submitSendWhatsApp">
          <q-input
            v-model="deliveryForm.toPhone"
            outlined
            dense
            rounded
            label="Número WhatsApp *"
            placeholder="Ex.: +25884xxxxxxx"
            :rules="[req]"
          />
          <div class="text-xs text-snow-muted">
            Vamos gerar o PDF automaticamente e abrir o WhatsApp com mensagem pronta para enviar.
          </div>

          <div class="flex justify-end gap-3 mt-3">
            <q-btn flat rounded no-caps label="Cancelar" @click="showSendWhatsApp = false" :disable="sendingChannel" />
            <q-btn
              unelevated
              rounded
              no-caps
              class="wave-btn-primary px-6"
              type="submit"
              label="Gerar e abrir WhatsApp"
              :loading="sendingChannel"
            />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showReceiptPlan" size="lg" persistent class="wave-modal">
      <div class="p-6 wave-modal-surface rounded-3xl">
        <div class="delivery-modal-head">
          <span class="delivery-modal-icon is-email">
            <AppIcon name="ki-calendar" :size="18" />
          </span>
          <div>
            <AppHeading :level="3" class="text-lg font-bold text-dark-wave m-0">Configurar Avença do Recibo</AppHeading>
            <span class="text-xs text-snow-muted">Periodicidade e envio automático antes de expirar</span>
          </div>
        </div>

        <q-form ref="receiptPlanFormRef" greedy class="flex flex-col gap-4 mt-5" @submit="submitReceiptPlan">
          <q-select
            v-model="receiptPlanForm.receipt_billing_period"
            :options="receiptPeriodOptions"
            emit-value
            map-options
            outlined
            dense
            rounded
            label="Periodicidade da avença *"
            :rules="[req]"
          />

          <div class="wave-soft-surface rounded-2xl px-4 py-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-dark-wave">Envio automático por e-mail</div>
                <div class="text-xs text-snow-muted">Dispara automaticamente para o cliente antes do vencimento.</div>
              </div>
              <q-toggle v-model="receiptPlanForm.auto_send_enabled" color="primary" keep-color />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3" v-if="receiptPlanForm.auto_send_enabled">
            <q-input
              v-model.number="receiptPlanForm.auto_send_days_before_due"
              type="number"
              min="0"
              max="90"
              outlined
              dense
              rounded
              label="Dias antes de expirar *"
              :rules="[(v) => Number(v) >= 0 || 'Valor inválido']"
            />
            <div class="wave-soft-surface rounded-2xl px-4 py-3 flex items-center justify-between">
              <span class="text-sm text-dark-wave font-medium">Anexar PDF da fatura</span>
              <q-toggle v-model="receiptPlanForm.auto_send_include_pdf" color="primary" keep-color />
            </div>
          </div>

          <div class="wave-soft-surface rounded-2xl p-4">
            <div class="text-sm font-bold text-dark-wave">Testar envio agora</div>
            <div class="text-xs text-snow-muted mt-1">Executa um envio imediato para validar HTML moderno e PDF em anexo.</div>
            <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3 mt-3 receipt-test-grid">
              <q-input
                v-model="receiptPlanForm.test_email"
                type="email"
                outlined
                dense
                rounded
                label="E-mail de teste"
                :rules="[req]"
              />
              <q-btn
                outline
                rounded
                no-caps
                color="primary"
                label="Testar agora"
                :loading="testingReceiptPlan"
                @click="testReceiptPlanNow"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-3">
            <q-btn flat rounded no-caps label="Cancelar" @click="showReceiptPlan = false" :disable="savingReceiptPlan" />
            <q-btn
              unelevated
              rounded
              no-caps
              class="wave-btn-primary px-6"
              type="submit"
              label="Guardar Configuração"
              :loading="savingReceiptPlan"
            />
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
import AppIcon from 'src/components/ui/AppIcon.vue'
import { billingDocumentService, financeSystemSettingService } from 'src/services/finance.service'
import { clientService } from 'src/services/client.service'
import { departmentService } from 'src/services/hr.service'
import { serviceCatalogService } from 'src/services/service-catalog.service'
import { useToast } from 'src/composables/useToast'
import {
  buildFinanceDocumentHtml,
  formatDocumentDate,
  formatDocumentMoney,
  openFinancePrintWindow,
} from 'src/utils/financeDocumentPrint'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório / Required'

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const clients = ref([])
const services = ref([])
const departments = ref([])
const companySettings = ref(null)
const vatRatePercent = computed(() => {
  const fromSettings = Number(companySettings.value?.vat_rate_percent)
  if (Number.isFinite(fromSettings)) return Math.min(100, Math.max(0, fromSettings))
  return 16
})
const vatRatePercentLabel = computed(() => `${vatRatePercent.value.toFixed(2).replace('.', ',')}%`)

const columns = [
  { name: 'document_number', label: 'Documento / Document', field: 'document_number', align: 'left' },
  { name: 'document_type_display', label: 'Tipo / Type', field: 'document_type_display', align: 'left' },
  { name: 'issue_date', label: 'Emissão / Issued', field: 'issue_date', align: 'left' },
  { name: 'total_amount', label: 'Total', field: 'total_amount', align: 'right' },
  { name: 'status', label: 'Estado / Status', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const showCreate = ref(false)
const showSendEmail = ref(false)
const showSendWhatsApp = ref(false)
const showReceiptPlan = ref(false)
const sendingChannel = ref(false)
const savingReceiptPlan = ref(false)
const testingReceiptPlan = ref(false)
const selectedDeliveryDoc = ref(null)
const discountEditMode = ref('percent')
const formRef = ref(null)
const sendEmailFormRef = ref(null)
const sendWhatsAppFormRef = ref(null)
const receiptPlanFormRef = ref(null)
const form = reactive({
  client: null,
  department: null,
  items: [],
  document_type: 'invoice',
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  subtotal: 0,
  discount_percent: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  is_tax_exempt: false,
  status: 'pending',
})

const deliveryForm = reactive({
  toEmail: '',
  toPhone: '',
})

const receiptPlanForm = reactive({
  receipt_billing_period: 'monthly',
  auto_send_enabled: false,
  auto_send_days_before_due: 3,
  auto_send_include_pdf: true,
  test_email: '',
})

// Adicionado Bilingue nos tipos de documentos
const docTypeOptions = [
  { value: 'invoice', label: 'Fatura / Invoice' },
  { value: 'receipt', label: 'Recibo / Receipt' },
  { value: 'debit_note', label: 'Nota de Débito / Debit Note' },
  { value: 'credit_note', label: 'Nota de Crédito / Credit Note' },
  { value: 'quotation', label: 'Cotação / Quotation' },
]

const receiptPeriodOptions = [
  { value: 'monthly', label: 'Avença Mensal / Monthly' },
  { value: 'quarterly', label: 'Trimestral / Quarterly' },
  { value: 'annual', label: 'Anual / Annual' },
  { value: 'one_off', label: 'Taxa Única / One-off' },
]

const clientOptions = computed(() => clients.value.map((c) => ({ value: c.id, label: c.name })))
const departmentOptions = computed(() => departments.value.map((d) => ({ value: d.id, label: d.name })))
const serviceOptions = computed(() => services.value.map((s) => ({
  value: s.id,
  label: `${s.name} (${s.sku}) • ${s.billing_period_display || 'Sem periodicidade'}`,
})))
const serviceById = computed(() => new Map(services.value.map((s) => [s.id, s])))
const grossSubtotal = computed(() => roundMoney(form.items.reduce((sum, line) => {
  const qty = Math.max(0, Number(line.quantity || 0))
  const unit = Math.max(0, Number(line.unit_price || 0))
  return sum + (qty * unit)
}, 0)))
const totalBeforeDiscount = computed(() => roundMoney(grossSubtotal.value + Number(form.tax_amount || 0)))

const billingPeriodLabels = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  annual: 'Anual',
  one_off: 'Pagamento Único',
}

function createServiceLine() {
  return {
    service: null,
    quantity: 1,
    unit_price: 0,
    periodicity_enabled: true,
    billing_period: '',
  }
}

function billingPeriodLabel(period) {
  return billingPeriodLabels[period] || 'Sem periodicidade'
}

function recalculateLinesFromCatalog(line) {
  const service = serviceById.value.get(line.service)
  if (!service) return

  const price = Number(service.base_price)
  line.unit_price = Number.isFinite(price) ? roundMoney(price) : 0
  line.billing_period = service.billing_period || ''
}

function addServiceLine() {
  form.items.push(createServiceLine())
}

function removeServiceLine(index) {
  if (form.items.length === 1) return
  form.items.splice(index, 1)
  recalculateBillingTotals()
}

function onServicePicked(index, serviceId) {
  const line = form.items[index]
  if (!line) return
  line.service = serviceId
  recalculateLinesFromCatalog(line)
  recalculateBillingTotals()
}

function money(v) {
  return `${Number(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MZN`
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}

function clampDiscountPercent(value) {
  return Math.min(100, Math.max(0, Number(value || 0)))
}

function clampDiscountAmount(value, gross) {
  const safe = Math.max(0, Number(value || 0))
  return Math.min(gross, safe)
}

function onDiscountPercentChange(value) {
  discountEditMode.value = 'percent'
  form.discount_percent = roundMoney(clampDiscountPercent(value))
  recalculateBillingTotals()
}

function onDiscountAmountChange(value) {
  discountEditMode.value = 'amount'
  form.discount_amount = roundMoney(Math.max(0, Number(value || 0)))
  recalculateBillingTotals()
}

function recalculateBillingTotals() {
  const gross = grossSubtotal.value
  const taxAmount = form.is_tax_exempt ? 0 : roundMoney(gross * (vatRatePercent.value / 100))
  const grossTotal = roundMoney(gross + taxAmount)

  let discountPercent = clampDiscountPercent(form.discount_percent)
  let discountAmount = clampDiscountAmount(form.discount_amount, grossTotal)

  if (discountEditMode.value === 'amount') {
    discountPercent = grossTotal > 0 ? roundMoney((discountAmount / grossTotal) * 100) : 0
  } else {
    discountAmount = roundMoney(grossTotal * (discountPercent / 100))
  }

  const subtotal = roundMoney(gross)
  const totalAmount = roundMoney(Math.max(0, grossTotal - discountAmount))

  form.discount_percent = discountPercent
  form.discount_amount = discountAmount
  form.subtotal = subtotal
  form.tax_amount = roundMoney(taxAmount)
  form.total_amount = totalAmount
}

function statusVariant(status) {
  return {
    pending: 'warning',
    issued: 'info',
    paid: 'success',
    canceled: 'neutral',
  }[status] || 'neutral'
}

function paymentMethodLabel(doc) {
  if (doc.status === 'paid') return 'Liquidado / Paid'
  if (doc.document_type === 'receipt') return 'Recibo / Receipt'
  if (doc.document_type === 'credit_note') return 'Nota de crédito / Credit note'
  if (doc.document_type === 'quotation') return 'Cotação / Quotation'
  return 'A liquidar / To be paid'
}

function buildPaymentBlocks(cfg) {
  const wallets = Array.isArray(cfg.mobile_wallets) ? cfg.mobile_wallets : []
  const banks = Array.isArray(cfg.bank_accounts) ? cfg.bank_accounts : []
  const blocks = []

  wallets.forEach((wallet) => {
    blocks.push({
      titlePt: `Carteira ${wallet.provider === 'mpesa' ? 'móvel' : 'digital'}`,
      titleEn: 'Mobile wallet',
      name: wallet.provider === 'mpesa' ? 'M-Pesa' : 'e-Mola',
      detail: [wallet.registered_name, wallet.phone_number].filter(Boolean).join(' · '),
    })
  })

  banks.forEach((bank) => {
    blocks.push({
      titlePt: 'Conta bancária',
      titleEn: 'Bank account',
      name: bank.bank_name || 'Banco',
      detail: [bank.account_holder, bank.account_number, bank.nib ? `NIB ${bank.nib}` : ''].filter(Boolean).join(' · '),
    })
  })

  return blocks
}

function buildBillingDocumentHtml(doc) {
  const cfg = companySettings.value || {}
  const docTypeMap = {
    invoice: ['Fatura', 'Invoice', '#2563eb'],
    receipt: ['Recibo', 'Receipt', '#10b981'],
    debit_note: ['Nota de débito', 'Debit note', '#f59e0b'],
    credit_note: ['Nota de crédito', 'Credit note', '#0f766e'],
    quotation: ['Cotação', 'Quotation', '#7c3aed'],
  }
  const effectiveDocumentType = doc.status === 'paid' ? 'receipt' : doc.document_type
  const [titlePt, titleEn, accent] = docTypeMap[effectiveDocumentType] || ['Documento', 'Document', '#2563eb']
  const paymentBlocks = buildPaymentBlocks(cfg)
  const taxRate = Number(doc.subtotal || 0) > 0 ? `${(((Number(doc.tax_amount || 0) / Number(doc.subtotal || 1)) * 100) || 0).toFixed(0)}%` : '—'
  const computedTaxRate = doc.is_tax_exempt ? 'Isento' : taxRate
  const compactContact = [
    doc.client_contact_name,
    doc.client_contact_phone,
    doc.client_contact_email,
  ].filter(Boolean).join(' | ')
  const clientDetails = [
    doc.client_nuit ? `NUIT ${doc.client_nuit}` : '',
    doc.client_address || '',
    compactContact ? `Contacto: ${compactContact}` : '',
  ].filter(Boolean)
  const totalBeforeDiscount = roundMoney(Number(doc.subtotal || 0) + Number(doc.tax_amount || 0))

  return buildFinanceDocumentHtml({
    company: cfg,
    accent,
    document: {
      title: `${titlePt} ${doc.document_number || ''}`.trim(),
      number: doc.document_number || 'A gerar',
      operator: paymentMethodLabel(doc),
    },
    hero: {
      kickerPt: 'Documento financeiro',
      kickerEn: 'Financial document',
      titlePt,
      titleEn,
    },
    counterparty: {
      labelPt: 'Faturado a',
      labelEn: 'Billed to',
      value: doc.client_name || 'Consumidor final',
      details: clientDetails,
    },
    metaCards: [
      { labelPt: 'Emissão', labelEn: 'Issue date', value: formatDocumentDate(doc.issue_date) },
      { labelPt: 'Vencimento', labelEn: 'Due date', value: formatDocumentDate(doc.due_date) },
      { labelPt: 'Estado', labelEn: 'Status', value: doc.status_display || doc.status || '—' },
    ],
    lineTable: {
      columns: [
        { key: 'qty', labelPt: 'Qtd', labelEn: 'Qty' },
        { key: 'desc', labelPt: 'Descrição', labelEn: 'Description' },
        { key: 'tax', labelPt: 'IVA', labelEn: 'VAT', align: 'right' },
        { key: 'unit', labelPt: 'P. Unit', labelEn: 'Unit price', align: 'right' },
        { key: 'total', labelPt: 'Total', labelEn: 'Total', align: 'right' },
      ],
      rows: (Array.isArray(doc.items) && doc.items.length ? doc.items : [{
        quantity: '1.000',
        service_name_snapshot: doc.service_name || titlePt,
        service_sku_snapshot: doc.service_sku || '',
        periodicity_enabled: true,
        billing_period: '',
        unit_price: doc.subtotal,
        line_total: doc.total_amount,
      }]).map((item) => ({
        qty: Number(item.quantity || 1).toFixed(3),
        desc: [
          item.service_name_snapshot || item.service_name || '',
          item.service_sku_snapshot || item.service_sku || '',
          item.periodicity_enabled && item.billing_period ? `Periodicidade: ${billingPeriodLabel(item.billing_period)}` : '',
        ].filter(Boolean).join(' • '),
        tax: computedTaxRate,
        unit: formatDocumentMoney(item.unit_price),
        total: formatDocumentMoney(item.line_total || (Number(item.quantity || 0) * Number(item.unit_price || 0))),
      })),
    },
    paymentBlocks,
    totals: [
      { labelPt: 'Subtotal', labelEn: 'Subtotal', value: formatDocumentMoney(doc.subtotal) },
      { labelPt: 'IVA / imposto', labelEn: 'VAT / tax', value: formatDocumentMoney(doc.tax_amount) },
      { labelPt: 'Total antes desconto', labelEn: 'Total before discount', value: formatDocumentMoney(totalBeforeDiscount) },
      { labelPt: 'Desconto', labelEn: 'Discount', value: formatDocumentMoney(doc.discount_amount || 0) },
      { labelPt: 'Total do documento', labelEn: 'Document total', value: formatDocumentMoney(doc.total_amount), highlight: true },
    ],
    notes: cfg.payment_instructions ? [cfg.payment_instructions] : [],
    footerNote: 'Documento emitido pelo PLUSE com identidade corporativa bilingue para impressão, arquivo e partilha com clientes.',
  })
}

async function openBillingDocument(row, mode = 'print', options = {}) {
  const { silent = false, existingWindow = null } = options
  try {
    const [doc, settingsData] = await Promise.all([
      billingDocumentService.get(row.id),
      companySettings.value ? Promise.resolve(companySettings.value) : financeSystemSettingService.get().catch(() => null),
    ])
    companySettings.value = settingsData
    return openFinancePrintWindow({
      title: `${doc.document_type_display || 'Documento'} ${doc.document_number || ''}`.trim(),
      html: buildBillingDocumentHtml(doc),
      mode,
      toast,
      existingWindow,
    })
  } catch (err) {
    if (!silent) {
      toast.error('Não foi possível gerar o documento.', {
        caption: err?.response?.data?.detail || err?.message,
      })
    }
    return false
  }
}

function exportDocumentPdf(row) {
  openBillingDocument(row, 'pdf')
}

function printDocument(row) {
  openBillingDocument(row, 'print')
}

function openSendEmailModal(row) {
  selectedDeliveryDoc.value = row
  deliveryForm.toEmail = row?.client_contact_email || ''
  showSendEmail.value = true
}

function openSendWhatsAppModal(row) {
  selectedDeliveryDoc.value = row
  deliveryForm.toPhone = row?.client_contact_phone || ''
  showSendWhatsApp.value = true
}

function openReceiptPlanModal(row) {
  selectedDeliveryDoc.value = row
  receiptPlanForm.receipt_billing_period = row?.receipt_billing_period || 'monthly'
  receiptPlanForm.auto_send_enabled = Boolean(row?.auto_send_enabled)
  receiptPlanForm.auto_send_days_before_due = Number(row?.auto_send_days_before_due ?? 3)
  receiptPlanForm.auto_send_include_pdf = Boolean(row?.auto_send_include_pdf ?? true)
  receiptPlanForm.test_email = row?.client_contact_email || ''
  showReceiptPlan.value = true
}

async function submitReceiptPlan() {
  if (!(await receiptPlanFormRef.value?.validate())) return
  const doc = selectedDeliveryDoc.value
  if (!doc?.id) return

  savingReceiptPlan.value = true
  try {
    await billingDocumentService.configureReceiptPlan(doc.id, {
      receipt_billing_period: receiptPlanForm.receipt_billing_period,
      auto_send_enabled: Boolean(receiptPlanForm.auto_send_enabled),
      auto_send_days_before_due: Number(receiptPlanForm.auto_send_days_before_due || 0),
      auto_send_include_pdf: Boolean(receiptPlanForm.auto_send_include_pdf),
    })
    toast.success('Configuração de avença guardada.')
    showReceiptPlan.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao guardar configuração da avença.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  } finally {
    savingReceiptPlan.value = false
  }
}

async function testReceiptAutoEmailFromRow(row) {
  if (!row?.id) return

  testingReceiptPlan.value = true
  try {
    const payload = await billingDocumentService.testAutoEmail(row.id, {
      to_email: String(row.client_contact_email || '').trim(),
    })
    toast.success('Teste de auto envio enviado.', {
      caption: payload?.recipient || String(row.client_contact_email || '').trim(),
    })
  } catch (err) {
    toast.error('Falha ao testar auto envio.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  } finally {
    testingReceiptPlan.value = false
  }
}

async function testReceiptPlanNow() {
  const doc = selectedDeliveryDoc.value
  if (!doc?.id) return

  testingReceiptPlan.value = true
  try {
    const payload = await billingDocumentService.testAutoEmail(doc.id, {
      to_email: String(receiptPlanForm.test_email || '').trim(),
    })
    toast.success('Teste de auto envio enviado.', {
      caption: payload?.recipient || String(receiptPlanForm.test_email || '').trim(),
    })
  } catch (err) {
    toast.error('Falha ao testar auto envio.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  } finally {
    testingReceiptPlan.value = false
  }
}

async function submitSendEmail() {
  if (!(await sendEmailFormRef.value?.validate())) return
  const doc = selectedDeliveryDoc.value
  if (!doc?.id) return

  sendingChannel.value = true
  try {
    const payload = await billingDocumentService.sendEmail(doc.id, {
      to_email: String(deliveryForm.toEmail || '').trim(),
    })
    toast.success('Documento enviado por e-mail.', {
      caption: payload?.recipient || String(deliveryForm.toEmail || '').trim(),
    })
    showSendEmail.value = false
  } catch (err) {
    toast.error('Falha ao enviar e-mail.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  } finally {
    sendingChannel.value = false
  }
}

async function submitSendWhatsApp() {
  if (!(await sendWhatsAppFormRef.value?.validate())) return
  const doc = selectedDeliveryDoc.value
  if (!doc?.id) return

  const whatsappTab = window.open('', '_blank')
  const pdfTab = window.open('', '_blank')

  if (whatsappTab?.document) {
    whatsappTab.document.write('<!doctype html><html><head><title>Abrindo WhatsApp...</title></head><body style="font-family:system-ui;padding:16px">A preparar envio por WhatsApp...</body></html>')
    whatsappTab.document.close()
  }
  if (pdfTab?.document) {
    pdfTab.document.write('<!doctype html><html><head><title>Gerando PDF...</title></head><body style="font-family:system-ui;padding:16px">A gerar pré-visualização para PDF...</body></html>')
    pdfTab.document.close()
  }

  sendingChannel.value = true
  try {
    const payload = await billingDocumentService.sendWhatsApp(doc.id, {
      to_phone: String(deliveryForm.toPhone || '').trim(),
    })

    const pdfOpened = await openBillingDocument(doc, 'pdf', { silent: true, existingWindow: pdfTab })

    if (payload?.message && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload.message)
      } catch {
        // Clipboard pode falhar por permissões do navegador.
      }
    }

    if (payload?.whatsapp_url) {
      if (whatsappTab) {
        whatsappTab.location.href = payload.whatsapp_url
      } else {
        window.open(payload.whatsapp_url, '_blank')
      }
    } else if (whatsappTab) {
      whatsappTab.close()
    }

    if (!pdfOpened) {
      if (pdfTab) pdfTab.close()
      toast.info('WhatsApp aberto. Não foi possível abrir a impressão automática do PDF neste navegador.')
    }

    toast.success('WhatsApp pronto para envio.', {
      caption: 'Mensagem PT/ING pronta. Se necessário, use Ctrl+V na conversa.',
    })
    showSendWhatsApp.value = false
  } catch (err) {
    if (whatsappTab) whatsappTab.close()
    if (pdfTab) pdfTab.close()
    toast.error('Falha ao preparar envio por WhatsApp.', {
      caption: err?.response?.data?.detail || err?.message,
    })
  } finally {
    sendingChannel.value = false
  }
}

function openCreate() {
  Object.assign(form, {
    client: null,
    department: null,
    items: [createServiceLine()],
    document_type: 'invoice',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    subtotal: 0,
    discount_percent: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 0,
    is_tax_exempt: false,
    status: 'pending',
  })
  recalculateBillingTotals()
  showCreate.value = true
}

async function fetchRows() {
  loading.value = true
  try {
    const [docsData, clientData, servicesData, departmentsData, settingsData] = await Promise.all([
      billingDocumentService.list({ page_size: 300 }),
      clientService.list({ page_size: 300 }),
      serviceCatalogService.list({ page_size: 300, is_published: true, status: 'active' }),
      departmentService.list({ page_size: 200, is_active: true }),
      financeSystemSettingService.get().catch(() => null),
    ])
    rows.value = docsData?.results ?? docsData ?? []
    clients.value = clientData?.results ?? clientData ?? []
    services.value = servicesData?.results ?? servicesData ?? []
    departments.value = departmentsData?.results ?? departmentsData ?? []
    companySettings.value = settingsData
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  if (!(await formRef.value?.validate())) return
  recalculateBillingTotals()
  if (!form.items.length || form.items.some((item) => !item.service)) {
    toast.error('Adicione pelo menos um serviço válido no documento.')
    return
  }
  const expectedTotal = roundMoney(
    Number(form.subtotal || 0) + Number(form.tax_amount || 0) - Number(form.discount_amount || 0),
  )
  if (Math.abs(expectedTotal - Number(form.total_amount || 0)) > 0.01) {
    toast.error('Total deve ser igual a (subtotal + imposto) - desconto.')
    return
  }
  saving.value = true
  try {
    await billingDocumentService.create({
      ...form,
      due_date: form.due_date || null,
      department: form.department || null,
      discount_percent: Number(form.discount_percent || 0),
      discount_amount: Number(form.discount_amount || 0),
      service: form.items[0]?.service || null,
      items: form.items.map((item) => ({
        service: item.service,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price || 0),
        periodicity_enabled: Boolean(item.periodicity_enabled),
        billing_period: item.periodicity_enabled ? item.billing_period : '',
      })),
    })
    toast.success('Documento criado com sucesso.')
    showCreate.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível criar o documento.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

async function issueDoc(row) {
  try {
    await billingDocumentService.issue(row.id)
    toast.success('Documento emitido e contabilizado.')
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao emitir documento.', { caption: err?.response?.data?.detail })
  }
}

async function markPaid(row) {
  try {
    await billingDocumentService.markPaid(row.id)
    toast.success('Documento marcado como pago.')
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao marcar pagamento.', { caption: err?.response?.data?.detail })
  }
}

async function cancelDoc(row) {
  try {
    await billingDocumentService.cancel(row.id)
    toast.success('Documento anulado.')
    await fetchRows()
  } catch (err) {
    toast.error('Falha ao anular documento.', { caption: err?.response?.data?.detail })
  }
}

onMounted(fetchRows)

watch(() => form.items, () => recalculateBillingTotals(), { deep: true })
watch(() => form.is_tax_exempt, () => recalculateBillingTotals())
watch(vatRatePercent, () => recalculateBillingTotals())
</script>

<style scoped>
/* =========================================
   ESTILOS SNOW WHITE & WAVE 
   ========================================= */

/* Variáveis de cor suaves */
.text-dark-wave { color: var(--pluse-table-text); } /* Adapta por tema */
.text-snow-muted { color: var(--pluse-table-muted); } /* Adapta por tema */

.wave-modal-surface {
  background: transparent;
}

.wave-soft-surface {
  border: 1px solid var(--pluse-wave-soft-border);
  background: color-mix(in oklab, var(--card) 94%, var(--muted) 6%);
}

.delivery-modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-modal-icon {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.delivery-modal-icon.is-email {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}

.delivery-modal-icon.is-whatsapp {
  background: color-mix(in oklab, var(--pluse-emerald-500) 14%, transparent);
  color: var(--pluse-emerald-500);
}

.service-line-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(100px, 0.55fr) minmax(130px, 0.75fr) minmax(200px, 0.9fr) auto;
  gap: 10px;
  align-items: center;
}

.service-period-box {
  border: 1px solid var(--pluse-wave-soft-border);
  padding: 8px 10px;
  background: color-mix(in oklab, var(--card) 95%, var(--muted) 5%);
}

.discount-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 12px;
  align-items: end;
}

@media (max-width: 980px) {
  .service-line-grid {
    grid-template-columns: 1fr;
  }

  .discount-grid {
    grid-template-columns: 1fr;
  }
}

/* Card Principal - Efeito Nuvem/Onda */
.pluse-wave-card {
  background: var(--pluse-wave-card-bg);
  border-radius: 24px;
  box-shadow: var(--pluse-wave-shadow); /* Sombra difusa e elegante */
  overflow: hidden;
  border: 1px solid var(--pluse-wave-soft-border);
}

/* Tabela Leve - Sem bordas laterais, hover suave */
.pluse-light-table {
  background: transparent;
}
:deep(.pluse-light-table thead tr th) {
  background-color: color-mix(in oklab, var(--pluse-table-head-bg) 86%, transparent); /* Fundo cinza ultraleve */
  color: var(--pluse-table-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  border-bottom: none !important;
  padding: 16px 24px;
}
:deep(.pluse-light-table tbody tr td) {
  border-bottom: 1px solid var(--pluse-table-row-border) !important; /* Linha divisória quase invisível */
  padding: 16px 24px;
  transition: background-color 0.3s ease;
}
:deep(.pluse-light-table tbody tr:hover td) {
  background-color: var(--pluse-table-row-hover); /* Efeito Wave ao passar o rato */
}

/* Botões Globais Wave */
.wave-btn-primary {
  background: linear-gradient(135deg, var(--q-primary) 0%, #3b82f6 100%);
  border-radius: 50px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.wave-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.35);
}

/* Tooltips */
.wave-tooltip {
  background: #1e293b;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 0.75rem;
}

/* Alinhamento de Ações na tabela */
.doc-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
}
.doc-actions .q-btn {
  background: var(--pluse-action-bg); /* Fundo arredondado suave por trás do ícone */
  transition: all 0.2s;
}
.doc-actions .q-btn:hover {
  background: var(--pluse-action-bg-hover);
  transform: scale(1.05);
}
</style>
