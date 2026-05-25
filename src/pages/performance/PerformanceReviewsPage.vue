<!--
  /performance — Avaliações de desempenho (Fase 3.5).
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Avaliação de desempenho"
    description="Avaliações periódicas dos colaboradores — cinco critérios de 1 a 5, desfecho e comentários."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-chart-simple" :size="14" />
        {{ count }} avaliaç{{ count === 1 ? 'ão' : 'ões' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova avaliação" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por colaborador ou período…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.outcome" :options="outcomeOptions"
          outlined dense emit-value map-options clearable
          label="Desfecho" style="min-width: 220px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        class="pluse-table" no-data-label="Sem avaliações registadas."
        @request="onTableRequest"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-overall_score="props">
          <q-td :props="props">
            <span class="score-figure">{{ Number(props.row.overall_score).toFixed(2) }}</span>
            <span class="text-xs text-muted-foreground"> / 5</span>
          </q-td>
        </template>

        <template #body-cell-outcome="props">
          <q-td :props="props">
            <AppBadge v-if="props.row.outcome" :variant="outcomeVariant(props.row.outcome)">
              {{ props.row.outcome_display }}
            </AppBadge>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem avaliações"
            description="Crie a primeira avaliação de desempenho."
            icon="ki-chart-simple"
            cta-label="Nova avaliação" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Modal -->
    <AppModal v-model="showCreate" size="xl" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Nova avaliação de desempenho
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Pontue cada critério de 1 (insatisfatório) a 5 (excelente).
          A média global é calculada automaticamente.
        </p>
        <q-form ref="formRef" greedy class="flex flex-col gap-5" @submit="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <q-select v-model="form.employee" :options="employeeOptions"
                      label="Colaborador *" outlined dense emit-value map-options
                      use-input input-debounce="200"
                      @filter="filterEmployees" :rules="[req]" />
            <q-input v-model="form.period_label" label="Período *" outlined dense
                     placeholder="ex: 2026 Q1" :rules="[req]" />
            <q-input v-model="form.review_date" label="Data da avaliação *" type="date"
                     outlined dense stack-label :rules="[req]" />
            <q-select v-model="form.outcome" :options="outcomeOptions"
                      label="Desfecho" outlined dense emit-value map-options clearable />
          </div>

          <div class="criteria">
            <div v-for="c in criteria" :key="c.field" class="criterion">
              <span class="criterion__label">{{ c.label }}</span>
              <q-rating
                v-model="form[c.field]" :max="5" size="22px"
                color="primary" color-selected="primary"
                icon="radio_button_unchecked" icon-selected="circle"
              />
              <span class="criterion__value">{{ form[c.field] || '—' }} / 5</span>
            </div>
            <div class="criterion criterion--total">
              <span class="criterion__label">Média global</span>
              <strong class="criterion__total">{{ overall.toFixed(2) }} / 5</strong>
            </div>
          </div>

          <q-input v-model="form.strengths" label="Pontos fortes" type="textarea"
                   outlined dense autogrow />
          <q-input v-model="form.areas_to_improve" label="Aspectos a melhorar"
                   type="textarea" outlined dense autogrow />
          <q-input v-model="form.comments" label="Comentários do avaliador"
                   type="textarea" outlined dense autogrow />
          <q-input v-model="form.employee_comments" label="Comentários do colaborador"
                   type="textarea" outlined dense autogrow />
          <q-file v-model="form.file" label="Anexo (opcional)"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>

          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Guardar avaliação" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { performanceReviewService } from 'src/services/performance.service'
import { employeeService } from 'src/services/employee.service'
import { criteria, outcomeOptions, outcomeVariant } from 'src/config/performance'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ search: '', outcome: '' })
const pagination = ref({
  sortBy: 'review_date', descending: true,
  page: 1, rowsPerPage: 20, rowsNumber: 0,
})

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'period_label', label: 'Período', field: 'period_label', align: 'left' },
  { name: 'review_date', label: 'Data', field: 'review_date', align: 'left', sortable: true },
  { name: 'overall_score', label: 'Média', field: 'overall_score', align: 'center', sortable: true },
  { name: 'outcome', label: 'Desfecho', field: 'outcome', align: 'center' },
]

// ── Refs ────────────────────────────────────────────────────────────────
const allEmployees = ref([])
const employeeOptions = ref([])
function filterEmployees(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    employeeOptions.value = n
      ? allEmployees.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEmployees.value
  })
}
async function loadRefs() {
  try {
    const data = await employeeService.list({ page_size: 300, status: 'active' })
    allEmployees.value = (data?.results ?? data ?? []).map((e) => ({
      label: `${e.full_name} (${e.employee_number})`,
      value: e.id,
    }))
    employeeOptions.value = allEmployees.value
  } catch { /* interceptor toasts */ }
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = {
      page, page_size: rowsPerPage,
      ordering: `${descending ? '-' : ''}${sortBy}`,
    }
    if (filters.search) params.search = filters.search
    if (filters.outcome) params.outcome = filters.outcome
    const data = await performanceReviewService.list(params)
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

// ── Create modal ────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  employee: '', period_label: '', review_date: '',
  score_quality: 0, score_punctuality: 0, score_discipline: 0,
  score_teamwork: 0, score_initiative: 0,
  outcome: '', strengths: '', areas_to_improve: '',
  comments: '', employee_comments: '', file: null,
})

const overall = computed(() => {
  const vals = criteria.map((c) => Number(form[c.field]) || 0)
  if (vals.some((v) => v === 0)) return 0
  return vals.reduce((s, v) => s + v, 0) / vals.length
})

function openCreate() {
  Object.assign(form, {
    employee: '', period_label: '',
    review_date: new Date().toISOString().slice(0, 10),
    score_quality: 0, score_punctuality: 0, score_discipline: 0,
    score_teamwork: 0, score_initiative: 0,
    outcome: '', strengths: '', areas_to_improve: '',
    comments: '', employee_comments: '', file: null,
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  if (criteria.some((c) => !form[c.field])) {
    toast.error('Pontue todos os 5 critérios (1 a 5).')
    return
  }
  saving.value = true
  try {
    const payload = { ...form }
    if (!(payload.file instanceof File)) delete payload.file
    await performanceReviewService.create(payload)
    toast.success('Avaliação guardada.')
    showCreate.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível guardar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadRefs()
  await fetchPage()
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
.score-figure {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--primary);
}
.criteria {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in oklab, var(--muted) 18%, transparent);
}
.criterion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--card);
}
.criterion:last-child { border-bottom: none; }
.criterion__label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--foreground);
  flex: 1;
  min-width: 0;
}
.criterion__value {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted-foreground);
  min-width: 50px;
  text-align: right;
}
.criterion--total {
  background: color-mix(in oklab, var(--primary) 6%, var(--card));
  border-top: 1px solid color-mix(in oklab, var(--primary) 30%, var(--border));
}
.criterion__total {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
}
</style>
