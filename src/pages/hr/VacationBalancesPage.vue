<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Saldo de férias"
    description="Direito anual, dias gozados e saldo remanescente por colaborador."
  >
    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="rule" label="Regras legais"
        @click="openRules"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table :rows="rows" :columns="columns" row-key="id" flat class="pluse-light-table" :loading="loading" no-data-label="Sem saldos disponíveis.">
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="font-semibold">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>
        <template #body-cell-entitled_days="props">
          <q-td :props="props">
            <div class="font-semibold">{{ props.row.entitled_days }} dia(s)</div>
            <div
              v-if="props.row.legal_entitled_days !== props.row.entitled_days"
              class="text-xs text-muted-foreground"
            >
              Regra legal: {{ props.row.legal_entitled_days }}
            </div>
          </q-td>
        </template>
        <template #body-cell-unjustified_absence_days="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.unjustified_absence_days ? 'warning' : 'neutral'">
              {{ props.row.unjustified_absence_days }} dia(s)
            </AppBadge>
          </q-td>
        </template>
        <template #body-cell-remaining_days="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.remaining_days < 5 ? 'warning' : 'success'">
              {{ props.row.remaining_days }} dia(s)
            </AppBadge>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <div class="flex justify-end gap-1">
              <q-btn flat round dense color="primary" icon="sync" @click="recalculateBalance(props.row)">
                <q-tooltip>Recalcular pela regra legal</q-tooltip>
              </q-btn>
              <q-btn flat round dense color="primary" icon="edit" @click="openAdjust(props.row)">
                <q-tooltip>Ajustar saldo</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showAdjust" size="sm" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">Ajustar saldo</AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-3" @submit="submitAdjust">
          <q-input v-model.number="adjust.entitled_days" type="number" min="0" outlined dense label="Dias de direito" />
          <q-input v-model.number="adjust.taken_days" type="number" min="0" outlined dense label="Dias gozados" />
          <q-input v-model.number="adjust.unjustified_absence_days" type="number" min="0" outlined dense label="Faltas injustificadas" />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" @click="showAdjust = false" :disable="saving" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <AppModal v-model="showRules" size="lg" persistent>
      <div class="p-5 rules-modal">
        <div class="rules-modal__head">
          <div>
            <AppHeading :level="3" class="text-base font-semibold text-mono">
              Regras legais de férias
            </AppHeading>
            <p class="text-xs text-muted-foreground m-0">
              Configure os dias por ano de serviço. A regra do maior ano anterior aplica-se aos anos seguintes.
            </p>
          </div>
          <q-btn flat round dense icon="close" @click="showRules = false">
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </div>

        <q-table
          :rows="rules" :columns="ruleColumns" row-key="id"
          flat bordered dense class="pluse-light-table"
          :loading="rulesLoading" no-data-label="Sem regras configuradas."
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
              <q-btn flat round dense color="primary" icon="edit" @click="editRule(props.row)">
                <q-tooltip>Editar regra</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <q-form ref="ruleFormRef" greedy class="rules-form" @submit="submitRule">
          <q-input
            v-model.number="ruleForm.service_year" type="number" min="1"
            outlined dense label="Ano de serviço *" :rules="[req]"
          />
          <q-input
            v-model.number="ruleForm.entitled_days" type="number" min="0"
            outlined dense label="Dias de férias *" :rules="[req]"
          />
          <q-toggle v-model="ruleForm.is_active" label="Regra activa" />
          <q-input
            v-model="ruleForm.notes" outlined dense autogrow type="textarea"
            label="Notas"
          />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Limpar" :disable="ruleSaving" @click="resetRuleForm" />
            <q-btn
              unelevated no-caps color="primary" type="submit"
              :label="editingRuleId ? 'Guardar regra' : 'Adicionar regra'"
              :loading="ruleSaving"
            />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import {
  vacationBalanceService,
  vacationEntitlementRuleService,
} from 'src/services/hr.service'
import { useToast } from 'src/composables/useToast'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const selectedId = ref(null)

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'year', label: 'Ano', field: 'year', align: 'left' },
  { name: 'service_year', label: 'Ano serv.', field: 'service_year', align: 'center' },
  { name: 'entitled_days', label: 'Direito', field: 'entitled_days', align: 'center' },
  { name: 'taken_days', label: 'Gozados', field: 'taken_days', align: 'center' },
  { name: 'unjustified_absence_days', label: 'Faltas inj.', field: 'unjustified_absence_days', align: 'center' },
  { name: 'remaining_days', label: 'Saldo', field: 'remaining_days', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const showAdjust = ref(false)
const formRef = ref(null)
const adjust = reactive({
  entitled_days: null,
  taken_days: null,
  unjustified_absence_days: null,
})

const showRules = ref(false)
const rules = ref([])
const rulesLoading = ref(false)
const ruleSaving = ref(false)
const ruleFormRef = ref(null)
const editingRuleId = ref(null)
const ruleForm = reactive({
  service_year: null,
  entitled_days: null,
  is_active: true,
  notes: '',
})

const ruleColumns = [
  { name: 'service_year', label: 'Ano de serviço', field: 'service_year', align: 'left' },
  { name: 'entitled_days', label: 'Dias de férias', field: 'entitled_days', align: 'center' },
  { name: 'is_active', label: 'Estado', field: 'is_active', align: 'center' },
  { name: 'notes', label: 'Notas', field: 'notes', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

async function fetchRows() {
  loading.value = true
  try {
    const data = await vacationBalanceService.list({ page_size: 500, ordering: '-year' })
    rows.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

function openAdjust(row) {
  selectedId.value = row.id
  adjust.entitled_days = row.entitled_days
  adjust.taken_days = row.taken_days
  adjust.unjustified_absence_days = row.unjustified_absence_days
  showAdjust.value = true
}

async function submitAdjust() {
  saving.value = true
  try {
    await vacationBalanceService.adjust(selectedId.value, {
      entitled_days: adjust.entitled_days,
      taken_days: adjust.taken_days,
      unjustified_absence_days: adjust.unjustified_absence_days,
    })
    toast.success('Saldo atualizado.')
    showAdjust.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível ajustar saldo.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

async function recalculateBalance(row) {
  saving.value = true
  try {
    await vacationBalanceService.recalculate(row.id)
    toast.success('Saldo recalculado pela regra legal.')
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível recalcular saldo.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

async function fetchRules() {
  rulesLoading.value = true
  try {
    const data = await vacationEntitlementRuleService.list({ page_size: 100, ordering: 'service_year' })
    rules.value = data?.results ?? data ?? []
  } finally {
    rulesLoading.value = false
  }
}

function resetRuleForm() {
  editingRuleId.value = null
  Object.assign(ruleForm, {
    service_year: null,
    entitled_days: null,
    is_active: true,
    notes: '',
  })
}

async function openRules() {
  showRules.value = true
  resetRuleForm()
  await fetchRules()
}

function editRule(row) {
  editingRuleId.value = row.id
  Object.assign(ruleForm, {
    service_year: row.service_year,
    entitled_days: row.entitled_days,
    is_active: row.is_active,
    notes: row.notes || '',
  })
}

async function submitRule() {
  const ok = await ruleFormRef.value?.validate()
  if (!ok) return
  ruleSaving.value = true
  try {
    if (editingRuleId.value) {
      await vacationEntitlementRuleService.update(editingRuleId.value, { ...ruleForm })
      toast.success('Regra actualizada.')
    } else {
      await vacationEntitlementRuleService.create({ ...ruleForm })
      toast.success('Regra adicionada.')
    }
    resetRuleForm()
    await fetchRules()
  } catch (err) {
    toast.error('Não foi possível guardar a regra.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    ruleSaving.value = false
  }
}

onMounted(fetchRows)
</script>

<style scoped>
.pluse-card { background: var(--card); }

.pluse-light-table :deep(.q-table__middle),
.pluse-light-table :deep(.q-table) {
  background: transparent;
}

.rules-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rules-modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.rules-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.rules-form > :nth-child(3),
.rules-form > :nth-child(4),
.rules-form > :nth-child(5) {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .rules-form { grid-template-columns: 1fr; }
}
</style>
