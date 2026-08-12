<!--
  /payroll/:id — detalhe de uma folha mensal.
  Mostra o resumo, os itens por colaborador e as acções de regeneração,
  aprovação/rejeição e exportação CSV.
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Folha de pagamento · ${run?.reference || '…'}`"
    :title="run ? monthLabel(run.month) + ' ' + run.year : 'Folha'"
    description="Bruto e líquido por colaborador. Bloqueada após aprovação."
    :breadcrumb="[
      { label: 'Folhas de pagamento', to: { name: 'payroll-runs-list' } },
      { label: run ? `${monthLabel(run.month)} ${run.year}` : 'Detalhe' },
    ]"
    :back-to="{ name: 'payroll-runs-list' }"
  >
    <template #meta>
      <span v-if="run" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="statusIcon(run.status)" size="14px" />
        {{ run.status_display }}
      </span>
      <span v-if="run" class="admin-meta-chip">
        <AppIcon name="ki-people" :size="13" />
        {{ run.totals.count }} colaborador(es)
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar"
        :to="{ name: 'payroll-runs-list' }"
      />
      <template v-if="run">
        <q-btn
          v-if="run.status === 'pending'"
          outline no-caps class="admin-hero-button"
          icon="refresh" label="Regenerar" @click="regenerate"
        />
        <q-btn
          v-if="run.status === 'pending' && canApprove"
          outline no-caps class="admin-hero-button"
          icon="cancel" label="Rejeitar" @click="reject"
        />
        <q-btn
          v-if="run.status === 'pending' && canApprove"
          unelevated no-caps class="admin-hero-primary"
          icon="check_circle" label="Aprovar" @click="approve"
        />
        <q-btn
          unelevated no-caps class="admin-hero-primary"
          icon="cloud_download" label="Exportar Excel"
          :loading="exporting" @click="downloadXlsx"
        />
      </template>
    </template>

    <div v-if="!run" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <template v-else>
      <!-- Totais -->
      <div class="totals-grid">
        <div class="total-card">
          <span class="total-card__label">Colaboradores</span>
          <strong class="total-card__value">{{ run.totals.count }}</strong>
        </div>
        <div class="total-card">
          <span class="total-card__label">Bruto total</span>
          <strong class="total-card__value">{{ money(run.totals.gross) }}</strong>
        </div>
        <div class="total-card total-card--primary">
          <span class="total-card__label">Líquido total</span>
          <strong class="total-card__value">{{ money(run.totals.net) }}</strong>
        </div>
      </div>

      <div v-if="departmentGroups.length" class="department-grid">
        <div v-for="group in departmentGroups" :key="group.code" class="department-total">
          <span class="department-total__label">{{ group.name }}</span>
          <strong class="department-total__value">{{ money(group.net) }}</strong>
          <span class="department-total__meta">
            {{ group.count }} colaborador(es) · {{ group.doubles }} dobra(s)
          </span>
        </div>
      </div>

      <div v-if="!departmentGroups.length" class="empty-payroll">
        Sem colaboradores nesta folha.
      </div>

      <section
        v-for="group in departmentGroups"
        :key="`department-${group.code}`"
        class="department-section"
      >
        <div class="department-section__head">
          <div>
            <h3>{{ group.name }}</h3>
            <p>{{ money(group.gross) }} bruto · {{ money(group.net) }} líquido</p>
          </div>
          <div class="department-section__badges">
            <AppBadge variant="neutral">{{ group.count }} colaborador(es)</AppBadge>
            <AppBadge v-if="group.doubles" variant="warning">{{ group.doubles }} dobra(s)</AppBadge>
          </div>
        </div>

        <q-table
          :rows="group.items" :columns="columns" :loading="false"
          row-key="id" flat bordered
          :pagination="{ rowsPerPage: 0 }" hide-pagination
          class="pluse-table"
          no-data-label="Sem colaboradores neste departamento."
        >
          <template #body-cell-employee="props">
            <q-td :props="props">
              <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ props.row.employee_number }}
                <template v-if="props.row.contract_reference"> · {{ props.row.contract_reference }}</template>
              </div>
            </q-td>
          </template>

          <template #body-cell-base_salary="props">
            <q-td :props="props">{{ money(props.row.base_salary) }}</q-td>
          </template>

          <template #body-cell-double_salary_pay="props">
            <q-td :props="props" class="text-positive">
              {{ Number(props.row.double_salary_pay) ? '+' + money(props.row.double_salary_pay) : '—' }}
            </q-td>
          </template>

          <template #body-cell-double_food_allowance_pay="props">
            <q-td :props="props" class="text-positive">
              {{ Number(props.row.double_food_allowance_pay) ? '+' + money(props.row.double_food_allowance_pay) : '—' }}
            </q-td>
          </template>

          <template #body-cell-doubles_pay="props">
            <q-td :props="props" class="text-positive">
              {{ Number(props.row.doubles_pay) ? '+' + money(props.row.doubles_pay) : '—' }}
            </q-td>
          </template>

          <template #body-cell-absence_deduction="props">
            <q-td :props="props" class="text-destructive">
              {{ Number(props.row.absence_deduction) ? '−' + money(props.row.absence_deduction) : '—' }}
            </q-td>
          </template>

          <template #body-cell-gross="props">
            <q-td :props="props">{{ money(props.row.gross) }}</q-td>
          </template>

          <template #body-cell-net="props">
            <q-td :props="props">
              <span class="net-figure">{{ money(props.row.net) }}</span>
            </q-td>
          </template>
        </q-table>
      </section>
    </template>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { payrollService } from 'src/services/payroll.service'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()

const run = ref(null)
const exporting = ref(false)

const canApprove = computed(
  () => auth.user?.is_superuser
    || auth.hasAnyGroup('Diretor Financeiro', 'Administrador', 'Direcao'),
)

const departmentGroups = computed(() => {
  const groups = new Map()
  for (const item of run.value?.items || []) {
    const code = item.department_code || 'none'
    if (!groups.has(code)) {
      groups.set(code, {
        code,
        name: item.department_name || 'Sem departamento',
        items: [],
        count: 0,
        doubles: 0,
        gross: 0,
        net: 0,
      })
    }
    const group = groups.get(code)
    group.items.push(item)
    group.count += 1
    group.doubles += Number(item.doubles || 0)
    group.gross += Number(item.gross || 0)
    group.net += Number(item.net || 0)
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
function monthLabel(m) { return MONTHS[(m || 1) - 1] || '' }

function statusIcon(s) {
  return { active: 'check_circle', pending: 'schedule', inactive: 'block' }[s] || 'info'
}
function money(v) {
  if (v === null || v === undefined) return '—'
  const n = Number(v)
  if (!n) return '0 MZN'
  return `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MZN`
}

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'base_salary', label: 'Salário base', field: 'base_salary', align: 'right' },
  { name: 'days_worked', label: 'Dias trab.', field: 'days_worked', align: 'center' },
  { name: 'doubles', label: 'Dobras', field: 'doubles', align: 'center' },
  { name: 'unjustified_absences', label: 'Faltas n/just.', field: 'unjustified_absences', align: 'center' },
  { name: 'double_salary_pay', label: '+ Acréscimo', field: 'double_salary_pay', align: 'right' },
  { name: 'double_food_allowance_pay', label: '+ Alimentação', field: 'double_food_allowance_pay', align: 'right' },
  { name: 'doubles_pay', label: '+ Dobras', field: 'doubles_pay', align: 'right' },
  { name: 'absence_deduction', label: '− Faltas', field: 'absence_deduction', align: 'right' },
  { name: 'gross', label: 'Bruto', field: 'gross', align: 'right' },
  { name: 'net', label: 'Líquido', field: 'net', align: 'right' },
]

async function load() {
  run.value = await payrollService.get(route.params.id)
}

async function downloadXlsx() {
  exporting.value = true
  try {
    const { blob } = await payrollService.exportXlsx(run.value.id)
    // Nome amigável construído no cliente — não depende do header da resposta.
    const filename = `Folha de pagamento - ${monthLabel(run.value.month)} ${run.value.year}.xlsx`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    toast.error('Não foi possível exportar.', { caption: err?.response?.data?.detail })
  } finally {
    exporting.value = false
  }
}

function regenerate() {
  $q.dialog({
    title: 'Regenerar folha',
    message: 'Os itens actuais serão apagados e recalculados a partir da assiduidade e das faltas. Continuar?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Regenerar', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      run.value = await payrollService.regenerate(run.value.id)
      toast.success('Folha regenerada.')
    } catch (err) {
      toast.error('Não foi possível regenerar.', { caption: err?.response?.data?.detail })
    }
  })
}

function approve() {
  $q.dialog({
    title: 'Aprovar folha',
    message: `Aprovar a folha <b>${run.value.reference}</b>? Após aprovação fica trancada.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      run.value = await payrollService.approve(run.value.id)
      toast.success('Folha aprovada.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

function reject() {
  $q.dialog({
    title: 'Rejeitar folha',
    message: 'Motivo (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      run.value = await payrollService.reject(run.value.id, reason || '')
      toast.success('Folha rejeitada.')
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  try {
    await load()
  } catch {
    toast.error('Folha não encontrada.')
    router.push({ name: 'payroll-runs-list' })
  }
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.total-card {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.total-card__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.total-card__value {
  display: block;
  margin-top: 4px;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--mono);
}
.total-card--primary {
  background: color-mix(in oklab, var(--primary) 8%, var(--card));
  border-color: color-mix(in oklab, var(--primary) 30%, var(--border));
}
.total-card--primary .total-card__value { color: var(--primary); }
.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.department-total {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
}
.department-total__label,
.department-total__meta {
  display: block;
  color: var(--muted-foreground);
}
.department-total__label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
.department-total__value {
  display: block;
  margin-top: 4px;
  color: var(--mono);
  font-size: 1.15rem;
}
.department-total__meta {
  margin-top: 2px;
  font-size: 0.78rem;
}
.empty-payroll {
  padding: 36px 16px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  color: var(--muted-foreground);
  text-align: center;
}
.department-section {
  margin-top: 16px;
}
.department-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px 10px;
}
.department-section__head h3 {
  margin: 0;
  color: var(--mono);
  font-size: 1rem;
  font-weight: 800;
}
.department-section__head p {
  margin: 2px 0 0;
  color: var(--muted-foreground);
  font-size: 0.8rem;
}
.department-section__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.net-figure {
  font-weight: 800;
  color: var(--mono);
}
.text-positive { color: var(--pluse-emerald-600, #059669); font-weight: 600; }
.text-destructive { color: var(--destructive); font-weight: 600; }
</style>
