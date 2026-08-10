<template>
  <AdminPageTemplate
    eyebrow="Administração"
    title="Configurações do sistema"
    description="Identidade corporativa, preferências, impressoras, dados financeiros e segurança operacional."
  >
    <div class="settings-shell">
      <aside class="settings-nav">
        <button
          v-for="item in sections"
          :key="item.id"
          type="button"
          class="settings-nav-item"
          :class="{ 'settings-nav-item--active': activeSection === item.id }"
          @click="activeSection = item.id"
        >
          <q-icon :name="item.icon" size="18px" />
          <span>{{ item.label }}</span>
        </button>
      </aside>

      <section class="settings-content">
        <div v-show="activeSection === 'identity'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Identidade corporativa</h2>
            <p>Dados oficiais usados em faturas, recibos e relatórios.</p>
          </header>

          <div class="settings-grid two-col">
            <q-input v-model="form.legalName" outlined dense label="Nome legal da empresa" />
            <q-input v-model="form.tradeName" outlined dense label="Nome comercial" />
            <q-input v-model="form.nuit" outlined dense label="NUIT" />
            <q-input v-model="form.postalCode" outlined dense label="Código postal" />
            <q-input
              v-model="form.address"
              outlined
              dense
              label="Endereço físico completo"
              class="span-2"
            />
            <q-input v-model="form.email" outlined dense label="E-mail oficial" type="email" />
            <q-input v-model="form.phone1" outlined dense label="Telefone 1" />
            <q-input v-model="form.phone2" outlined dense label="Telefone 2" />
          </div>

          <div class="upload-grid">
            <div
              class="upload-box"
              @dragover.prevent
              @drop.prevent="onDropUpload('logo', $event)"
              @click="pickUpload('logo')"
            >
              <input
                ref="logoInputRef"
                type="file"
                accept="image/*"
                class="hidden-file"
                @change="onPickUpload('logo', $event)"
              />
              <template v-if="uploads.logo.previewUrl">
                <img :src="uploads.logo.previewUrl" alt="Preview do logotipo" class="upload-preview" />
                <small>{{ uploads.logo.fileName }}</small>
                <div class="upload-actions" @click.stop>
                  <q-btn flat dense no-caps size="sm" icon="sync" label="Substituir" @click="pickUpload('logo')" />
                  <q-btn flat dense no-caps size="sm" color="negative" icon="delete" label="Remover" @click="removeUpload('logo')" />
                </div>
              </template>
              <template v-else>
                <q-icon name="image" size="26px" />
                <strong>Logotipo</strong>
                <span>Arraste ou clique para carregar</span>
              </template>
            </div>

            <div
              class="upload-box"
              @dragover.prevent
              @drop.prevent="onDropUpload('stamp', $event)"
              @click="pickUpload('stamp')"
            >
              <input
                ref="stampInputRef"
                type="file"
                accept="image/*"
                class="hidden-file"
                @change="onPickUpload('stamp', $event)"
              />
              <template v-if="uploads.stamp.previewUrl">
                <img :src="uploads.stamp.previewUrl" alt="Preview do carimbo" class="upload-preview" />
                <small>{{ uploads.stamp.fileName }}</small>
                <div class="upload-actions" @click.stop>
                  <q-btn flat dense no-caps size="sm" icon="sync" label="Substituir" @click="pickUpload('stamp')" />
                  <q-btn flat dense no-caps size="sm" color="negative" icon="delete" label="Remover" @click="removeUpload('stamp')" />
                </div>
              </template>
              <template v-else>
                <q-icon name="approval" size="26px" />
                <strong>Carimbo digital</strong>
                <span>Recomendado: PNG transparente</span>
              </template>
            </div>

            <div
              class="upload-box"
              @dragover.prevent
              @drop.prevent="onDropUpload('signature', $event)"
              @click="pickUpload('signature')"
            >
              <input
                ref="signatureInputRef"
                type="file"
                accept="image/*"
                class="hidden-file"
                @change="onPickUpload('signature', $event)"
              />
              <template v-if="uploads.signature.previewUrl">
                <img :src="uploads.signature.previewUrl" alt="Preview da assinatura" class="upload-preview" />
                <small>{{ uploads.signature.fileName }}</small>
                <div class="upload-actions" @click.stop>
                  <q-btn flat dense no-caps size="sm" icon="sync" label="Substituir" @click="pickUpload('signature')" />
                  <q-btn flat dense no-caps size="sm" color="negative" icon="delete" label="Remover" @click="removeUpload('signature')" />
                </div>
              </template>
              <template v-else>
                <q-icon name="draw" size="26px" />
                <strong>Assinatura do diretor</strong>
                <span>Assinatura digitalizada para contratos</span>
              </template>
            </div>
          </div>
        </div>

        <div v-show="activeSection === 'preferences'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Preferências de sistema</h2>
            <p>Localização, formato e comportamento visual do software.</p>
          </header>

          <div class="settings-grid two-col">
            <q-select
              v-model="form.language"
              outlined
              dense
              emit-value
              map-options
              :options="languageOptions"
              label="Idioma"
            />
            <q-select
              v-model="form.timezone"
              outlined
              dense
              emit-value
              map-options
              :options="timezoneOptions"
              label="Fuso horário"
            />
            <q-select
              v-model="form.dateFormat"
              outlined
              dense
              emit-value
              map-options
              :options="dateFormatOptions"
              label="Formato de data"
            />
            <q-select
              v-model="form.currency"
              outlined
              dense
              emit-value
              map-options
              :options="currencyOptions"
              label="Moeda padrão"
            />
          </div>

          <div class="theme-row">
            <div>
              <strong>Tema da interface</strong>
              <p>Ative o modo escuro para operação noturna no CCO.</p>
            </div>
            <div class="theme-toggle">
              <span :class="{ muted: isDark }">Claro</span>
              <AppSwitch :model-value="isDark" aria-label="Alternar tema" @update:model-value="toggleDark" />
              <span :class="{ muted: !isDark }">Escuro</span>
            </div>
          </div>
        </div>

        <div v-show="activeSection === 'printers'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Gestão de impressoras</h2>
            <p>Atribuição de documentos para impressora A4 e impressora térmica.</p>
          </header>

          <div class="printer-row">
            <div class="printer-main">
              <h3>Impressora A4</h3>
              <p>Faturas, contratos, balancetes e relatórios disciplinares.</p>
              <q-select
                v-model="form.printerA4"
                outlined
                dense
                emit-value
                map-options
                :options="printerOptions"
                label="Selecionar impressora A4"
              />
            </div>
            <q-btn outline no-caps icon="print" label="Imprimir página de teste A4" @click="runPrinterTest('a4')" />
          </div>

          <div class="printer-row">
            <div class="printer-main">
              <h3>Impressora térmica</h3>
              <p>Recibos de pagamento e talões de justificação.</p>
              <q-select
                v-model="form.printerThermal"
                outlined
                dense
                emit-value
                map-options
                :options="printerOptions"
                label="Selecionar impressora térmica"
              />
              <div class="paper-toggle">
                <span :class="{ muted: form.thermalPaper === '80mm' }">58mm</span>
                <AppSwitch
                  :model-value="form.thermalPaper === '80mm'"
                  aria-label="Alternar largura do papel térmico"
                  @update:model-value="togglePaper"
                />
                <span :class="{ muted: form.thermalPaper === '58mm' }">80mm</span>
              </div>
            </div>
            <q-btn outline no-caps icon="content_cut" label="Testar corte de papel" @click="runPrinterTest('thermal')" />
          </div>
        </div>

        <div v-show="activeSection === 'finance'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Financeiro, bancos e carteiras móveis</h2>
            <p>Dados de recebimento para clientes e instruções de pagamento.</p>
          </header>

          <q-card flat bordered class="bank-card pluse-card">
            <div class="bank-card-head">
              <h3>Contas bancárias</h3>
              <q-btn unelevated color="primary" no-caps icon="add" label="Adicionar conta" @click="showBankModal = true" />
            </div>
            <q-table
              flat
              dense
              class="pluse-light-table"
              :rows="bankRows"
              :columns="bankColumns"
              row-key="id"
              no-data-label="Nenhuma conta registada."
            />
          </q-card>

          <div class="wallet-grid">
            <q-card flat bordered class="wallet-card pluse-card">
              <div class="wallet-title">
                <q-icon name="smartphone" />
                <strong>M-Pesa</strong>
              </div>
              <q-input v-model="form.mpesaName" outlined dense label="Nome registado" />
              <q-input v-model="form.mpesaNumber" outlined dense label="Número do telemóvel" />
            </q-card>

            <q-card flat bordered class="wallet-card pluse-card">
              <div class="wallet-title">
                <q-icon name="account_balance_wallet" />
                <strong>e-Mola</strong>
              </div>
              <q-input v-model="form.emolaName" outlined dense label="Nome registado" />
              <q-input v-model="form.emolaNumber" outlined dense label="Número do telemóvel" />
            </q-card>
          </div>

          <div class="settings-grid two-col">
            <q-input
              v-model.number="form.vatRatePercent"
              outlined
              dense
              type="number"
              min="0"
              max="100"
              step="0.01"
              label="Taxa de IVA (%)"
              hint="Ex.: 16 para 16%"
            />
          </div>

          <q-input
            v-model="form.paymentInstructions"
            outlined
            type="textarea"
            autogrow
            label="Instruções de pagamento"
            placeholder="Os pagamentos devem ser efetuados até ao dia 5 de cada mês..."
          />

          <q-card flat bordered class="pluse-card">
            <div class="bank-card-head">
              <h3>Envio de faturas por e-mail e WhatsApp</h3>
            </div>
            <div class="settings-grid two-col px-3 pb-3">
              <q-input v-model="form.smtpHost" outlined dense label="Servidor SMTP" placeholder="smtp.gmail.com" />
              <q-input v-model.number="form.smtpPort" type="number" outlined dense label="Porta SMTP" />
              <q-input v-model="form.smtpUsername" outlined dense label="Utilizador SMTP" placeholder="empresa@dominio.com" />
              <q-input
                v-model="form.smtpAppPassword"
                outlined
                dense
                type="password"
                autocomplete="new-password"
                label="Senha de app (SMTP)"
                :hint="form.smtpAppPasswordConfigured ? 'Senha já configurada. Preencha apenas se quiser atualizar.' : 'Obrigatório para envio de e-mail.'"
              />
              <q-input
                v-model="form.whatsappDefaultCountryCode"
                outlined
                dense
                label="Código país WhatsApp"
                placeholder="258"
              />
              <div class="theme-toggle justify-between rounded-xl border border-[var(--border)] px-3 py-2">
                <span>Usar TLS no SMTP</span>
                <AppSwitch v-model="form.smtpUseTls" aria-label="Alternar TLS SMTP" />
              </div>
            </div>
          </q-card>
        </div>

        <div v-show="activeSection === 'security'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Acessos e segurança</h2>
            <p>Controlo de sessão, 2FA, auditoria e backups locais.</p>
          </header>

          <div class="security-row">
            <div>
              <strong>Tempo limite de inatividade (auto-logout)</strong>
              <p>{{ form.autoLogoutMinutes }} minutos</p>
            </div>
            <q-slider
              v-model="form.autoLogoutMinutes"
              :min="5"
              :max="120"
              :step="5"
              label
              switch-label-side
              style="max-width: 340px"
            />
          </div>

          <div class="security-row">
            <div>
              <strong>Exigir autenticação de dois fatores (2FA)</strong>
              <p>Aplicado a Diretor Financeiro e Administrador.</p>
            </div>
            <AppSwitch v-model="form.require2fa" aria-label="Alternar 2FA obrigatório" />
          </div>

          <div class="security-actions">
            <q-btn
              outline
              no-caps
              icon="download"
              label="Exportar registo de atividades (Logs)"
              @click="exportLogs"
            />
            <q-btn
              outline
              no-caps
              icon="backup"
              label="Criar backup local agora"
              @click="runLocalBackup"
            />
          </div>
        </div>

        <div v-show="activeSection === 'security-levels'" class="settings-panel">
          <header class="settings-panel-head">
            <h2>Níveis de segurança por aba</h2>
            <p>
              Marque ou desmarque o acesso para cada nível: Operacional, Tático e Estratégico.
            </p>
          </header>

          <q-card flat bordered class="security-levels-card pluse-card">
            <q-table
              :rows="securityTabRows"
              :columns="securityTabColumns"
              row-key="tabKey"
              flat
              dense
              class="pluse-light-table"
              :pagination="{ rowsPerPage: 0 }"
              no-data-label="Sem abas configuráveis."
            >
              <template #body-cell-tabLabel="props">
                <q-td :props="props">
                  <div class="tab-label-cell">
                    <strong>{{ props.row.tabLabel }}</strong>
                    <small>{{ props.row.tabRoute || 'Sem rota' }}</small>
                  </div>
                </q-td>
              </template>

              <template #body-cell-operationalEnabled="props">
                <q-td :props="props" class="text-center">
                  <q-checkbox v-model="props.row.operationalEnabled" dense />
                </q-td>
              </template>

              <template #body-cell-tacticalEnabled="props">
                <q-td :props="props" class="text-center">
                  <q-checkbox v-model="props.row.tacticalEnabled" dense />
                </q-td>
              </template>

              <template #body-cell-strategicEnabled="props">
                <q-td :props="props" class="text-center">
                  <q-checkbox v-model="props.row.strategicEnabled" dense />
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </section>
    </div>

    <div class="settings-action-bar">
      <q-btn flat no-caps label="Cancelar" :disable="saving" @click="onCancel" />
      <q-btn
        unelevated
        color="positive"
        no-caps
        icon="save"
        label="Guardar alterações"
        :loading="saving"
        @click="onSave"
      />
    </div>

    <q-dialog v-model="showBankModal">
      <q-card class="pluse-card" style="width: 560px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Adicionar conta bancária</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="settings-grid two-col">
            <q-input v-model="bankForm.bankName" outlined dense label="Nome do banco" />
            <q-input v-model="bankForm.accountHolder" outlined dense label="Titular da conta" />
            <q-input v-model="bankForm.accountNumber" outlined dense label="Número da conta" />
            <q-input v-model="bankForm.nib" outlined dense label="NIB" />
            <q-input v-model="bankForm.swift" outlined dense label="Swift Code" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn unelevated color="primary" no-caps label="Adicionar" @click="addBankAccount" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </AdminPageTemplate>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppSwitch from 'src/components/ui/AppSwitch.vue'
