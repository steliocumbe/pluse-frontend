<!--
  /payroll — Folha de pagamento (Fase 3.3).
  Lista das folhas mensais; "Nova folha" cria e gera os itens automaticamente.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Folha de pagamento"
    description="Folhas mensais — cruzam o salário do contrato, a assiduidade e as faltas para apurar bruto e líquido por colaborador. Aprovação pelo Diretor Financeiro antes da exportação."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-cheque" :size="14" />
        {{ rows.length }} folha{{ rows.length === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="settings" label="Regras de dobra"
        @click="openDoubleRules"
      />
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova folha" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table"
        no-data-label="Sem folhas registadas."
        @request="onTableRequest"
        @row-click="onRowClick"
      >
        <template #body-cell-reference="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.reference }}</div>
            <div class="text-xs text-muted-foreground">{{ monthLabel(props.row.month) }} {{ props.row.year }}</div>
          </q-td>
        </template>

        <template #body-cell-totals="props">
          <q-td :props="props">
            <div class="text-sm font-medium">{{ props.row.totals.count }} colaborador(es)</div>
            <div class="text-xs text-muted-foreground">
              Líquido {{ money(props.row.totals.net) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem folhas"
            description="Crie a primeira folha mensal."
            icon="ki-cheque"
            cta-label="Nova folha" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Nova folha -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Nova folha mensal
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Os itens são gerados automaticamente para cada colaborador com
          contrato activo, a partir da assiduidade e das faltas do mês.
        </p>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submitCreate">
          <div class="grid grid-cols-2 gap-3">
            <q-select
              v-model="form.year" :options="yearOptions"
              label="Ano *" outlined dense emit-value map-options :rules="[req]"
            />
            <q-select
              v-model="form.month" :options="monthOptions"
              label="Mês *" outlined dense emit-value map-options :rules="[req]"
            />
          </div>
          <q-input v-model="form.notes" label="Notas" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Gerar folha" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showDoubleRules" size="lg" persistent>
      <div class="p-5 double-rules">
        <div class="double-rules__head">
          <div>
            <AppHeading :level="3" class="text-base font-semibold text-mono">
              Benefícios das dobras
            </AppHeading>
            <p class="text-xs text-muted-foreground m-0">
              Defina o acréscimo salarial e o subsídio de alimentação aplicados a cada dobra.
            </p>
          </div>
          <q-btn flat round dense icon="close" @click="showDoubleRules = false">
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </div>

        <q-table
          :rows="doubleRules" :columns="doubleRuleColumns"
          row-key="id" flat bordered dense class="pluse-table"
          :loading="doubleRulesLoading"
          no-data-label="Sem regras configuradas."
        >
          <template #body-cell-is_active="props">
            <q-td :props="props">
              <AppBadge :variant="props.row.is_active ? 'success' : 'neutral'">
                {{ props.row.is_active ? 'Activa' : 'Inactiva' }}
              </AppBadge>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" auto-width>
              <q-btn flat round dense color="primary" icon="edit" @click="editDoubleRule(props.row)">
                <q-tooltip>Editar regra</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <q-form ref="doubleRuleFormRef" greedy class="double-rules__form" @submit="submitDoubleRule">
          <q-input v-model="doubleRuleForm.name" outlined dense label="Nome *" :rules="[req]" />
          <q-input
            v-model.number="doubleRuleForm.salary_multiplier"
            type="number" min="0" step="0.01"
            outlined dense label="Acréscimo salarial *" :rules="[req]"
          />
          <q-input
            v-model.number="doubleRuleForm.food_allowance"
            type="number" min="0" step="0.01"
            outlined dense label="Subsídio de alimentação (MZN) *" :rules="[req]"
          />
          <q-toggle v-model="doubleRuleForm.is_active" label="Regra activa" />
          <q-input v-model="doubleRuleForm.notes" outlined dense autogrow type="textarea" label="Notas" />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Limpar" :disable="doubleRuleSaving" @click="resetDoubleRuleForm" />
            <q-btn
              unelevated no-caps color="primary" type="submit"
              :label="editingDoubleRuleId ? 'Guardar regra' : 'Adicionar regra'"
              :loading="doubleRuleSaving"
            />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { payrollDoubleRuleService, payrollService } from 'src/services/payroll.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const router = useRouter()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }))
function monthLabel(m) { return MONTHS[(m || 1) - 1] || '' }

const currentYear = new Date().getFullYear()
const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  value: y, label: String(y),
}))

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const showDoubleRules = ref(false)
const doubleRules = ref([])
const doubleRulesLoading = ref(false)
const doubleRuleSaving = ref(false)
const doubleRuleFormRef = ref(null)
const editingDoubleRuleId = ref(null)
const pagination = ref({
  sortBy: 'year', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'reference', label: 'Folha', field: 'reference', align: 'left', sortable: true },
  { name: 'totals', label: 'Resumo', field: 'totals', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
]

const doubleRuleColumns = [
  { name: 'name', label: 'Regra', field: 'name', align: 'left' },
  { name: 'salary_multiplier', label: 'Acréscimo', field: 'salary_multiplier', align: 'center' },
  { name: 'food_allowance', label: 'Subsídio alim.', field: 'food_allowance', align: 'right', format: money },
  { name: 'is_active', label: 'Estado', field: 'is_active', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const doubleRuleForm = reactive({
  name: 'Regra padrão',
  salary_multiplier: 1,
  food_allowance: 150,
  is_active: true,
  notes: '',
})

function statusVariant(s) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[s] || 'neutral'
}
function money(v) {
  if (v === null || v === undefined) return '—'
  return `${Number(v).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MZN`
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page, page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy}`,
    }
    const data = await payrollService.list(params)
    rows.value = data?.results ?? data ?? []
    pagination.value.rowsNumber = data?.count ?? rows.value.length
  } finally {
    loading.value = false
  }
}
function onTableRequest(p) {
  pagination.value = { ...pagination.value, ...p.pagination }
  fetchPage()
}
function onRowClick(_evt, row) {
  router.push({ name: 'payroll-run-detail', params: { id: row.id } })
}

// ── Create ─────────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({ year: currentYear, month: new Date().getMonth() + 1, notes: '' })

function openCreate() {
  Object.assign(form, {
    year: currentYear, month: new Date().getMonth() + 1, notes: '',
  })
  showCreate.value = true
}

async function submitCreate() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const run = await payrollService.create({ ...form })
    toast.success(`Folha ${run.reference} gerada — ${run.items.length} colaborador(es).`)
    showCreate.value = false
    router.push({ name: 'payroll-run-detail', params: { id: run.id } })
  } catch (err) {
    toast.error('Não foi possível gerar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

async function fetchDoubleRules() {
  doubleRulesLoading.value = true
  try {
    const data = await payrollDoubleRuleService.list({ page_size: 100, ordering: '-is_active,name' })
    doubleRules.value = data?.results ?? data ?? []
  } finally {
    doubleRulesLoading.value = false
  }
}

function resetDoubleRuleForm() {
  editingDoubleRuleId.value = null
  Object.assign(doubleRuleForm, {
    name: 'Regra padrão',
    salary_multiplier: 1,
    food_allowance: 150,
    is_active: true,
    notes: '',
  })
}

async function openDoubleRules() {
  showDoubleRules.value = true
  resetDoubleRuleForm()
  await fetchDoubleRules()
}

function editDoubleRule(row) {
  editingDoubleRuleId.value = row.id
  Object.assign(doubleRuleForm, {
    name: row.name,
    salary_multiplier: Number(row.salary_multiplier),
    food_allowance: Number(row.food_allowance),
    is_active: row.is_active,
    notes: row.notes || '',
  })
}

async function submitDoubleRule() {
  const ok = await doubleRuleFormRef.value?.validate()
  if (!ok) return
  doubleRuleSaving.value = true
  try {
    if (editingDoubleRuleId.value) {
      await payrollDoubleRuleService.update(editingDoubleRuleId.value, { ...doubleRuleForm })
      toast.success('Regra de dobra actualizada.')
    } else {
      await payrollDoubleRuleService.create({ ...doubleRuleForm })
      toast.success('Regra de dobra adicionada.')
    }
    resetDoubleRuleForm()
    await fetchDoubleRules()
  } catch (err) {
    toast.error('Não foi possível guardar a regra.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    doubleRuleSaving.value = false
  }
}

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }

.double-rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.double-rules__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.double-rules__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.double-rules__form > :nth-child(1),
.double-rules__form > :nth-child(4),
.double-rules__form > :nth-child(5),
.double-rules__form > :nth-child(6) {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .double-rules__form { grid-template-columns: 1fr; }
}
</style>
