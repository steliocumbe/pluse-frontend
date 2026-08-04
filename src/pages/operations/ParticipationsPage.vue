<!--
  /participations — Participações contra vigilantes (Fase 4.1).
  Origem CCO/Supervisor/Gestor/Inspector → conversível em processo disciplinar.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Participações"
    description="Relatórios formais contra vigilantes — atraso, conduta, falta de zelo. O RH pode convertê-los em processo disciplinar."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ count }} participaç{{ count === 1 ? 'ão' : 'ões' }}
      </span>
      <span v-if="openCount" class="admin-meta-chip admin-meta-chip--accent">
        {{ openCount }} por tratar
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova participação" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por vigilante ou motivo…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.source" :options="participationSourceOptions"
          outlined dense emit-value map-options clearable
          label="Origem" style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.state" :options="participationStateOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-card-section class="pt-0">
        <ActiveFiltersBar
          :filters="filters"
          :config="filterConfig"
          @clear="onClearFilter"
          @clear-all="onClearAllFilters"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table" no-data-label="Sem participações registadas."
        @request="onTableRequest"
        @row-click="(_, row) => openDetail(row)"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-reason="props">
          <q-td :props="props">
            <div class="text-sm">{{ props.row.reason }}</div>
            <div class="text-xs text-muted-foreground">
              {{ props.row.source_display }} · {{ formatDateTime(props.row.occurred_at) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-state="props">
          <q-td :props="props">
            <AppBadge :variant="participationStateVariant(props.row.state)">
              {{ props.row.state_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn flat round dense icon="visibility" size="sm" @click="openDetail(props.row)">
              <q-tooltip>Ver detalhe</q-tooltip>
            </q-btn>
            <q-btn
              v-if="canAct(props.row)"
              flat round dense icon="more_vert" size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 200px">
                  <q-item clickable v-close-popup @click="openConvert(props.row)">
                    <q-item-section avatar><q-icon name="gavel" color="primary" /></q-item-section>
                    <q-item-section>Converter em processo</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="dismiss(props.row)">
                    <q-item-section avatar><q-icon name="archive" color="negative" /></q-item-section>
                    <q-item-section>Arquivar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem participações"
            description="Regista a primeira participação contra um vigilante."
            icon="ki-warning-2"
            cta-label="Nova participação" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Create modal -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Nova participação
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-select v-model="form.employee" :options="employeeOptions"
                    label="Vigilante *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterEmployees" :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-select v-model="form.source" :options="participationSourceOptions"
                      label="Origem *" outlined dense emit-value map-options :rules="[req]" />
            <q-input v-model="form.occurred_at" label="Data/hora *"
                     type="datetime-local" outlined dense stack-label :rules="[req]" />
          </div>
          <q-input v-model="form.reason" label="Motivo curto *" outlined dense :rules="[req]"
                   placeholder="ex: atraso reiterado" maxlength="255" />
          <q-input v-model="form.description" label="Descrição detalhada *"
                   type="textarea" outlined dense autogrow :rules="[req]" />
          <q-file v-model="form.file" label="Anexo"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Registar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <!-- Convert modal -->
    <AppModal v-model="showConvert" size="md" persistent>
      <div v-if="current" class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Converter em processo disciplinar
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          {{ current.employee_name }} · {{ current.reason }}
        </p>
        <q-form ref="convertFormRef" greedy class="flex flex-col gap-4" @submit="submitConvert">
          <q-select v-model="convertForm.record_type" :options="disciplinaryRecordTypeOptions"
                    label="Tipo de registo *" outlined dense emit-value map-options :rules="[req]" />
          <q-input
            v-if="convertForm.record_type === 'suspension'"
            v-model.number="convertForm.suspension_days" label="Dias de suspensão *"
            type="number" outlined dense min="1" :rules="[req]"
          />
          <q-input v-model="convertForm.measure" label="Medida / sanção aplicada"
                   outlined dense />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showConvert = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Criar processo" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <!-- Detail modal -->
    <AppModal v-model="showDetail" size="lg">
      <div v-if="detail" class="p-5 part-detail">
        <div class="part-detail__head">
          <div class="min-w-0">
            <p class="part-detail__eyebrow">{{ detail.source_display }}</p>
            <RouterLink
              v-if="detail.employee"
              :to="`/employees/${detail.employee}`"
              class="part-detail__title-link"
            >
              <span class="part-detail__title">{{ detail.employee_name }}</span>
            </RouterLink>
            <div v-else class="part-detail__title">{{ detail.employee_name }}</div>
            <p v-if="detail.employee_number" class="part-detail__subtitle">
              {{ detail.employee_number }}
            </p>
          </div>
          <AppBadge :variant="participationStateVariant(detail.state)" size="md">
            {{ detail.state_display }}
          </AppBadge>
        </div>

        <div class="part-detail__grid">
          <div>
            <span>Origem</span>
            <strong>{{ detail.source_display }}</strong>
          </div>
          <div>
            <span>Data/hora</span>
            <strong>{{ formatDateTime(detail.occurred_at) }}</strong>
          </div>
        </div>

        <div class="part-detail__section">
          <span>Motivo</span>
          <p class="part-detail__reason">{{ detail.reason || '—' }}</p>
        </div>

        <div class="part-detail__section">
          <span>Descrição</span>
          <p class="whitespace-pre-wrap">{{ detail.description || '—' }}</p>
        </div>

        <div v-if="detail.file" class="part-detail__section">
          <span>Anexo</span>
          <q-btn
            flat no-caps icon="attach_file" label="Abrir anexo"
            :href="detail.file" target="_blank" class="mt-1 self-start"
          />
        </div>

        <div v-if="detail.disciplinary_record_id" class="part-detail__section is-info">
          <span>Convertida em processo disciplinar</span>
          <RouterLink
            v-if="detail.employee"
            :to="`/employees/${detail.employee}`"
            class="text-primary text-sm underline mt-1 inline-block"
          >
            Ver no processo do colaborador
          </RouterLink>
        </div>

        <AuditTrail :entity="detail" />

        <div class="part-detail__actions">
          <q-btn flat no-caps icon="edit" label="Editar" disable>
            <q-tooltip>Edição em breve</q-tooltip>
          </q-btn>
          <q-btn flat no-caps label="Fechar" @click="showDetail = false" />
          <q-btn
            v-if="canAct(detail)"
            unelevated no-caps color="primary" icon="gavel" label="Converter em disciplinar"
            @click="openConvert(detail); showDetail = false"
          />
          <q-btn
            v-if="canAct(detail)"
            unelevated no-caps color="negative" icon="archive" label="Arquivar"
            @click="dismiss(detail); showDetail = false"
          />
        </div>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuasar } from 'quasar'
import { participationService } from 'src/services/operations.service'
import { employeeService } from 'src/services/employee.service'
import {
  participationSourceOptions, participationStateOptions,
  disciplinaryRecordTypeOptions, participationStateVariant,
} from 'src/config/operations'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'
import AuditTrail from 'src/components/ui/AuditTrail.vue'

const $q = useQuasar()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ search: '', source: '', state: '' })
const pagination = ref({
  sortBy: 'occurred_at', descending: true,
  page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'employee', label: 'Vigilante', field: 'employee_name', align: 'left' },
  { name: 'reason', label: 'Motivo / origem', field: 'reason', align: 'left' },
  { name: 'state', label: 'Estado', field: 'state', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const openCount = computed(
  () => rows.value.filter((r) => ['registered', 'in_review'].includes(r.state)).length,
)

// Config para a barra de filtros activos
const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'source', label: 'Origem', emptyValue: '', options: participationSourceOptions },
  { key: 'state', label: 'Estado', emptyValue: '', options: participationStateOptions },
]

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}