import { useTheme } from 'src/composables/useTheme'
import { useToast } from 'src/composables/useToast'
import { sidebarMenu } from 'src/config/sidebar-menu'
import { financeSystemSettingService } from 'src/services/finance.service'

const toast = useToast()
const { isDark, toggleDark } = useTheme()

const sections = [
  { id: 'identity', label: 'Identidade', icon: 'business' },
  { id: 'preferences', label: 'Preferências', icon: 'tune' },
  { id: 'printers', label: 'Impressoras', icon: 'print' },
  { id: 'finance', label: 'Financeiro', icon: 'account_balance' },
  { id: 'security', label: 'Segurança', icon: 'verified_user' },
  { id: 'security-levels', label: 'Níveis de segurança', icon: 'fact_check' },
]

const activeSection = ref('identity')
const saving = ref(false)
const showBankModal = ref(false)

const languageOptions = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
]
const timezoneOptions = [
  { label: 'GMT+2 Maputo', value: 'Africa/Maputo' },
  { label: 'GMT+1 Luanda', value: 'Africa/Luanda' },
  { label: 'UTC', value: 'UTC' },
]
const dateFormatOptions = [
  { label: 'DD/MM/AAAA', value: 'DD/MM/YYYY' },
  { label: 'AAAA-MM-DD', value: 'YYYY-MM-DD' },
]
const currencyOptions = [
  { label: 'MZN - Metical', value: 'MZN' },
  { label: 'USD - Dólar', value: 'USD' },
]

