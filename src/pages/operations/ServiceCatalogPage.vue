<template>
  <AdminPageTemplate
    eyebrow="Clientes e operação"
    title="Registo de serviços (Catálogo)"
    description="Serviços comerciais com regras financeiras, operacionais e logísticas para venda e execução."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-document" :size="14" />
        {{ count }} serviço{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated
        no-caps
        class="admin-hero-primary"
        icon="add"
        label="Novo serviço"
        @click="openEditor(null)"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined
          dense
          clearable
          debounce="350"
          placeholder="Procurar por nome, SKU ou descrição..."
          class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-select
          v-model="filters.category"
          :options="serviceCategoryOptions"
          outlined
          dense
          emit-value
          map-options
          clearable
          label="Categoria"
          style="min-width: 220px"
          @update:model-value="onFiltersChanged"
        />

        <q-select
          v-model="filters.billing_type"
          :options="serviceBillingTypeOptions"
          outlined
          dense
          emit-value
          map-options
          clearable
          label="Cobrança"
          style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />

        <q-select
          v-model="filters.is_published"
          :options="publishedOptions"
          outlined
          dense
          emit-value
          map-options
          clearable
          label="Estado"
          style="min-width: 210px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="id"
        flat
        bordered
        binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table"
        no-data-label="Sem serviços registados."
        @request="onTableRequest"
      >
        <template #body-cell-service="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.sku }}</div>
          </q-td>
        </template>

        <template #body-cell-category="props">
          <q-td :props="props">{{ props.row.category_display }}</q-td>
        </template>

        <template #body-cell-billing="props">
          <q-td :props="props">
            <div class="text-sm">{{ props.row.billing_type_display }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.billing_period_display }}</div>
          </q-td>
        </template>

        <template #body-cell-base_price="props">
          <q-td :props="props">{{ formatMoney(props.row.base_price) }}</q-td>
        </template>

        <template #body-cell-responsible="props">
          <q-td :props="props">{{ props.row.responsible_manager_name || '—' }}</q-td>
        </template>

        <template #body-cell-active="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.is_published ? 'success' : 'warning'">
              {{ props.row.is_published ? 'Ativo' : 'Inativo' }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn flat round dense icon="more_vert" size="sm">
              <q-menu>
                <q-list dense style="min-width: 170px">
                  <q-item clickable v-close-popup @click="openEditor(props.row)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="confirmInactivate(props.row)">
                    <q-item-section avatar><q-icon name="block" color="negative" /></q-item-section>
                    <q-item-section>Inativar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showEditor" size="xl" persistent>
      <div class="service-editor">
        <header class="service-editor__head">
          <div class="flex items-center gap-2">
            <q-btn
              v-if="step > 1"
              flat
              dense
              round
              icon="arrow_back"
              aria-label="Voltar passo"
              @click="step = Math.max(1, step - 1)"
            />
            <div>
              <h3 class="service-editor__title">{{ form.id ? 'Editar serviço' : 'Novo serviço' }}</h3>
              <p class="service-editor__subtitle">Passo {{ step }} de 5</p>
            </div>
          </div>

          <div class="service-editor__head-right">
            <AppBadge :variant="form.is_published ? 'success' : 'warning'">
              {{ form.is_published ? 'Ativo' : 'Inativo' }}
            </AppBadge>
            <q-toggle v-model="form.is_published" checked-icon="check" unchecked-icon="close" />
          </div>
        </header>

        <q-stepper v-model="step" flat animated color="primary" class="service-stepper">
          <q-step :name="1" title="Identidade" icon="sell">
            <q-form ref="formStep1" greedy class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <q-input v-model="form.name" label="Nome do Serviço *" outlined dense :rules="[req]" class="md:col-span-2" />
              <q-input v-model="form.sku" label="Código Interno (SKU) *" outlined dense :rules="[req]" />
              <q-select
                v-model="form.category"
                :options="serviceCategoryOptions"
                label="Categoria do Serviço *"
                outlined
                dense
                emit-value
                map-options
                :rules="[req]"
              />
              <q-input
                v-model="form.commercial_description"
                type="textarea"
                autogrow
                outlined
                dense
                class="md:col-span-2"
                label="Descrição Comercial"
              />
            </q-form>
          </q-step>

          <q-step :name="2" title="Financeiro" icon="payments">
            <q-form ref="formStep2" greedy class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <q-select
                v-model="form.billing_type"
                :options="serviceBillingTypeOptions"
                label="Tipo de Cobrança *"
                outlined
                dense
                emit-value
                map-options
                :rules="[req]"
              />
              <q-select
                v-model="form.billing_period"
                :options="serviceBillingPeriodOptions"
                label="Periodicidade de Faturação *"
                outlined
                dense
                emit-value
                map-options
                :rules="[req]"
              />
              <q-input
                v-model.number="form.base_price"
                outlined
                dense
                type="number"
                step="0.01"
                label="Preço Base (MZN)"
                :disable="form.billing_type === 'variable'"
                :rules="basePriceRules"
              />
              <q-input v-model.number="form.vat_rate" outlined dense type="number" min="0" max="100" label="IVA (%)" />
              <div class="service-box profitability-panel md:col-span-2">
                <div class="profitability-head">
                  <div>
                    <div class="service-box__title">Analise de Rentabilidade</div>
                    <div class="service-box__hint">Custos internos, terceiros e margem alvo para precificar sem vender abaixo do custo.</div>
                  </div>
                  <AppBadge :variant="pricingBelowSuggested ? 'warning' : 'success'">
                    {{ pricingBelowSuggested ? 'Abaixo do sugerido' : 'Margem protegida' }}
                  </AppBadge>
                </div>

                <div class="profitability-grid">
                  <q-input
                    v-model.number="form.pricing.supplier_cost"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.01"
                    label="Terceiros / Fornecedores"
                  />
                  <q-input
                    v-model.number="form.pricing.materials_cost"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.01"
                    label="Materiais / Insumos"
                  />
                  <q-input
                    v-model.number="form.pricing.overhead_cost"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.01"
                    label="Overhead"
                  />
                  <q-input
                    v-model.number="form.pricing.profit_margin_percent"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.01"
                    suffix="%"
                    label="Margem alvo"
                  />
                </div>

                <div class="profitability-summary">
                  <div>
                    <span>Custo total</span>
                    <strong>{{ formatMoney(pricingTotalCost) }}</strong>
                  </div>
                  <div>
                    <span>Lucro alvo</span>
                    <strong>{{ formatMoney(pricingProfitAmount) }}</strong>
                  </div>
                  <div>
                    <span>Preco sugerido</span>
                    <strong>{{ formatMoney(pricingSuggestedPrice) }}</strong>
                  </div>
                  <q-btn
                    flat
                    no-caps
                    color="primary"
                    icon="price_check"
                    label="Usar sugerido"
                    :disable="form.billing_type === 'variable'"
                    @click="form.base_price = pricingSuggestedPrice"
                  />
                </div>
              </div>
              <q-checkbox v-model="form.include_vat" class="md:col-span-2" label="Incluir IVA no cálculo" />
            </q-form>
          </q-step>

          <q-step :name="3" title="SLA" icon="checklist">
            <div class="flex flex-col gap-4">
              <div class="service-box">
                <div class="service-box__title">Etapas de ativação</div>
                <div class="flex flex-col gap-2">
                  <div v-for="(line, idx) in form.activation_steps" :key="`step-${idx}`" class="flex items-center gap-2">
                    <q-input
                      v-model="form.activation_steps[idx]"
                      outlined
                      dense
                      class="grow"
                      :label="`Etapa ${idx + 1}`"
                    />
                    <q-btn flat dense round icon="delete" color="negative" @click="removeActivationStep(idx)" />
                  </div>
                </div>
                <q-btn outline no-caps color="primary" icon="add" label="Adicionar etapa" class="mt-3" @click="addActivationStep" />
              </div>

              <div class="service-box">
                <div class="service-box__title">Requisitos no terreno (App Mobile)</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <q-checkbox v-model="form.require_photo_checkin" label="Exigir Check-in com fotografia" />
                  <q-checkbox v-model="form.require_round_every_2h" label="Exigir ronda a cada 2 horas" />
                  <q-checkbox v-model="form.requires_firearm" label="Este serviço requer uso de arma de fogo" class="md:col-span-2" />
                </div>
              </div>
            </div>
          </q-step>

          <q-step :name="4" title="Recursos" icon="inventory_2">
            <q-form ref="formStep4" greedy class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <q-input
                v-model.number="form.max_staff"
                type="number"
                min="1"
                outlined
                dense
                label="Lotação Máxima"
              />

              <q-select
                v-model="form.required_equipment"
                :options="equipmentOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                multiple
                use-chips
                clearable
                outlined
                dense
                label="Equipamento padrão exigido"
                class="md:col-span-2"
              />

              <q-select
                v-model="form.default_client"
                :options="clientOptions"
                emit-value
                map-options
                clearable
                outlined
                dense
                label="Cliente padrão (opcional)"
                @update:model-value="onClientChanged"
              />

              <q-select
                v-model="form.default_post"
                :options="postOptionsFiltered"
                emit-value
                map-options
                clearable
                outlined
                dense
                label="Posto padrão (opcional)"
              />
            </q-form>
          </q-step>

          <q-step :name="5" title="Publicação" icon="publish">
            <q-form ref="formStep5" greedy class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <q-select
                v-model="form.responsible_manager"
                :options="managerOptions"
                emit-value
                map-options
                clearable
                outlined
                dense
                label="Gestor Responsável"
                class="md:col-span-2"
              />

              <q-toggle
                v-model="form.is_published"
                class="md:col-span-2"
                color="primary"
                size="lg"
                checked-icon="check"
                unchecked-icon="close"
                :label="form.is_published
                  ? 'Serviço ativo para novas vendas'
                  : 'Serviço inativo para novas vendas'"
              />
            </q-form>
          </q-step>

          <template #navigation>
            <q-stepper-navigation class="service-stepper-nav">
              <div class="flex justify-between items-center gap-2">
                <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showEditor = false" />
                <div class="flex items-center gap-2">
                  <q-btn
                    v-if="step > 1"
                    flat
                    no-caps
                    label="Anterior"
                    icon="arrow_back"
                    :disable="saving"
                    @click="step = Math.max(1, step - 1)"
                  />
                  <q-btn
                    v-if="step < 5"
                    no-caps
                    unelevated
                    color="primary"
                    label="Seguinte"
                    icon-right="arrow_forward"
                    :disable="saving"
                    @click="nextStep"
                  />
                  <q-btn
                    v-else
                    no-caps
                    unelevated
                    color="primary"
                    label="Guardar Serviço"
                    :loading="saving"
                    :disable="saving"
                    @click="saveService"
                  />
                </div>
              </div>
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </div>
    </AppModal>

    <ModernAlert
      v-model="confirmState.open"
      :tone="confirmState.tone"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      :confirm-icon="confirmState.confirmIcon"
      :confirm-tone="confirmState.confirmTone"
      :cancel-label="confirmState.cancelLabel"
      :loading="confirmState.loading"
      @confirm="runConfirmAction"
      @cancel="closeConfirm"
      @secondary="closeConfirm"
    />
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from 'src/services/api'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { equipmentService } from 'src/services/assets.service'
import { financeServicePricingService } from 'src/services/finance.service'
import { serviceCatalogService } from 'src/services/service-catalog.service'
import {
  publishedOptions,
  serviceBillingPeriodOptions,
  serviceBillingTypeOptions,
  serviceCategoryOptions,
} from 'src/config/service-catalog'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import ModernAlert from 'src/components/ui/ModernAlert.vue'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)

