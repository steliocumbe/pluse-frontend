<!--
  /certifications — Certificações (Fase 3.4).
  Certificações com validade, alimentam os alertas de RH.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Certificações"
    description="Certificações dos colaboradores (credencial de arma, primeiros socorros, aptidão médica…) com data de validade — alimentam os alertas de RH."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-shield-tick" :size="14" />
        {{ count }} certificação{{ count === 1 ? '' : 'ões' }}
      </span>
      <span v-if="expiringCount" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ expiringCount }} a renovar
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova certificação" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por colaborador ou designação…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.certification_type" :options="certificationTypeOptions"
          outlined dense emit-value map-options clearable
          label="Tipo" style="min-width: 240px"
          @update:model-value="onFiltersChanged"
        />
        <q-checkbox
          v-model="filters.expiringOnly" label="Só a renovar (60 dias)"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        class="pluse-table" no-data-label="Sem certificações registadas."
        @request="onTableRequest"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-type="props">
          <q-td :props="props">
            <div class="text-sm font-medium">
              {{ props.row.name || props.row.certification_type_display }}
            </div>
            <div v-if="props.row.issuing_authority" class="text-xs text-muted-foreground">
              {{ props.row.issuing_authority }}
            </div>
          </q-td>
        </template>

        <template #body-cell-validity="props">
          <q-td :props="props">
            <template v-if="props.row.expiry_date">
              {{ formatDate(props.row.expiry_date) }}
              <AppBadge
                v-if="expiryTone(props.row)"
                size="sm" :variant="expiryTone(props.row).variant" class="ms-1"
              >
                {{ expiryTone(props.row).label }}
              </AppBadge>
            </template>
            <span v-else class="text-muted-foreground">Sem validade</span>
          </q-td>
        </template>

        <template #body-cell-certificate="props">
          <q-td :props="props">
            <a v-if="props.row.certificate_file"
               :href="absoluteFileUrl(props.row.certificate_file)"
               target="_blank" rel="noopener" class="file-link">
              <AppIcon name="ki-document" :size="13" /> Abrir
            </a>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem certificações"
            description="Registe a primeira certificação."
            icon="ki-shield-tick"
            cta-label="Nova certificação" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Modal -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Nova certificação
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-select v-model="form.employee" :options="employeeOptions"
                    label="Colaborador *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterEmployees" :rules="[req]" />
          <q-select v-model="form.certification_type" :options="certificationTypeOptions"
                    label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
          <q-input v-if="form.certification_type === 'other'"
                   v-model="form.name" label="Designação *" outlined dense :rules="[req]" />
          <q-input v-model="form.issuing_authority" label="Entidade emissora" outlined dense />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.issue_date" label="Emissão *" type="date"
                     outlined dense stack-label :rules="[req]" />
            <q-input v-model="form.expiry_date" label="Validade" type="date"
                     outlined dense stack-label
                     hint="Vazio = sem validade" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { certificationService } from 'src/services/training.service'
import { employeeService } from 'src/services/employee.service'
import { certificationTypeOptions } from 'src/config/training'
import { absoluteFileUrl } from 'src/utils/file-url'
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
const filters = reactive({ search: '', certification_type: '', expiringOnly: false })
const pagination = ref({
  sortBy: 'expiry_date', descending: false,
  page: 1, rowsPerPage: 20, rowsNumber: 0,
})

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'type', label: 'Certificação', field: 'certification_type_display', align: 'left' },
  { name: 'issue_date', label: 'Emissão', field: 'issue_date', align: 'left', sortable: true },
  { name: 'validity', label: 'Validade', field: 'expiry_date', align: 'left', sortable: true },
  { name: 'certificate', label: 'Documento', field: 'certificate_file', align: 'left' },
]

const expiringCount = computed(
  () => rows.value.filter((r) => expiryTone(r)).length,
)

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function expiryTone(row) {
  if (!row.expiry_date) return null
  const d = row.days_to_expiry
  if (d == null) return null
  if (d < 0) return { variant: 'danger', label: 'Expirada' }
  if (d <= 60) return { variant: 'warning', label: `${d}d` }
  return null
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
  } catch { /* interceptor toasts */ }
}

function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
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
    if (filters.certification_type) params.certification_type = filters.certification_type
    if (filters.expiringOnly) params.expiry_date__lte = isoDate(60)
    const data = await certificationService.list(params)
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
  employee: '', certification_type: 'weapon_license', name: '',
  issuing_authority: '', issue_date: '', expiry_date: '',
  certificate_file: null, notes: '',
})

function openCreate() {
  Object.assign(form, {
    employee: '', certification_type: 'weapon_license', name: '',
    issuing_authority: '', issue_date: isoDate(0), expiry_date: '',
    certificate_file: null, notes: '',
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    if (!(payload.certificate_file instanceof File)) delete payload.certificate_file
    if (!payload.expiry_date) delete payload.expiry_date
    await certificationService.create(payload)
    toast.success('Certificação registada.')
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