function onClearAllFilters() {
  filters.search = ''
  filters.source = ''
  filters.state = ''
  onFiltersChanged()
}

function canAct(row) {
  return ['registered', 'in_review'].includes(row.state)
}
function formatDateTime(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString('pt-PT') } catch { return s }
}

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
  } catch { /* interceptor */ }
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
    if (filters.source) params.source = filters.source
    if (filters.state) params.state = filters.state
    const data = await participationService.list(params)
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

// ── Detail modal ────────────────────────────────────────────────────────
const showDetail = ref(false)
const detail = ref(null)

async function openDetail(row) {
  detail.value = row
  showDetail.value = true
  try {
    detail.value = await participationService.get(row.id)
  } catch {
    /* mantém os dados da tabela como fallback */
  }
}

// ── Create ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  employee: '', source: 'supervisor', occurred_at: '',
  reason: '', description: '', file: null,
})

function openCreate() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  Object.assign(form, {
    employee: '', source: 'supervisor',
    occurred_at: now.toISOString().slice(0, 16),
    reason: '', description: '', file: null,
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    if (!(payload.file instanceof File)) delete payload.file
    await participationService.create(payload)
    toast.success('Participação registada.')
    showCreate.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível registar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

// ── Convert ─────────────────────────────────────────────────────────────
const showConvert = ref(false)
const convertFormRef = ref(null)
const current = ref(null)
const convertForm = reactive({
  record_type: 'disciplinary_process', measure: '', suspension_days: null,
})

function openConvert(row) {
  current.value = row
  Object.assign(convertForm, {
    record_type: 'disciplinary_process', measure: '', suspension_days: null,
  })
  showConvert.value = true
}

async function submitConvert() {
  if (!(await convertFormRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { record_type: convertForm.record_type }
    if (convertForm.measure) payload.measure = convertForm.measure
    if (convertForm.record_type === 'suspension') {
      payload.suspension_days = convertForm.suspension_days
    }
    await participationService.convert(current.value.id, payload)
    toast.success('Processo disciplinar criado.')
    showConvert.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível converter.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

// ── Dismiss ─────────────────────────────────────────────────────────────
function dismiss(row) {
  $q.dialog({
    title: 'Arquivar participação',
    message: 'Arquivar esta participação sem criar processo disciplinar?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Arquivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await participationService.dismiss(row.id)
      toast.success('Participação arquivada.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível arquivar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  await loadRefs()
  await fetchPage()
})
</script>

<style scoped>
.pluse-table :deep(tbody tr) { cursor: pointer; }

.part-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.part-detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.part-detail__eyebrow {
  margin: 0 0 6px;
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}
.part-detail__title-link {
  text-decoration: none;
  color: inherit;
}
.part-detail__title-link:hover .part-detail__title {
  color: var(--primary);
  text-decoration: underline;
}
.part-detail__title {
  color: var(--mono);
  font-size: 1.25rem;
  font-weight: 850;
  display: inline-block;
}
.part-detail__subtitle {
  margin: 3px 0 0;
  color: var(--muted-foreground);
}
.part-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.part-detail__grid > div,
.part-detail__section {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in oklab, var(--muted) 20%, transparent);
  padding: 12px;
}
.part-detail span {
  display: block;
  color: var(--muted-foreground);
  font-size: 0.76rem;
  font-weight: 750;
}
.part-detail strong {
  display: block;
  margin-top: 4px;
  color: var(--mono);
}
.part-detail__section p {
  margin: 6px 0 0;
  color: var(--foreground);
  line-height: 1.6;
}
.part-detail__reason {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--mono);
}
.part-detail__section.is-info {
  border-color: color-mix(in oklab, var(--primary) 30%, var(--border));
  background: color-mix(in oklab, var(--primary) 6%, transparent);
}
.part-detail__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
@media (max-width: 640px) {
  .part-detail__grid { grid-template-columns: 1fr; }
}
</style>
