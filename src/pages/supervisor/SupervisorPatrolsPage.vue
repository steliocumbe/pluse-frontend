<!--
  /supervisor/patrols — Rondas e supervisões (Fase 4.3).
  Lista + acções (iniciar / concluir / marcar como não realizada).
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · Supervisão"
    title="Rondas e supervisões"
    description="Visitas a postos — planeadas pelo Gestor Operativo, executadas pela Supervisão. Inicie, registe observações e feche a ronda."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-route" :size="14" />
        {{ count }} total
      </span>
      <span v-if="pendingCount" class="admin-meta-chip admin-meta-chip--accent">
        {{ pendingCount }} planeada(s) hoje
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova ronda" @click="openCreate"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search" outlined dense clearable debounce="350"
          placeholder="Procurar por posto, supervisor…" class="grow"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-model="filters.kind" :options="patrolKindOptions"
          outlined dense emit-value map-options clearable
          label="Tipo" style="min-width: 170px"
          @update:model-value="onFiltersChanged"
        />
        <q-select
          v-model="filters.state" :options="patrolStateOptions"
          outlined dense emit-value map-options clearable
          label="Estado" style="min-width: 180px"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered binary-state-sort
        :rows-per-page-options="[10, 15, 25, 50]"
        class="pluse-table" no-data-label="Sem rondas registadas."
        @request="onTableRequest"
      >
        <template #body-cell-when="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">
              {{ formatDate(props.row.planned_for) }}
              <span v-if="props.row.planned_period_display" class="text-xs text-muted-foreground">
                · {{ props.row.planned_period_display }}
              </span>
            </div>
            <div class="text-xs text-muted-foreground">{{ props.row.kind_display }}</div>
          </q-td>
        </template>

        <template #body-cell-post="props">
          <q-td :props="props">
            <div class="text-sm font-medium">{{ props.row.post_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.client_name }}</div>
          </q-td>
        </template>

        <template #body-cell-supervisor="props">
          <q-td :props="props">{{ props.row.supervisor_name }}</q-td>
        </template>

        <template #body-cell-state="props">
          <q-td :props="props">
            <AppBadge :variant="patrolStateVariant(props.row.state)">
              {{ props.row.state_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn
              v-if="canAct(props.row)"
              flat round dense icon="more_vert" size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 200px">
                  <q-item
                    v-if="props.row.state === 'planned'"
                    clickable v-close-popup @click="start(props.row)"
                  >
                    <q-item-section avatar><q-icon name="play_arrow" color="primary" /></q-item-section>
                    <q-item-section>Iniciar</q-item-section>
                  </q-item>
                  <q-item
                    v-if="['planned','in_progress'].includes(props.row.state)"
                    clickable v-close-popup @click="openComplete(props.row)"
                  >
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Concluir</q-item-section>
                  </q-item>
                  <q-item
                    v-if="['planned','in_progress'].includes(props.row.state)"
                    clickable v-close-popup @click="markMissed(props.row)"
                  >
                    <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                    <q-item-section>Não realizada</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem rondas"
            description="Planeie a primeira ronda ou supervisão a um posto."
            icon="ki-route"
            cta-label="Nova ronda" @cta="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Create modal -->
    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Nova ronda / supervisão
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <div class="grid grid-cols-2 gap-3">
            <q-select v-model="form.kind" :options="patrolKindOptions"
                      label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
            <q-input v-model="form.planned_for" label="Data e hora planeadas *"
                     type="datetime-local" outlined dense stack-label :rules="[req]" />
          </div>
          <q-select v-model="form.supervisor" :options="supervisorOptions"
                    label="Supervisor *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterSupervisors" :rules="[req]" />
          <q-select v-model="form.post" :options="postOptions"
                    label="Posto *" outlined dense emit-value map-options
                    use-input input-debounce="200"
                    @filter="filterPosts" :rules="[req]" />
          <q-select v-model="form.planned_period" :options="patrolPeriodOptions"
                    label="Período" outlined dense emit-value map-options clearable />
          <q-input v-model="form.observations" label="Notas para o supervisor" type="textarea"
                   outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showCreate = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Planear" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <!-- Complete modal -->
    <AppModal v-model="showComplete" size="md" persistent>
      <div v-if="current" class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Concluir ronda
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          {{ current.post_name }} · {{ formatDate(current.planned_for) }}
        </p>
        <q-form ref="completeFormRef" greedy class="flex flex-col gap-4" @submit="submitComplete">
          <q-input v-model="completeForm.observations" label="Observações" type="textarea"
                   outlined dense autogrow />
          <q-file v-model="completeForm.photo" label="Foto / anexo"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showComplete = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Concluir" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { patrolService } from 'src/services/operations.service'
import { postService } from 'src/services/post.service'
import { api } from 'src/services/api'
import {
  patrolKindOptions, patrolStateOptions, patrolPeriodOptions,
  patrolStateVariant,
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
const filters = reactive({ search: '', kind: '', state: '' })
const pagination = ref({
  sortBy: 'planned_for', descending: true,
  page: 1, rowsPerPage: 10, rowsNumber: 0,
})

const columns = [
  { name: 'when', label: 'Quando', field: 'planned_for', align: 'left', sortable: true },
  { name: 'post', label: 'Posto', field: 'post_name', align: 'left' },
  { name: 'supervisor', label: 'Supervisor', field: 'supervisor_name', align: 'left' },
  { name: 'state', label: 'Estado', field: 'state', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const today = new Date().toISOString().slice(0, 10)
const pendingCount = computed(
  () => rows.value.filter((r) => {
    if (r.state !== 'planned' || !r.planned_for) return false
    return r.planned_for.slice(0, 10) === today
  }).length,
)

function canAct(row) {
  return ['planned', 'in_progress'].includes(row.state)
}
function formatDate(s) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}

// ── Refs ────────────────────────────────────────────────────────────────
const allPosts = ref([])
const postOptions = ref([])
const allSupervisors = ref([])
const supervisorOptions = ref([])

function filterPosts(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    postOptions.value = n
      ? allPosts.value.filter((o) => o.label.toLowerCase().includes(n))
      : allPosts.value
  })
}
function filterSupervisors(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    supervisorOptions.value = n
      ? allSupervisors.value.filter((o) => o.label.toLowerCase().includes(n))
      : allSupervisors.value
  })
}