const filters = reactive({
  search: '',
  category: '',
  billing_type: '',
  is_published: null,
})

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'service', label: 'Serviço', field: 'name', align: 'left', sortable: true },
  { name: 'category', label: 'Categoria', field: 'category_display', align: 'left' },
  { name: 'billing', label: 'Cobrança', field: 'billing_type_display', align: 'left' },
  { name: 'base_price', label: 'Preço Base', field: 'base_price', align: 'right', sortable: true },
  { name: 'responsible', label: 'Gestor', field: 'responsible_manager_name', align: 'left' },
  { name: 'active', label: 'Estado', field: 'is_published', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const showEditor = ref(false)
const step = ref(1)
const formStep1 = ref(null)
const formStep2 = ref(null)
const formStep4 = ref(null)
const formStep5 = ref(null)

function defaultPricing() {
  return {
    id: null,
    supplier_cost: 0,
    materials_cost: 0,
    overhead_cost: 0,
    profit_margin_percent: 0,
  }
}

const form = reactive({
  id: null,
  name: '',
  sku: '',
  category: 'physical_security',
  commercial_description: '',
  billing_type: 'fixed',
  base_price: null,
  billing_period: 'monthly',
  include_vat: true,
  vat_rate: 16,
  activation_steps: [''],
  require_photo_checkin: false,
  require_round_every_2h: false,
  requires_firearm: false,
  max_staff: null,
  required_equipment: [],
  default_client: null,
  default_post: null,
  responsible_manager: null,
  is_published: true,
  pricing: defaultPricing(),
})

const clientOptions = ref([])
const postOptions = ref([])
const equipmentOptions = ref([])
const managerOptions = ref([])

const postOptionsFiltered = computed(() => {
  if (!form.default_client) return postOptions.value
  return postOptions.value.filter((p) => p.clientId === form.default_client)
})

const basePriceRules = computed(() => {
  if (form.billing_type === 'variable') return []
  return [req, (v) => Number(v) >= 0 || 'Valor inválido']
})

const pricingTotalCost = computed(() => (
  Number(form.pricing.supplier_cost || 0)
  + Number(form.pricing.materials_cost || 0)
  + Number(form.pricing.overhead_cost || 0)
))
const pricingProfitAmount = computed(() => (
  pricingTotalCost.value * (Number(form.pricing.profit_margin_percent || 0) / 100)
))
const pricingSuggestedPrice = computed(() => Number((pricingTotalCost.value + pricingProfitAmount.value).toFixed(2)))
const pricingBelowSuggested = computed(() => (
  form.billing_type !== 'variable'
  && Number(form.base_price || 0) > 0
  && Number(form.base_price || 0) < pricingSuggestedPrice.value
))

const confirmState = reactive({
  open: false,
  tone: 'warning',
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  confirmIcon: 'check_circle',
  confirmTone: 'primary',
  cancelLabel: 'Cancelar',
  loading: false,
  action: null,
})

function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString('pt-PT', { style: 'currency', currency: 'MZN' })
}

