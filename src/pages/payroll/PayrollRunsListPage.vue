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
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { payrollService } from 'src/services/payroll.service'
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
const pagination = ref({
  sortBy: 'year', descending: true, page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'reference', label: 'Folha', field: 'reference', align: 'left', sortable: true },
  { name: 'totals', label: 'Resumo', field: 'totals', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
]

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

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