async function loadRefs() {
  try {
    const posts = await postService.list({ page_size: 300 })
    allPosts.value = (posts?.results ?? posts ?? []).map((p) => ({
      label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
      value: p.id,
    }))
    postOptions.value = allPosts.value
  } catch { /* interceptor */ }
  // Supervisores: users com grupo "Supervisor" ou similar.
  // Sem endpoint de utilizadores, usamos um fallback simples:
  // todos os utilizadores activos. Na prática, o gestor escolhe-os.
  try {
    const data = await api.get('/supervisors/').then((r) => r.data)
    const list = data?.results ?? data ?? []
    allSupervisors.value = list.map((u) => ({
      label: u.label || u.full_name || u.email,
      value: u.id,
    }))
    supervisorOptions.value = allSupervisors.value
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
    if (filters.state) params.state = filters.state
    const data = await patrolService.list(params)
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
function start(row) {
  $q.dialog({
    title: 'Iniciar ronda',
    message: 'Marca o início da ronda agora?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Iniciar', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await patrolService.start(row.id)
      toast.success('Ronda iniciada.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível iniciar.', { caption: err?.response?.data?.detail })
    }
  })
}
function markMissed(row) {
  $q.dialog({
    title: 'Marcar como não realizada',
    message: 'Motivo (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Marcar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      await patrolService.markMissed(row.id, reason || '')
      toast.success('Marcada como não realizada.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível marcar.', { caption: err?.response?.data?.detail })
    }
  })
}

// ── Create ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({
  kind: 'patrol', planned_for: '', supervisor: '', post: '',
  planned_period: '', observations: '',
})

function openCreate() {
  // Default: hoje às 08:00 (formato `YYYY-MM-DDTHH:mm` para datetime-local)
  const now = new Date()
  now.setHours(8, 0, 0, 0)
  const offset = now.getTimezoneOffset()
  const localIso = new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16)
  Object.assign(form, {
    kind: 'patrol',
    planned_for: localIso,
    supervisor: '', post: '', planned_period: '', observations: '',
  })
  showCreate.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    await patrolService.create({ ...form })
    toast.success('Ronda planeada.')
    showCreate.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível planear.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

// ── Complete ────────────────────────────────────────────────────────────
const showComplete = ref(false)
const completeFormRef = ref(null)
const current = ref(null)
const completeForm = reactive({ observations: '', photo: null })

function openComplete(row) {
  current.value = row
  Object.assign(completeForm, { observations: row.observations || '', photo: null })
  showComplete.value = true
}

async function submitComplete() {
  if (!(await completeFormRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { observations: completeForm.observations }
    if (completeForm.photo instanceof File) payload.photo = completeForm.photo
    await patrolService.complete(current.value.id, payload)
    toast.success('Ronda concluída.')
    showComplete.value = false
    await fetchPage()
  } catch (err) {
    toast.error('Não foi possível concluir.', { caption: err?.response?.data?.detail })
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
