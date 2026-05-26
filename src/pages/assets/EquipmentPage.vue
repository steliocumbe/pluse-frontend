<!--
  /assets/equipment — Equipamentos (Fase 4.4).
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · Ativos"
    title="Equipamentos"
    description="Rádios, lanternas, armas, fardamento e outros equipamentos atribuíveis."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-shield-tick" :size="14" />
        {{ count }} equipamento{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary"
             icon="add" label="Novo equipamento" @click="openCreate(null)" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input v-model="filters.search" outlined dense clearable debounce="350"
                 placeholder="Procurar por série, designação…" class="grow"
                 @update:model-value="onFiltersChanged">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select v-model="filters.equipment_type" :options="equipmentTypeOptions"
                  outlined dense emit-value map-options clearable
                  label="Tipo" style="min-width: 180px"
                  @update:model-value="onFiltersChanged" />
        <q-select v-model="filters.availability" :options="availabilityOptions"
                  outlined dense emit-value map-options clearable
                  label="Disponibilidade" style="min-width: 180px"
                  @update:model-value="onFiltersChanged" />
        <q-toggle
          v-model="filters.only_overdue"
          label="Só com manutenção atrasada"
          color="negative"
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table v-model:pagination="pagination"
               :rows="rows" :columns="columns" :loading="loading"
               row-key="id" flat bordered binary-state-sort
               :rows-per-page-options="[10, 15, 25, 50]"
               class="pluse-table" no-data-label="Sem equipamentos registados."
               @request="onTableRequest">
        <template #body-cell-equipment="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.name }}</div>
            <div class="text-xs text-muted-foreground">Série: {{ props.row.serial_number }}</div>
          </q-td>
        </template>
        <template #body-cell-availability="props">
          <q-td :props="props">
            <AppBadge :variant="availabilityVariant(props.row.availability)">
              {{ props.row.availability_display }}
            </AppBadge>
          </q-td>
        </template>
        <template #body-cell-maintenance="props">
          <q-td :props="props">
            <AppBadge
              v-if="props.row.maintenance_status === 'overdue'"
              variant="danger"
            >
              Manutenção atrasada
            </AppBadge>
            <AppBadge
              v-else-if="props.row.maintenance_status === 'due_soon'"
              variant="warning"
            >
              Manutenção próxima
            </AppBadge>
            <span v-else-if="props.row.next_maintenance_at" class="text-xs text-muted-foreground">
              {{ formatDate(props.row.next_maintenance_at) }}
            </span>
            <span v-else class="text-xs text-muted-foreground">—</span>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn flat round dense icon="more_vert" size="sm">
              <q-menu>
                <q-list dense style="min-width: 160px">
                  <q-item clickable v-close-popup @click="openCreate(props.row)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="remove(props.row)">
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section>Inactivar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <AppEmptyState title="Sem equipamentos" description="Registe o primeiro equipamento."
                         icon="ki-shield-tick" cta-label="Novo equipamento" @cta="openCreate(null)" />
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showModal" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          {{ form.id ? 'Editar equipamento' : 'Novo equipamento' }}
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-input v-model="form.name" label="Designação *" outlined dense :rules="[req]" />
          <q-input v-model="form.serial_number" label="Nº de série / referência *"
                   outlined dense :rules="[req]" />
          <q-select v-model="form.equipment_type" :options="equipmentTypeOptions"
                    label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
          <q-select v-model="form.availability" :options="availabilityOptions"
                    label="Disponibilidade *" outlined dense emit-value map-options :rules="[req]" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input v-model="form.last_maintenance_at" label="Última manutenção"
                     type="date" outlined dense stack-label />
            <q-input v-model="form.next_maintenance_at" label="Próxima manutenção"
                     type="date" outlined dense stack-label />
          </div>
          <q-input v-model="form.notes" label="Notas" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showModal = false" />
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
import { useQuasar } from 'quasar'
import { equipmentService } from 'src/services/assets.service'
import { equipmentTypeOptions, availabilityOptions, availabilityVariant } from 'src/config/assets'
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
const filters = reactive({ search: '', equipment_type: '', availability: '', only_overdue: false })
const pagination = ref({ sortBy: 'name', descending: false, page: 1, rowsPerPage: 10, rowsNumber: 0 })

const columns = [
  { name: 'equipment', label: 'Equipamento', field: 'name', align: 'left', sortable: true },
  { name: 'equipment_type_display', label: 'Tipo', field: 'equipment_type_display', align: 'left' },
  { name: 'availability', label: 'Disponibilidade', field: 'availability', align: 'center' },
  { name: 'maintenance', label: 'Manutenção', field: 'maintenance_status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = { page, page_size: rowsPerPage, ordering: `${descending ? '-' : ''}${sortBy}` }
    if (filters.search) params.search = filters.search
    if (filters.equipment_type) params.equipment_type = filters.equipment_type
    if (filters.availability) params.availability = filters.availability
    if (filters.only_overdue) params.maintenance_status = 'overdue'
    const data = await equipmentService.list(params)
    rows.value = data?.results ?? data ?? []
    count.value = data?.count ?? rows.value.length
    pagination.value.rowsNumber = count.value
  } finally {
    loading.value = false
  }
}
function onTableRequest(p) { pagination.value = { ...pagination.value, ...p.pagination }; fetchPage() }
function onFiltersChanged() { pagination.value.page = 1; fetchPage() }

const showModal = ref(false)
const formRef = ref(null)
const form = reactive({
  id: null, name: '', serial_number: '', equipment_type: 'radio',
  availability: 'available', last_maintenance_at: '', next_maintenance_at: '',
  notes: '',
})

function openCreate(row) {
  Object.assign(form, row
    ? { id: row.id, name: row.name, serial_number: row.serial_number,
        equipment_type: row.equipment_type, availability: row.availability,
        last_maintenance_at: row.last_maintenance_at || '',
        next_maintenance_at: row.next_maintenance_at || '',
        notes: row.notes || '' }
    : { id: null, name: '', serial_number: '', equipment_type: 'radio',
        availability: 'available',
        last_maintenance_at: '', next_maintenance_at: '',
        notes: '' })
  showModal.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    delete payload.id
    // Datas opcionais — enviar `null` quando vazias para limpar no backend.
    payload.last_maintenance_at = payload.last_maintenance_at || null
    payload.next_maintenance_at = payload.next_maintenance_at || null
    if (form.id) await equipmentService.update(form.id, payload)
    else await equipmentService.create(payload)
    toast.success('Equipamento guardado.')
    showModal.value = false
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

function remove(row) {
  $q.dialog({
    title: 'Inactivar equipamento',
    message: `Inactivar <b>${row.name}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Inactivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await equipmentService.remove(row.id)
      toast.success('Equipamento inactivado.')
      await fetchPage()
    } catch (err) {
      toast.error('Não foi possível inactivar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