const printerOptions = ref([
  { label: 'Microsoft Print to PDF', value: 'pdf' },
  { label: 'HP LaserJet A4', value: 'hp-laserjet' },
  { label: 'EPSON TM-T20III', value: 'epson-tm' },
])

const form = reactive({
  legalName: '',
  tradeName: '',
  nuit: '',
  address: '',
  postalCode: '',
  email: '',
  phone1: '',
  phone2: '',
  language: 'pt',
  timezone: 'Africa/Maputo',
  dateFormat: 'DD/MM/YYYY',
  currency: 'MZN',
  printerA4: 'hp-laserjet',
  printerThermal: 'epson-tm',
  thermalPaper: '80mm',
  mpesaName: '',
  mpesaNumber: '',
  emolaName: '',
  emolaNumber: '',
  vatRatePercent: 16,
  paymentInstructions: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpAppPassword: '',
  smtpAppPasswordConfigured: false,
  smtpUseTls: true,
  whatsappDefaultCountryCode: '258',
  autoLogoutMinutes: 15,
  require2fa: false,
})

const bankRows = ref([])
const bankColumns = [
  { name: 'bankName', label: 'Banco', field: 'bankName', align: 'left' },
  { name: 'accountHolder', label: 'Titular', field: 'accountHolder', align: 'left' },
  { name: 'accountNumber', label: 'N.º Conta', field: 'accountNumber', align: 'left' },
  { name: 'nib', label: 'NIB', field: 'nib', align: 'left' },
  { name: 'swift', label: 'Swift', field: 'swift', align: 'left' },
]

