<!--
  /payroll/categories — Categorias salariais (escalões fixos).
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Categorias salariais"
    description="Escalões salariais fixos (categoria 1–4 dos vigilantes). Editáveis aqui sem precisar do admin Django."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-cheque" :size="14" />
        {{ rows.length }} categoria{{ rows.length === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Nova categoria" @click="openCreate(null)"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table
        :rows="rows" :columns="columns" :loading="loading"
        row-key="id" flat bordered
        :pagination="{ rowsPerPage: 0 }" hide-pagination
        class="pluse-table"
        no-data-label="Sem categorias registadas."
      >
        <template #body-cell-amount="props">
          <q-td :props="props">{{ money(props.row.amount) }}</q-td>
        </template>

        <template #body-cell-is_active="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.is_active ? 'success' : 'neutral'">
              {{ props.row.is_active ? 'Activa' : 'Inactiva' }}
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
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Sem categorias"
            description="Crie a primeira categoria salarial."
            icon="ki-cheque"
            cta-label="Nova categoria" @cta="openCreate(null)"
          />
        </template>
      </q-table>
    </q-card>

    <!-- Modal -->
    <AppModal v-model="showModal" size="sm" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          {{ form.id ? 'Editar categoria' : 'Nova categoria' }}
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <q-input v-model.number="form.number" label="Número *" type="number" min="1"
                   outlined dense :rules="[req]" />
          <q-input v-model="form.label" label="Designação *" outlined dense :rules="[req]" />
          <q-input v-model="form.amount" label="Montante (MZN) *" type="number" step="0.01"
                   outlined dense :rules="[req]" />
          <q-checkbox v-model="form.is_active" label="Activa" />
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
import { salaryCategoryService } from 'src/services/salary-category.service'
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
const loading = ref(false)
const saving = ref(false)

const columns = [
  { name: 'number', label: 'Nº', field: 'number', align: 'center' },
  { name: 'label', label: 'Designação', field: 'label', align: 'left' },
  { name: 'amount', label: 'Montante', field: 'amount', align: 'right' },
  { name: 'is_active', label: 'Estado', field: 'is_active', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function money(v) {
  if (v === null || v === undefined) return '—'
  return `${Number(v).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MZN`
}

async function fetch() {
  loading.value = true
  try {
    rows.value = await salaryCategoryService.list()
  } finally {
    loading.value = false
  }
}

// ── Modal ───────────────────────────────────────────────────────────────
const showModal = ref(false)
const formRef = ref(null)
const form = reactive({ id: null, number: '', label: '', amount: '', is_active: true })

function openCreate(row) {
  Object.assign(form, row
    ? { id: row.id, number: row.number, label: row.label, amount: row.amount, is_active: row.is_active }
    : { id: null, number: '', label: '', amount: '', is_active: true })
  showModal.value = true
}

async function submit() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    const payload = {
      number: form.number, label: form.label,
      amount: String(form.amount), is_active: form.is_active,
    }
    if (form.id) await salaryCategoryService.update(form.id, payload)
    else await salaryCategoryService.create(payload)
    toast.success('Categoria guardada.')
    showModal.value = false
    await fetch()
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
    title: 'Eliminar categoria',
    message: `Eliminar a categoria <b>${row.label}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await salaryCategoryService.remove(row.id)
      toast.success('Categoria eliminada.')
      await fetch()
    } catch (err) {
      toast.error('Não foi possível eliminar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(fetch)
</script>

<style scoped>
.pluse-card { background: var(--card); }
.pluse-table :deep(.q-table__top) { display: none; }
</style>