function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    sku: '',
    category: 'physical_security',
    commercial_description: '',
    billing_type: 'fixed',
    base_price: null,
    billing_period: 'monthly',
    include_vat: true,
    vat_rate: 16,
    activation_steps: [''],
    require_photo_checkin: false,
    require_round_every_2h: false,
    requires_firearm: false,
    max_staff: null,
    required_equipment: [],
    default_client: null,
    default_post: null,
    responsible_manager: null,
    is_published: true,
    pricing: defaultPricing(),
  })
}

function openEditor(row) {
  step.value = 1
  if (!row) {
    resetForm()
  } else {
    Object.assign(form, {
      id: row.id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      commercial_description: row.commercial_description || '',
      billing_type: row.billing_type,
      base_price: row.base_price,
      billing_period: row.billing_period,
      include_vat: !!row.include_vat,
      vat_rate: Number(row.vat_rate ?? 16),
      activation_steps: Array.isArray(row.activation_steps) && row.activation_steps.length
        ? [...row.activation_steps]
        : [''],
      require_photo_checkin: !!row.require_photo_checkin,
      require_round_every_2h: !!row.require_round_every_2h,
      requires_firearm: !!row.requires_firearm,
      max_staff: row.max_staff,
      required_equipment: Array.isArray(row.required_equipment) ? [...row.required_equipment] : [],
      default_client: row.default_client || null,
      default_post: row.default_post || null,
      responsible_manager: row.responsible_manager || null,
      is_published: !!row.is_published,
      pricing: {
        id: row.finance_pricing?.id || null,
        supplier_cost: Number(row.finance_pricing?.supplier_cost || 0),
        materials_cost: Number(row.finance_pricing?.materials_cost || 0),
        overhead_cost: Number(row.finance_pricing?.overhead_cost || 0),
        profit_margin_percent: Number(row.finance_pricing?.profit_margin_percent || 0),
      },
    })
  }
  showEditor.value = true
}