const bankForm = reactive({
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  nib: '',
  swift: '',
})

const securityTabColumns = [
  { name: 'tabLabel', label: 'Aba', field: 'tabLabel', align: 'left' },
  { name: 'operationalEnabled', label: 'Operacional', field: 'operationalEnabled', align: 'center' },
  { name: 'tacticalEnabled', label: 'Tático', field: 'tacticalEnabled', align: 'center' },
  { name: 'strategicEnabled', label: 'Estratégico', field: 'strategicEnabled', align: 'center' },
]
const securityTabRows = ref([])

const logoInputRef = ref(null)
const stampInputRef = ref(null)
const signatureInputRef = ref(null)
const uploads = reactive({
  logo: { file: null, fileName: '', previewUrl: '', blobUrl: '', storedUrl: '', markedForRemoval: false },
  stamp: { file: null, fileName: '', previewUrl: '', blobUrl: '', storedUrl: '', markedForRemoval: false },
  signature: { file: null, fileName: '', previewUrl: '', blobUrl: '', storedUrl: '', markedForRemoval: false },
})

const desktop = typeof window !== 'undefined' ? window.pluseDesktop : null
const snapshot = ref('')

function extractErrorCaption(err) {
  const data = err?.response?.data
  if (!data) return err?.message || 'Falha desconhecida.'
  if (typeof data.detail === 'string') return data.detail

  const firstValue = Object.values(data)[0]
  if (Array.isArray(firstValue)) {
    const first = firstValue[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      const nested = Object.values(first)[0]
      if (Array.isArray(nested) && nested[0]) return String(nested[0])
      if (typeof nested === 'string') return nested
    }
  }
  if (typeof firstValue === 'string') return firstValue
  if (firstValue && typeof firstValue === 'object') {
    const nested = Object.values(firstValue)[0]
    if (Array.isArray(nested) && nested[0]) return String(nested[0])
    if (typeof nested === 'string') return nested
  }
  return err?.message || 'Falha desconhecida.'
}

