<!--
  /attendance-map — Mapa de assiduidade (Fase 3.1).
  Dias trabalhados por colaborador num período, a partir dos turnos.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Mapa de assiduidade"
    description="Dias trabalhados, faltas, substituições e dobras de cada colaborador no período seleccionado."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-people" :size="14" />
        {{ rows.length }} colaborador{{ rows.length === 1 ? '' : 'es' }}
      </span>
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input v-model="filters.from" label="De" type="date" outlined dense stack-label
                 @update:model-value="fetchSummary" />
        <q-input v-model="filters.to" label="Até" type="date" outlined dense stack-label
                 @update:model-value="fetchSummary" />
        <q-select
          v-model="filters.post" :options="postOptions"
          outlined dense emit-value map-options clearable
          label="Posto (opcional)" style="min-width: 220px"
          @update:model-value="fetchSummary"
        />
      </q-card-section>

      <q-table
        :rows="rows"
        :columns="columns"
        :loading="loading"
        row-key="employee_id"
        flat bordered
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        class="pluse-table"
        no-data-label="Sem turnos no período seleccionado."
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            <div class="text-sm font-semibold text-mono">{{ props.row.employee_name }}</div>
            <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
          </q-td>
        </template>

        <template #body-cell-days_worked="props">
          <q-td :props="props">
            <span class="days-figure">{{ props.row.days_worked }}</span>
          </q-td>
        </template>

        <template #body-cell-absent="props">
          <q-td :props="props">
            <span :class="props.row.absent ? 'text-destructive font-semibold' : 'text-muted-foreground'">
              {{ props.row.absent }}
            </span>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem dados de assiduidade"
            description="Não há turnos escalados no período. Crie a escala primeiro."
            icon="ki-calendar"
          />
        </template>
      </q-table>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { shiftService } from 'src/services/scheduling.service'
import { postService } from 'src/services/post.service'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

function firstOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
const today = new Date().toISOString().slice(0, 10)

const rows = ref([])
const loading = ref(false)
const filters = reactive({ from: firstOfMonth(), to: today, post: '' })

const columns = [
  { name: 'employee', label: 'Colaborador', field: 'employee_name', align: 'left' },
  { name: 'days_worked', label: 'Dias trabalhados', field: 'days_worked', align: 'center' },
  { name: 'present', label: 'Presenças', field: 'present', align: 'center' },
  { name: 'absent', label: 'Faltas', field: 'absent', align: 'center' },
  { name: 'substitutions_done', label: 'Substituições', field: 'substitutions_done', align: 'center' },
  { name: 'doubles', label: 'Dobras', field: 'doubles', align: 'center' },
  { name: 'scheduled', label: 'Turnos escalados', field: 'scheduled', align: 'center' },
]

const postOptions = ref([])

async function loadPosts() {
  try {
    const data = await postService.list({ page_size: 200 })
    postOptions.value = (data?.results ?? data ?? []).map((p) => ({
      label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
      value: p.id,
    }))
  } catch { /* interceptor toasts */ }
}

async function fetchSummary() {
  if (!filters.from || !filters.to) return
  loading.value = true
  try {
    const params = { from: filters.from, to: filters.to }
    if (filters.post) params.post = filters.post
    const data = await shiftService.attendanceSummary(params)
    rows.value = data?.rows ?? []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPosts()
  await fetchSummary()
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
.days-figure {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
}
</style>