function addActivationStep() {
  form.activation_steps.push('')
}

function removeActivationStep(idx) {
  form.activation_steps.splice(idx, 1)
  if (!form.activation_steps.length) form.activation_steps.push('')
}

function onClientChanged() {
  if (!form.default_client) return
  const post = postOptions.value.find((p) => p.value === form.default_post)
  if (post && post.clientId !== form.default_client) {
    form.default_post = null
  }
}

async function validateCurrentStep() {
  if (step.value === 1) return (await formStep1.value?.validate()) !== false
  if (step.value === 2) return (await formStep2.value?.validate()) !== false
  if (step.value === 4) return (await formStep4.value?.validate()) !== false
  if (step.value === 5) return (await formStep5.value?.validate()) !== false
  return true
}

async function nextStep() {
  if (!(await validateCurrentStep())) {
    toast.warning('Preencha os campos obrigatórios deste passo.')
    return
  }
  step.value = Math.min(5, step.value + 1)
}

function buildPayload() {
  const steps = (form.activation_steps || [])
    .map((s) => String(s || '').trim())
    .filter(Boolean)

  return {
    name: form.name,
    sku: form.sku,
    category: form.category,
    commercial_description: form.commercial_description || '',
    billing_type: form.billing_type,
    base_price: form.billing_type === 'variable'
      ? null
      : (form.base_price !== null && form.base_price !== '' ? String(form.base_price) : null),
    billing_period: form.billing_period,
    include_vat: !!form.include_vat,
    vat_rate: form.vat_rate !== null && form.vat_rate !== '' ? String(form.vat_rate) : '16',
    activation_steps: steps,
    require_photo_checkin: !!form.require_photo_checkin,
    require_round_every_2h: !!form.require_round_every_2h,
    requires_firearm: !!form.requires_firearm,
    max_staff: form.max_staff || null,
    required_equipment: form.required_equipment,
    default_client: form.default_client || null,
    default_post: form.default_post || null,
    responsible_manager: form.responsible_manager || null,
    is_published: !!form.is_published,
  }
}