function buildMobileWalletRows() {
  const wallets = [
    {
      label: 'M-Pesa',
      provider: 'mpesa',
      registered_name: form.mpesaName.trim(),
      phone_number: form.mpesaNumber.trim(),
      is_active: true,
    },
    {
      label: 'e-Mola',
      provider: 'emola',
      registered_name: form.emolaName.trim(),
      phone_number: form.emolaNumber.trim(),
      is_active: true,
    },
  ]

  for (const wallet of wallets) {
    const hasName = Boolean(wallet.registered_name)
    const hasPhone = Boolean(wallet.phone_number)
    if (hasName !== hasPhone) {
      throw new Error(`${wallet.label}: preencha nome e número, ou deixe ambos vazios.`)
    }
  }

  return wallets.filter((wallet) => wallet.registered_name && wallet.phone_number)
}

function buildSnapshot() {
  return JSON.stringify({
    form: { ...form },
    bankRows: bankRows.value,
    securityTabRows: securityTabRows.value,
    uploads: Object.fromEntries(
      Object.entries(uploads).map(([key, value]) => [key, {
        fileName: value.fileName,
        previewUrl: value.previewUrl,
        storedUrl: value.storedUrl,
        markedForRemoval: value.markedForRemoval,
      }]),
    ),
  })
}

function restoreSnapshot() {
  if (!snapshot.value) return
  const data = JSON.parse(snapshot.value)
  Object.assign(form, data.form || {})
  bankRows.value = Array.isArray(data.bankRows) ? [...data.bankRows] : []
  securityTabRows.value = Array.isArray(data.securityTabRows) ? [...data.securityTabRows] : []
  hydrateUploadsFromSnapshot(data.uploads || {})
}

function resolveAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const backendRoot = (
    desktop?.backendUrl
    || import.meta.env.VITE_API_URL
    || window.location.origin
  ).replace(/\/+$/, '')
  return path.startsWith('/') ? `${backendRoot}${path}` : `${backendRoot}/${path}`
}

function filenameFromPath(path) {
  if (!path) return ''
  return String(path).split('/').pop() || ''
}

function setStoredUpload(kind, path) {
  const target = uploads[kind]
  if (target.blobUrl) {
    URL.revokeObjectURL(target.blobUrl)
    target.blobUrl = ''
  }
  target.file = null
  target.storedUrl = path || ''
  target.previewUrl = path ? resolveAssetUrl(path) : ''
  target.fileName = path ? filenameFromPath(path) : ''
  target.markedForRemoval = false
}

function hydrateUploadsFromServer(data) {
  setStoredUpload('logo', data.logo_file)
  setStoredUpload('stamp', data.stamp_file)
  setStoredUpload('signature', data.director_signature_file)
}

function hydrateUploadsFromSnapshot(saved = {}) {
  for (const kind of ['logo', 'stamp', 'signature']) {
    const target = uploads[kind]
    if (target.blobUrl) {
      URL.revokeObjectURL(target.blobUrl)
      target.blobUrl = ''
    }
    target.file = null
    target.storedUrl = saved[kind]?.storedUrl || ''
    target.previewUrl = saved[kind]?.previewUrl || ''
    target.fileName = saved[kind]?.fileName || ''
    target.markedForRemoval = !!saved[kind]?.markedForRemoval
  }
}

