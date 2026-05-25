<!--
  /assets/vehicles — Viaturas (Fase 4.4).
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · Ativos"
    title="Viaturas"
    description="Viaturas de patrulha, transporte e serviço. A disponibilidade é actualizada manualmente pelo gestor."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-setting-2" :size="14" />
        {{ count }} viatura{{ count === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary"
             icon="add" label="Nova viatura" @click="openCreate(null)" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input v-model="filters.search" outlined dense clearable debounce="350"
                 placeholder="Procurar por matrícula, marca, modelo…" class="grow"
                 @update:model-value="onFiltersChanged">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select v-model="filters.vehicle_type" :options="vehicleTypeOptions"
                  outlined dense emit-value map-options clearable
                  label="Tipo" style="min-width: 160px"
                  @update:model-value="onFiltersChanged" />
        <q-select v-model="filters.availability" :options="availabilityOptions"
                  outlined dense emit-value map-options clearable
                  label="Disponibilidade" style="min-width: 180px"
                  @update:model-value="onFiltersChanged" />
      </q-card-section>

      <q-table v-model:pagination="pagination"
               :rows="rows" :columns="columns" :loading="loading"
               row-key="id" flat bordered binary-state-sort
               :rows-per-page-options="[10, 20, 50]"
               class="pluse-table" no-data-label="Sem viaturas registadas."
               @request="onTableRequest">
        <template #body-cell-plate="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.registration_plate }}</div>
            <div class="text-xs text-muted-foreground">
              {{ props.row.make }} {{ props.row.model }}
              <template v-if="props.row.year"> · {{ props.row.year }}</template>
            </div>
          </q-td>
        </template>
        <template #body-cell-availability="props">
          <q-td :props="props">
            <AppBadge :variant="availabilityVariant(props.row.availability)">
              {{ props.row.availability_display }}
            </AppBadge>
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
          <AppEmptyState title="Sem viaturas" description="Registe a primeira viatura."
                         icon="ki-setting-2" cta-label="Nova viatura" @cta="openCreate(null)" />
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showModal" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          {{ form.id ? 'Editar viatura' : 'Nova viatura' }}
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-input v-model="form.registration_plate" label="Matrícula *" outlined dense :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="form.make" label="Marca" outlined dense />
            <q-input v-model="form.model" label="Modelo" outlined dense />
            <q-input v-model.number="form.year" label="Ano" type="number" outlined dense min="1980" />
            <q-select v-model="form.vehicle_type" :options="vehicleTypeOptions"
                      label="Tipo *" outlined dense emit-value map-options :rules="[req]" />
          </div>
          <q-select v-model="form.availability" :options="availabilityOptions"
                    label="Disponibilidade *" outlined dense emit-value map-options :rules="[req]" />
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
import { vehicleService } from 'src/services/assets.service'
import { vehicleTypeOptions, availabilityOptions, availabilityVariant } from 'src/config/assets'
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
const filters = reactive({ search: '', vehicle_type: '', availability: '' })
const pagination = ref({ sortBy: 'registration_plate', descending: false, page: 1, rowsPerPage: 20, rowsNumber: 0 })

const columns = [
  { name: 'plate', label: 'Viatura', field: 'registration_plate', align: 'left', sortable: true },
  { name: 'vehicle_type_display', label: 'Tipo', field: 'vehicle_type_display', align: 'left' },
  { name: 'availability', label: 'Disponibilidade', field: 'availability', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

async function fetchPage() {
  loading.value = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.value
    const params = { page, page_size: rowsPerPage, ordering: `${descending ? '-' : ''}${sortBy}` }
    if (filters.search) params.search = filters.search
    if (filters.vehicle_type) params.vehicle_type = filters.vehicle_type
    if (filters.availability) params.availability = filters.availability
    const data = await vehicleService.list(params)
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
  id: null, registration_plate: '', make: '', model: '', year: null,
  vehicle_type: 'car', availability: 'available', notes: '',
})

function openCreate(row) {
  Object.assign(form, row
    ? { id: row.id, registration_plate: row.registration_plate, make: row.make || '',
        model: row.model || '', year: row.year, vehicle_type: row.vehicle_type,
        availability: row.availability, notes: row.notes || '' }
    : { id: null, registration_plate: '', make: '', model: '', year: null,
        vehicle_type: 'car', availability: 'available', notes: '' })
  showModal.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = { ...form }
    delete payload.id
    if (form.id) await vehicleService.update(form.id, payload)
    else await vehicleService.create(payload)
    toast.success('Viatura guardada.')
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
    title: 'Inactivar viatura',
    message: `Inactivar a viatura <b>${row.registration_plate}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Inactivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await vehicleService.remove(row.id)
      toast.success('Viatura inactivada.')
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
