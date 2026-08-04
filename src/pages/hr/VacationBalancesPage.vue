<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Saldo de férias"
    description="Direito anual, dias gozados e saldo remanescente por colaborador."
  >
    <q-card flat bordered class="pluse-card">
      <q-table :rows="rows" :columns="columns" row-key="id" flat class="pluse-light-table" :loading="loading" no-data-label="Sem saldos disponíveis.">
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="font-semibold">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>
        <template #body-cell-remaining_days="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.remaining_days < 5 ? 'warning' : 'success'">
              {{ props.row.remaining_days }} dia(s)
            </AppBadge>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" auto-width>
            <q-btn flat dense no-caps color="primary" label="Ajustar" @click="openAdjust(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showAdjust" size="sm" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">Ajustar saldo</AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-3" @submit="submitAdjust">
          <q-input v-model.number="adjust.entitled_days" type="number" min="0" outlined dense label="Dias de direito" />
          <q-input v-model.number="adjust.taken_days" type="number" min="0" outlined dense label="Dias gozados" />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" @click="showAdjust = false" :disable="saving" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import { vacationBalanceService } from 'src/services/hr.service'
import { useToast } from 'src/composables/useToast'

const toast = useToast()

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const selectedId = ref(null)

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'year', label: 'Ano', field: 'year', align: 'left' },
  { name: 'entitled_days', label: 'Direito', field: 'entitled_days', align: 'center' },
  { name: 'taken_days', label: 'Gozados', field: 'taken_days', align: 'center' },
  { name: 'remaining_days', label: 'Saldo', field: 'remaining_days', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]

const showAdjust = ref(false)
const formRef = ref(null)
const adjust = reactive({ entitled_days: null, taken_days: null })

async function fetchRows() {
  loading.value = true
  try {
    const data = await vacationBalanceService.list({ page_size: 500, ordering: '-year' })
    rows.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

function openAdjust(row) {
  selectedId.value = row.id
  adjust.entitled_days = row.entitled_days
  adjust.taken_days = row.taken_days
  showAdjust.value = true
}

async function submitAdjust() {
  saving.value = true
  try {
    await vacationBalanceService.adjust(selectedId.value, {
      entitled_days: adjust.entitled_days,
      taken_days: adjust.taken_days,
    })
    toast.success('Saldo atualizado.')
    showAdjust.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível ajustar saldo.', {
      caption: err?.response?.data?.detail || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

onMounted(fetchRows)
</script>

<style scoped>
.pluse-card { background: var(--card); }

.pluse-light-table :deep(.q-table__middle),
.pluse-light-table :deep(.q-table) {
  background: transparent;
}
</style>