function getAllSidebarTabs() {
  const tabs = []
  const forcedTabs = [
    { to: '/service-catalog', label: 'Serviços (Catálogo)' },
  ]

  for (const item of sidebarMenu) {
    if (!item || item.type === 'heading' || !item.to) continue
    tabs.push({
      tabKey: item.to,
      tabLabel: item.to === '/service-catalog' ? 'Serviços (Catálogo)' : item.label,
      tabRoute: item.to,
      operationalEnabled: true,
      tacticalEnabled: true,
      strategicEnabled: true,
    })
  }

  for (const forced of forcedTabs) {
    if (tabs.some((tab) => tab.tabKey === forced.to)) continue
    tabs.push({
      tabKey: forced.to,
      tabLabel: forced.label,
      tabRoute: forced.to,
      operationalEnabled: true,
      tacticalEnabled: true,
      strategicEnabled: true,
    })
  }

  return tabs
}

function mergeSecurityTabs(savedRows = []) {
  const baseRows = getAllSidebarTabs()
  const byKey = new Map(savedRows.map((row) => [row.tabKey, row]))
  return baseRows.map((base) => {
    const saved = byKey.get(base.tabKey)
    if (!saved) return base
    return {
      ...base,
      operationalEnabled: !!saved.operationalEnabled,
      tacticalEnabled: !!saved.tacticalEnabled,
      strategicEnabled: !!saved.strategicEnabled,
    }
  })
}

function pickUpload(kind) {
  const refs = {
    logo: logoInputRef.value,
    stamp: stampInputRef.value,
    signature: signatureInputRef.value,
  }
  refs[kind]?.click()
}

function applyUpload(kind, file) {
  if (!file) return
  const target = uploads[kind]
  if (target.blobUrl) URL.revokeObjectURL(target.blobUrl)
  const blobUrl = URL.createObjectURL(file)
  target.file = file
  target.blobUrl = blobUrl
  target.previewUrl = blobUrl
  target.storedUrl = ''
  target.fileName = file.name
  target.markedForRemoval = false
}

function removeUpload(kind) {
  const target = uploads[kind]
  if (target.blobUrl) {
    URL.revokeObjectURL(target.blobUrl)
    target.blobUrl = ''
  }
  const hadStoredFile = Boolean(target.storedUrl)
  target.file = null
  target.previewUrl = ''
  target.fileName = ''
  target.storedUrl = ''
  target.markedForRemoval = hadStoredFile
}

function onPickUpload(kind, event) {
  const file = event?.target?.files?.[0]
  applyUpload(kind, file)
}

function onDropUpload(kind, event) {
  const file = event?.dataTransfer?.files?.[0]
  applyUpload(kind, file)
}

function clearUploads() {
  ;['logo', 'stamp', 'signature'].forEach((kind) => {
    const target = uploads[kind]
    if (target.blobUrl) URL.revokeObjectURL(target.blobUrl)
    target.file = null
    target.blobUrl = ''
    target.previewUrl = ''
    target.storedUrl = ''
    target.fileName = ''
    target.markedForRemoval = false
  })
}

function addBankAccount() {
  if (!bankForm.bankName || !bankForm.accountHolder || !bankForm.accountNumber) {
    toast.warning('Preencha banco, titular e número da conta.')
    return
  }
  bankRows.value = [
    ...bankRows.value,
    {
      id: Date.now(),
      bankName: bankForm.bankName,
      accountHolder: bankForm.accountHolder,
      accountNumber: bankForm.accountNumber,
      nib: bankForm.nib,
      swift: bankForm.swift,
    },
  ]
  Object.assign(bankForm, {
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    nib: '',
    swift: '',
  })
  showBankModal.value = false
}

function togglePaper() {
  form.thermalPaper = form.thermalPaper === '58mm' ? '80mm' : '58mm'
}

function runPrinterTest(type) {
  const label = type === 'a4' ? 'A4' : 'térmica'
  toast.info(`Teste enviado para impressora ${label}.`)
}

function exportLogs() {
  toast.info('A exportação de logs será disponibilizada pelo backend.')
}

function runLocalBackup() {
  toast.info('Backup local iniciado.')
}

