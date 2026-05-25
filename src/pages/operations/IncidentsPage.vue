<!--
  /incidents — Ocorrências (Fase 4.1).
  Lista, criação, validação (Supervisor) e encerramento.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Ocorrências"
    description="Registo de ocorrências por posto — assaltos, intrusões, alarmes, conflitos. Validadas pela Supervisão, encerradas no fim."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ count }} ocorrência{{ count === 1 ? '' : 's' }}
      </span>
      <span v-if="openCount" class="admin-meta-chip admin-meta-chip--accent">
        {{ openCount }} por validar
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Registar ocorrência" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por posto, descrição…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.state" :options="incidentStateOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 170px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.severity" :options="severityOptions"
          outlined dense emit-value map-options clearable
          label="Gravidade" style="min-width: 170px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        class="pluse-table" no-data-label="Sem ocorrências registadas."
        @request="onTableRequest"
      >
        <template #body-cell-when="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">
              {{ formatDateTime(props.row.occurred_at) }}
            </div>
            <div class="text-xs text-muted-foreground">{{ props.row.post_name }}</div>
          </q-td>
        </template>

        <template #body-cell-type="props">
          <q-td :props="props">{{ props.row.incident_type_display }}</q-td>
        </template>

        <template #body-cell-severity="props">
          <q-td :props="props">
            <AppBadge :variant="severityVariant(props.row.severity)" size="sm">
              {{ props.row.severity_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-state="props">
          <q-td :props="props">
            <AppBadge :variant="incidentStateVariant(props.row.state)">
              {{ props.row.state_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn
              v-if="props.row.state !== 'closed'"
              flat round dense icon="more_vert" size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 180px">
                  <q-item
                    v-if="props.row.state === 'registered'"
                    clickable v-close-popup @click="validate(props.row)"
                  >
                    <q-item-section avatar><q-icon name="verified" color="primary" /></q-item-section>
                    <q-item-section>Validar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="close(props.row)">
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Encerrar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem ocorrências"
            description="Registe a primeira ocorrência observada num posto."
            icon="ki-warning-2"
            cta-label="Registar ocorrência" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Modal -->
    <AppModal v-model="showCreate" size="lg" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Registar ocorrência
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <q-select v-model="form.post" :options="postOptions"
                      label="Posto *" outlined dense emit-value map-options
                      use-input input-debounce="200"
                      @filter="filterPosts" :rules="[req]" />
            <q-input v-model="form.occurred_at" label="Data/hora *"
                     type="datetime-local" outlined dense stack-label :rules="[req]" />
            <q-select v-model="form.incident_type" :options="incidentTypeOptions"
                      label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
            <q-select v-model="form.severity" :options="severityOptions"
                      label="Gravidade *" outlined dense emit-value map-options :rules="[req]" />
          </div>
          <q-input v-model="form.location_description" label="Local específico" outlined dense
                   placeholder="ex: portaria, parque, bloco norte" />
          <q-input v-model="form.description" label="Descrição *" type="textarea"
                   outlined dense autogrow :rules="[req]" />
          <q-select v-model="form.employees_involved" :options="employeeOptions"
                    label="Vigilantes envolvidos" outlined dense emit-value map-options
                    multiple use-chips use-input input-debounce="200"
                    @filter="filterEmployees" />
          <q-file v-model="form.file" label="Anexo (foto, vídeo, PDF)"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <q-input v-model="form.notes" label="Notas internas" type="textarea"
                   outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Registar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { incidentService } from 'src/services/operations.service'
import { postService } from 'src/services/post.service'
import { employeeService } from 'src/services/employee.service'
import {
  incidentTypeOptions, severityOptions, incidentStateOptions,
  severityVariant, incidentStateVariant,
} from 'src/config/operations'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ search: '', state: '', severity: '' })
const pagination = ref({
  sortBy: 'occurred_at', descending: true,
  page: 1, rowsPerPage: 20, rowsNumber: 0,
})

const columns = [
  { name: 'when', label: 'Quando / Posto', field: 'occurred_at', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'incident_type_display', align: 'left' },
  { name: 'severity', label: 'Gravidade', field: 'severity', align: 'center' },
  { name: 'state', label: 'Estado', field: 'state', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const openCount = computed(
  () => rows.value.filter((r) => r.state === 'registered').length,
)

function formatDateTime(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString('pt-PT') } catch { return s }
}

// ── Refs ────────────────────────────────────────────────────────────────
const allPosts = ref([])
const postOptions = ref([])
const allEmployees = ref([])
const employeeOptions = ref([])

function filterPosts(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    postOptions.value = n
      ? allPosts.value.filter((o) => o.label.toLowerCase().includes(n))
      : allPosts.value
  })
}
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
    const [posts, emps] = await Promise.all([
      postService.list({ page_size: 300 }),
      employeeService.list({ page_size: 300, status: 'active' }),
    ])
    allPosts.value = (posts?.results ?? posts ?? []).map((p) => ({
      label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
      value: p.id,
    }))
    postOptions.value = allPosts.value
    allEmployees.value = (emps?.results ?? emps ?? []).map((e) => ({
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
    if (filters.state) params.state = filters.state
    if (filters.severity) params.severity = filters.severity
    const data = await incidentService.list(params)
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

// ── Actions ─────────────────────────────────────────────────────────────
function validate(row) {
  $q.dialog({
    title: 'Validar ocorrência',
    message: 'Confirma a veracidade desta ocorrência?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Validar', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await incidentService.validate(row.id)
      toast.success('Ocorrência validada.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível validar.', { caption: err?.response?.data?.detail })
    }
  })
}
function close(row) {
  $q.dialog({
    title: 'Encerrar ocorrência',
    message: 'Encerrar definitivamente esta ocorrência?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Encerrar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await incidentService.close(row.id)
      toast.success('Ocorrência encerrada.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível encerrar.', { caption: err?.response?.data?.detail })
    }
  })
}

// ── Create modal ────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  post: '', incident_type: '', severity: 'medium', occurred_at: '',
  location_description: '', description: '',
  employees_involved: [], file: null, notes: '',
})

function openCreate() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  Object.assign(form, {
    post: '', incident_type: '', severity: 'medium',
    occurred_at: now.toISOString().slice(0, 16),
    location_description: '', description: '',
    employees_involved: [], file: null, notes: '',
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    if (!(payload.file instanceof File)) delete payload.file
    await incidentService.create(payload)
    toast.success('Ocorrência registada.')
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

onMounted(async () => {
  await loadRefs()
  await fetchPage()
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
