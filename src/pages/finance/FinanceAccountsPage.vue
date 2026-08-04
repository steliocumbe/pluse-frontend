<template>
  <AdminPageTemplate
    eyebrow="Contabilidade e Finanças"
    title="Plano de contas"
    description="Estrutura hierárquica de contas para lançamentos de débito/crédito."
  >
    <template #actions>
      <q-btn unelevated no-caps class="admin-hero-primary" icon="add" label="Nova conta" @click="openCreate" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        no-data-label="Sem contas registadas."
      >
        <template #body-cell-code="props">
          <q-td :props="props">
            <span class="text-mono font-semibold">{{ props.row.code }}</span>
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="props.row.is_active ? 'success' : 'neutral'">
              {{ props.row.is_active ? 'Activa' : 'Inactiva' }}
            </AppBadge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <AppModal v-model="showCreate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">Nova conta contabilística</AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-3" @submit="submitCreate">
          <q-input v-model="form.code" outlined dense label="Código *" :rules="[req]" />
          <q-input v-model="form.name" outlined dense label="Nome *" :rules="[req]" />
          <q-select
            v-model="form.account_type"
            :options="typeOptions"
            emit-value
            map-options
            outlined
            dense
            label="Tipo *"
            :rules="[req]"
          />
          <q-select
            v-model="form.parent"
            :options="parentOptions"
            emit-value
            map-options
            outlined
            dense
            clearable
            label="Conta pai"
          />
          <q-checkbox v-model="form.is_active" label="Conta activa" />

          <div class="flex justify-end gap-2 mt-2">
            <q-btn flat no-caps label="Cancelar" @click="showCreate = false" :disable="saving" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import { financeAccountService } from 'src/services/finance.service'
import { useToast } from 'src/composables/useToast'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const rows = ref([])
const loading = ref(false)
const saving = ref(false)

const columns = [
  { name: 'code', label: 'Código', field: 'code', align: 'left', sortable: true },
  { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
  { name: 'account_type', label: 'Tipo', field: 'account_type', align: 'left' },
  { name: 'status', label: 'Estado', field: 'is_active', align: 'center' },
]

const typeOptions = [
  { value: 'asset', label: 'Ativo' },
  { value: 'liability', label: 'Passivo' },
  { value: 'equity', label: 'Capital Próprio' },
  { value: 'revenue', label: 'Proveitos' },
  { value: 'expense', label: 'Custos' },
]

const showCreate = ref(false)
const formRef = ref(null)
const form = reactive({ code: '', name: '', account_type: 'asset', parent: null, is_active: true })

const parentOptions = computed(() => rows.value.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` })))

function openCreate() {
  Object.assign(form, { code: '', name: '', account_type: 'asset', parent: null, is_active: true })
  showCreate.value = true
}

async function fetchRows() {
  loading.value = true
  try {
    const data = await financeAccountService.list({ page_size: 500, ordering: 'code' })
    rows.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  if (!(await formRef.value?.validate())) return
  saving.value = true
  try {
    await financeAccountService.create({ ...form })
    toast.success('Conta criada com sucesso.')
    showCreate.value = false
    await fetchRows()
  } catch (err) {
    toast.error('Não foi possível criar conta.', {
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
</style>