async function onSave() {
  saving.value = true
  try {
    const mobileWallets = buildMobileWalletRows()
    const payload = {
      legal_name: form.legalName,
      trade_name: form.tradeName,
      nuit: form.nuit,
      address: form.address,
      postal_code: form.postalCode,
      official_email: form.email,
      phone_1: form.phone1,
      phone_2: form.phone2,
      language: form.language,
      timezone_name: form.timezone,
      date_format: form.dateFormat,
      currency: form.currency,
      theme_mode: isDark.value ? 'dark' : 'light',
      printer_a4_name: form.printerA4,
      printer_thermal_name: form.printerThermal,
      thermal_paper_width: form.thermalPaper,
      vat_rate_percent: form.vatRatePercent,
      payment_instructions: form.paymentInstructions,
      smtp_host: form.smtpHost,
      smtp_port: Number(form.smtpPort || 587),
      smtp_username: form.smtpUsername,
      smtp_use_tls: !!form.smtpUseTls,
      whatsapp_default_country_code: form.whatsappDefaultCountryCode,
      auto_logout_minutes: form.autoLogoutMinutes,
      require_2fa_for_sensitive_roles: form.require2fa,
      bank_accounts: bankRows.value.map((row) => ({
        bank_name: row.bankName,
        account_holder: row.accountHolder,
        account_number: row.accountNumber,
        nib: row.nib,
        swift_code: row.swift,
        is_active: true,
      })),
      mobile_wallets: mobileWallets,
      security_tabs: securityTabRows.value.map((row) => ({
        tab_key: row.tabKey,
        tab_label: row.tabLabel,
        tab_route: row.tabRoute,
        operational_enabled: row.operationalEnabled,
        tactical_enabled: row.tacticalEnabled,
        strategic_enabled: row.strategicEnabled,
      })),
    }

    if (form.smtpAppPassword) {
      payload.smtp_app_password = form.smtpAppPassword
    }

    if (uploads.logo.file) payload.logo_file = uploads.logo.file
    if (uploads.logo.markedForRemoval) payload.clear_logo_file = true
    if (uploads.stamp.file) payload.stamp_file = uploads.stamp.file
    if (uploads.stamp.markedForRemoval) payload.clear_stamp_file = true
    if (uploads.signature.file) payload.director_signature_file = uploads.signature.file
    if (uploads.signature.markedForRemoval) payload.clear_director_signature_file = true

    const savedSettings = await financeSystemSettingService.update(payload)
    hydrateUploadsFromServer(savedSettings)
    form.smtpAppPassword = ''
    form.smtpAppPasswordConfigured = !!savedSettings.smtp_app_password_configured

    if (desktop?.saveSettings) {
      const res = await desktop.saveSettings({
        ...form,
        bankAccounts: bankRows.value,
        securityTabs: securityTabRows.value,
      })
      if (!res?.ok) {
        toast.error('Não foi possível guardar configurações.', { caption: res?.error || 'Falha desconhecida.' })
        return
      }
    }

    snapshot.value = buildSnapshot()
    toast.success('Configurações guardadas com sucesso.')
  } catch (err) {
    toast.error('Erro ao guardar configurações.', { caption: extractErrorCaption(err) })
  } finally {
    saving.value = false
  }
}

function onCancel() {
  restoreSnapshot()
  toast.info('Alterações locais foram descartadas.')
}

onMounted(async () => {
  securityTabRows.value = getAllSidebarTabs()

  if (desktop?.listPrinters) {
    try {
      const available = await desktop.listPrinters()
      if (Array.isArray(available) && available.length) {
        printerOptions.value = available.map((name) => ({ label: name, value: name }))
      }
    } catch {
      // fallback to defaults when desktop printer API is unavailable
    }
  }

  try {
    const data = await financeSystemSettingService.get()
    Object.assign(form, {
      legalName: data.legal_name || '',
      tradeName: data.trade_name || '',
      nuit: data.nuit || '',
      address: data.address || '',
      postalCode: data.postal_code || '',
      email: data.official_email || '',
      phone1: data.phone_1 || '',
      phone2: data.phone_2 || '',
      language: data.language || 'pt',
      timezone: data.timezone_name || 'Africa/Maputo',
      dateFormat: data.date_format || 'DD/MM/YYYY',
      currency: data.currency || 'MZN',
      printerA4: data.printer_a4_name || form.printerA4,
      printerThermal: data.printer_thermal_name || form.printerThermal,
      thermalPaper: data.thermal_paper_width || '80mm',
      vatRatePercent: Number(data.vat_rate_percent ?? 16),
      paymentInstructions: data.payment_instructions || '',
      smtpHost: data.smtp_host || '',
      smtpPort: Number(data.smtp_port ?? 587),
      smtpUsername: data.smtp_username || '',
      smtpAppPassword: '',
      smtpAppPasswordConfigured: !!data.smtp_app_password_configured,
      smtpUseTls: data.smtp_use_tls !== false,
      whatsappDefaultCountryCode: data.whatsapp_default_country_code || '258',
      autoLogoutMinutes: data.auto_logout_minutes || 15,
      require2fa: !!data.require_2fa_for_sensitive_roles,
    })
    hydrateUploadsFromServer(data)

    const bankAccounts = Array.isArray(data.bank_accounts) ? data.bank_accounts : []
    bankRows.value = bankAccounts.map((row, idx) => ({
      id: row.id || `bank-${idx}`,
      bankName: row.bank_name || '',
      accountHolder: row.account_holder || '',
      accountNumber: row.account_number || '',
      nib: row.nib || '',
      swift: row.swift_code || '',
    }))

    const wallets = Array.isArray(data.mobile_wallets) ? data.mobile_wallets : []
    const mpesa = wallets.find((w) => w.provider === 'mpesa')
    const emola = wallets.find((w) => w.provider === 'emola')
    form.mpesaName = mpesa?.registered_name || ''
    form.mpesaNumber = mpesa?.phone_number || ''
    form.emolaName = emola?.registered_name || ''
    form.emolaNumber = emola?.phone_number || ''

    const securityTabs = Array.isArray(data.security_tabs)
      ? data.security_tabs.map((row) => ({
          tabKey: row.tab_key,
          tabLabel: row.tab_label,
          tabRoute: row.tab_route,
          operationalEnabled: !!row.operational_enabled,
          tacticalEnabled: !!row.tactical_enabled,
          strategicEnabled: !!row.strategic_enabled,
        }))
      : []
    securityTabRows.value = mergeSecurityTabs(securityTabs)
  } catch {
    // keep local defaults when API is not available
  }

  snapshot.value = buildSnapshot()
})