async function savePricingForService(serviceId) {
  const pricing = {
    service: serviceId,
    supplier_cost: String(Number(form.pricing.supplier_cost || 0)),
    materials_cost: String(Number(form.pricing.materials_cost || 0)),
    overhead_cost: String(Number(form.pricing.overhead_cost || 0)),
    profit_margin_percent: String(Number(form.pricing.profit_margin_percent || 0)),
  }
  const hasPricing = form.pricing.id || Object.entries(pricing)
    .some(([key, value]) => key !== 'service' && Number(value || 0) > 0)
  if (!hasPricing) return
  await financeServicePricingService.upsert(pricing)
}

async function saveService() {
  if (!(await validateCurrentStep())) {
    toast.warning('Existem campos inválidos antes de guardar.')
    return
  }

  saving.value = true
  try {
    const payload = buildPayload()
    let savedService
    if (form.id) {
      savedService = await serviceCatalogService.update(form.id, payload)
      toast.success('Serviço atualizado com sucesso.')
    } else {
      savedService = await serviceCatalogService.create(payload)
      toast.success('Serviço criado com sucesso.')
    }
    await savePricingForService(savedService?.id || form.id)
    showEditor.value = false
    await fetchPage()
  } catch (err) {
    const caption =
      err?.response?.data?.detail
      || Object.values(err?.response?.data || {})?.[0]
      || 'Não foi possível guardar o serviço.'

    confirmState.open = true
    confirmState.tone = 'negative'
    confirmState.title = 'Erro ao guardar serviço'
    confirmState.message = String(caption)
    confirmState.confirmLabel = 'Fechar'
    confirmState.confirmIcon = 'close'
    confirmState.confirmTone = 'negative'
    confirmState.cancelLabel = 'Fechar'
    confirmState.action = null
  } finally {
    saving.value = false
  }
}

