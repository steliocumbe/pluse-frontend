<!--
  /training — Formações (Fase 3.4).
  Registo de formações e induções por colaborador.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Formações"
    description="Histórico de formações, induções e reciclagens de cada colaborador."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-information-2" :size="14" />
        {{ count }} registo{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova formação" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por designação ou colaborador…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.kind" :options="trainingKindOptions"
          outlined dense emit-value map-options clearable
          label="Tipo" style="min-width: 200px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        class="pluse-table" no-data-label="Sem formações registadas."
        @request="onTableRequest"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-title="props">
          <q-td :props="props">
            <div class="text-sm font-medium">{{ props.row.title }}</div>
            <div v-if="props.row.provider" class="text-xs text-muted-foreground">
              {{ props.row.provider }}
            </div>
          </q-td>
        </template>

        <template #body-cell-certificate="props">
          <q-td :props="props">
            <a v-if="props.row.certificate_file"
               :href="absoluteFileUrl(props.row.certificate_file)"
               target="_blank" rel="noopener" class="file-link">
              <AppIcon name="ki-document" :size="13" /> Certificado
            </a>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem formações"
            description="Registe a primeira formação ou indução."
            icon="ki-information-2"
            cta-label="Nova formação" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Modal -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Nova formação
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-select v-model="form.employee" :options="employeeOptions"
                    label="Colaborador *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterEmployees" :rules="[req]" />
          <q-input v-model="form.title" label="Designação *" outlined dense :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-select v-model="form.kind" :options="trainingKindOptions"
                      label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
            <q-input v-model="form.completion_date" label="Data de conclusão *"
                     type="date" outlined dense stack-label :rules="[req]" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.provider" label="Entidade formadora" outlined dense />
            <q-input v-model.number="form.hours" label="Horas" type="number" outlined dense min="0" />
          </div>
          <q-file v-model="form.certificate_file" label="Certificado (PDF/imagem)"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <q-input v-model="form.notes" label="Notas" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { trainingRecordService } from 'src/services/training.service'
import { employeeService } from 'src/services/employee.service'
import { trainingKindOptions } from 'src/config/training'
import { absoluteFileUrl } from 'src/utils/file-url'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const count = ref(0)
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ search: '', kind: '' })
const pagination = ref({
  sortBy: 'completion_date', descending: true,
  page: 1, rowsPerPage: 20, rowsNumber: 0,
})

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'title', label: 'Designação', field: 'title', align: 'left' },
  { name: 'kind_display', label: 'Tipo', field: 'kind_display', align: 'left' },
  { name: 'completion_date', label: 'Conclusão', field: 'completion_date', align: 'left', sortable: true },
  { name: 'hours', label: 'Horas', field: 'hours', align: 'center' },
  { name: 'certificate', label: 'Certificado', field: 'certificate_file', align: 'left' },
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
    if (filters.kind) params.kind = filters.kind
    const data = await trainingRecordService.list(params)
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
  employee: '', title: '', kind: 'initial', provider: '',
  completion_date: '', hours: null, certificate_file: null, notes: '',
})

function openCreate() {
  Object.assign(form, {
    employee: '', title: '', kind: 'initial', provider: '',
    completion_date: new Date().toISOString().slice(0, 10),
    hours: null, certificate_file: null, notes: '',
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    if (!(payload.certificate_file instanceof File)) delete payload.certificate_file
    await trainingRecordService.create(payload)
    toast.success('Formação registada.')
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
.file-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.file-link:hover { text-decoration: underline; }
</style>