onBeforeUnmount(() => {
  clearUploads()
})
</script>

<style scoped>
.settings-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
}

.settings-nav {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in oklab, var(--card) 92%, var(--accent));
  padding: 10px;
  height: fit-content;
  position: sticky;
  top: calc(var(--header-height, 70px) + 16px);
}

.settings-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--foreground);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 10px 12px;
  text-align: left;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.settings-nav-item:hover {
  border-color: color-mix(in oklab, var(--primary) 26%, transparent);
  background: color-mix(in oklab, var(--primary) 7%, transparent);
}

.settings-nav-item--active {
  border-color: color-mix(in oklab, var(--primary) 34%, transparent);
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

.settings-content {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  padding: 18px;
  box-shadow: 0 12px 28px color-mix(in oklab, var(--pluse-navy-950) 7%, transparent);
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-panel-head h2 {
  margin: 0;
  color: var(--mono);
  font-size: 1.14rem;
  font-weight: 780;
}

.settings-panel-head p {
  margin: 4px 0 0;
  color: var(--muted-foreground);
  font-size: 0.89rem;
}

.settings-grid {
  display: grid;
  gap: 12px;
}

.settings-grid.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.span-2 {
  grid-column: 1 / -1;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.upload-box {
  border: 1px dashed color-mix(in oklab, var(--primary) 28%, transparent);
  border-radius: 12px;
  min-height: 170px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;

  justify-content: center;
  text-align: center;
  gap: 6px;
  color: var(--muted-foreground);
  cursor: pointer;
  background: color-mix(in oklab, var(--accent) 46%, transparent);
}

.upload-box strong {
  color: var(--mono);
  font-size: 0.9rem;
}

.upload-preview {
  width: 100%;
  max-height: 112px;
  object-fit: contain;
}

.upload-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.hidden-file {
  display: none;
}

.theme-row,
.security-row,
.printer-row {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.theme-row p,
.security-row p,
.printer-main p {
  margin: 4px 0 0;
  color: var(--muted-foreground);
  font-size: 0.84rem;
}

.theme-toggle,
.paper-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
}

.muted {
  opacity: 0.54;
}

.printer-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.printer-main h3,
.bank-card-head h3 {
  margin: 0;
  color: var(--mono);
  font-size: 0.96rem;
  font-weight: 760;
}

.bank-card {
  border-radius: 12px;
}

.pluse-card {
  background: var(--card);
}

.pluse-light-table :deep(.q-table__middle),
.pluse-light-table :deep(.q-table) {
  background: transparent;
}

.bank-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
}

.wallet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.wallet-card {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wallet-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mono);
}

.security-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.security-levels-card {
  border-radius: 12px;
}

.tab-label-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tab-label-cell small {
  color: var(--muted-foreground);
}

.settings-action-bar {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 24;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in oklab, var(--card) 92%, transparent);
  backdrop-filter: blur(8px);
  padding: 8px;
  box-shadow: 0 12px 28px color-mix(in oklab, var(--pluse-navy-950) 12%, transparent);
}

@media (max-width: 1023.98px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .settings-nav-item {
    justify-content: center;
  }

  .upload-grid,
  .wallet-grid,
  .settings-grid.two-col {
    grid-template-columns: 1fr;
  }

  .settings-action-bar {
    left: 12px;
    right: 12px;
    justify-content: flex-end;
  }

  .printer-row,
  .theme-row,
  .security-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