function confirmInactivate(row) {
  confirmState.open = true
  confirmState.tone = 'warning'
  confirmState.title = 'Inativar serviço'
  confirmState.message = `Deseja inativar o serviço <b>${row.name}</b>? Ele deixa de aparecer para novas vendas.`
  confirmState.confirmLabel = 'Inativar'
  confirmState.confirmIcon = 'block'
  confirmState.confirmTone = 'negative'
  confirmState.cancelLabel = 'Cancelar'
  confirmState.action = async () => {
    await serviceCatalogService.update(row.id, { is_published: false, status: 'inactive' })
    toast.success('Serviço inativado.')
    await fetchPage()
  }
}

async function runConfirmAction() {
  if (!confirmState.action) {
    closeConfirm()
    return
  }
  confirmState.loading = true
  try {
    await confirmState.action()
    closeConfirm()
  } catch (err) {
    toast.error('Não foi possível concluir a ação.', {
      caption: err?.response?.data?.detail,
    })
  } finally {
    confirmState.loading = false
  }
}

function closeConfirm() {
  confirmState.open = false
  confirmState.loading = false
  confirmState.action = null
}

async function loadRefs() {
  const [clientsRes, postsRes, equipmentRes, managersRes] = await Promise.all([
    clientService.list({ page_size: 300 }),
    postService.list({ page_size: 300 }),
    equipmentService.list({ page_size: 300, status: 'active' }),
    api.get('/supervisors/').then((r) => r.data),
  ])

  const clients = clientsRes?.results ?? clientsRes ?? []
  clientOptions.value = clients.map((c) => ({ label: c.name, value: c.id }))

  const posts = postsRes?.results ?? postsRes ?? []
  postOptions.value = posts.map((p) => ({
    label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
    value: p.id,
    clientId: p.client,
  }))

  const equipment = equipmentRes?.results ?? equipmentRes ?? []
  equipmentOptions.value = equipment.map((e) => ({
    label: `${e.name} (${e.serial_number})`,
    value: e.id,
  }))

  const managers = managersRes?.results ?? managersRes ?? []
  managerOptions.value = managers.map((u) => ({
    label: u.label || u.full_name || u.email,
    value: u.id,
  }))
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page,
      page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy}`,
    }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.billing_type) params.billing_type = filters.billing_type
    if (filters.is_published !== null && filters.is_published !== undefined && filters.is_published !== '') {
      params.is_published = filters.is_published
    }

    const data = await serviceCatalogService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}

function onTableRequest(p) {
  pagination.value = { ...pagination.value, ...p.pagination }
  fetchPage()
}

function onFiltersChanged() {
  pagination.value.page = 1
  fetchPage()
}

onMounted(async () => {
  try {
    await Promise.all([loadRefs(), fetchPage()])
  } catch {
    toast.error('Não foi possível carregar referências do catálogo.')
  }
})
</script>

<style scoped>
.pluse-card {
  background: var(--card);
}

.service-editor {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.service-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
}

.service-editor__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--mono);
}

.service-editor__subtitle {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--muted-foreground);
}

.service-editor__head-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.service-stepper {
  padding: 10px 18px 12px;
}

.service-stepper-nav {
  position: sticky;
  bottom: 0;
  z-index: 2;
  border-top: 1px solid var(--border);
  background: color-mix(in oklab, var(--card) 95%, white 5%);
  padding-top: 10px;
}

.service-box {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: color-mix(in oklab, var(--card) 96%, white 4%);
}

.service-box__title {
  margin-bottom: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--mono);
}

.service-box__hint {
  font-size: 0.76rem;
  color: var(--muted-foreground);
}

.profitability-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profitability-head,
.profitability-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.profitability-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.profitability-summary {
  border-top: 1px solid var(--border);
  padding-top: 10px;
}

.profitability-summary span {
  display: block;
  font-size: 0.72rem;
  color: var(--muted-foreground);
}

.profitability-summary strong {
  display: block;
  margin-top: 2px;
  font-size: 0.92rem;
  color: var(--mono);
}

@media (max-width: 980px) {
  .profitability-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .profitability-grid {
    grid-template-columns: 1fr;
  }
}
</style>
