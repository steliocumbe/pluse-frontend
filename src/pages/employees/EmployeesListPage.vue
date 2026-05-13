<!--
  Employees list — built on top of `AdminPageTemplate` to stay consistent with
  the rest of the admin shell. Hero shows the count via #meta, primary actions
  on the right; filters card + q-table go in the default slot.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Colaboradores"
    description="Vigilantes, supervisores e funcionários internos. Aqui consulta, aprova e mantém o registo actualizado."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-people" :size="14" />
        {{ store.count }} registado{{ store.count === 1 ? '' : 's' }}
      </span>
      <span v-if="pendingCount > 0" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ pendingCount }} pendente{{ pendingCount === 1 ? '' : 's' }} de aprovação
      </span>
    </template>

    <template #actions>
      <q-btn
        v-if="pendingCount > 0"
        outline
        no-caps
        class="admin-hero-button"
        icon="warning"
        :to="{ name: 'employees-approvals' }"
        label="Aprovações pendentes"
      />
      <q-btn
        unelevated
        no-caps
        class="admin-hero-primary"
        icon="add"
        :to="{ name: 'employees-new' }"
        label="Novo colaborador"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Procurar por nome, número, BI, telefone…"
          class="grow"
          clearable
          debounce="350"
          @update:model-value="onFiltersChanged"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          outlined
          dense
          emit-value
          map-options
          label="Estado"
          style="min-width: 180px"
          clearable
          @update:model-value="onFiltersChanged"
        />
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="store.items"
        :columns="columns"
        :loading="store.loading"
        row-key="id"
        flat
        bordered
        binary-state-sort
        :rows-per-page-options="[10, 20, 50]"
        @request="onTableRequest"
        @row-click="onRowClick"
        class="pluse-table"
        no-data-label="Sem colaboradores registados."
        loading-label="A carregar…"
      >
        <template #body-cell-full_name="props">
          <q-td :props="props">
            <div class="flex items-center gap-3">
              <span class="employee-avatar">
                {{ initialsOf(props.row.full_name) }}
              </span>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-mono truncate">{{ props.row.full_name }}</div>
                <div class="text-xs text-muted-foreground">{{ props.row.employee_number }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-types="props">
          <q-td :props="props">
            <div class="flex flex-wrap gap-1">
              <AppBadge
                v-for="t in props.row.types"
                :key="t.id"
                size="sm"
                variant="info"
              >
                {{ t.name }}
              </AppBadge>
              <span v-if="!props.row.types?.length" class="text-xs text-muted-foreground">—</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <AppBadge :variant="statusVariant(props.row.status)">
              {{ props.row.status_display }}
            </AppBadge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" auto-width @click.stop>
            <q-btn flat round dense icon="more_vert" size="sm">
              <q-menu>
                <q-list dense style="min-width: 180px">
                  <q-item clickable v-close-popup :to="`/employees/${props.row.id}`">
                    <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                    <q-item-section>Ver detalhe</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup :to="`/employees/${props.row.id}/edit`">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-separator v-if="props.row.status === 'pending'" />
                  <q-item
                    v-if="props.row.status === 'pending'"
                    clickable
                    v-close-popup
                    @click="approve(props.row)"
                  >
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Aprovar</q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.row.status === 'active'"
                    clickable
                    v-close-popup
                    @click="inactivate(props.row)"
                  >
                    <q-item-section avatar><q-icon name="block" color="negative" /></q-item-section>
                    <q-item-section>Inactivar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="Ainda não há colaboradores"
            description="Comece por adicionar um vigilante ou supervisor para arrancar com escalas e check-ins."
            icon="ki-people"
            cta-label="Novo colaborador"
            :cta-to="{ name: 'employees-new' }"
          />
        </template>
      </q-table>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const router = useRouter()
const $q = useQuasar()
const store = useEmployeesStore()
const toast = useToast()

const filters = reactive({ search: '', status: '' })
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
})

const columns = [
  { name: 'full_name', label: 'Colaborador', field: 'full_name', align: 'left', sortable: true },
  { name: 'types', label: 'Função', field: 'types', align: 'left' },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  { name: 'hire_date', label: 'Admissão', field: 'hire_date', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const statusOptions = [
  { label: 'Pendentes', value: 'pending' },
  { label: 'Activos', value: 'active' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Inactivos', value: 'inactive' },
]

const pendingCount = computed(() => store.items.filter((e) => e.status === 'pending').length)

function statusVariant(status) {
  return {
    active: 'success',
    approved: 'success',
    pending: 'warning',
    inactive: 'neutral',
  }[status] || 'neutral'
}

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

async function fetchPage() {
  const { page, rowsPerPage, sortBy, descending } = pagination.value
  const ordering = `${descending ? '-' : ''}${sortBy}`
  const params = { page, page_size: rowsPerPage, ordering }
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  await store.fetchList(params)
  pagination.value.rowsNumber = store.count
}

function onTableRequest(props) {
  pagination.value = { ...pagination.value, ...props.pagination }
  fetchPage()
}
function onFiltersChanged() {
  pagination.value.page = 1
  fetchPage()
}
function onRowClick(_evt, row) {
  router.push(`/employees/${row.id}`)
}

async function approve(employee) {
  $q.dialog({
    title: 'Aprovar colaborador',
    message: `Aprovar <b>${employee.full_name}</b>? A conta de utilizador (se existir) será activada.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await store.approve(employee.id)
      toast.success(`${employee.full_name} foi aprovado.`)
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function inactivate(employee) {
  $q.dialog({
    title: 'Inactivar colaborador',
    message: `Inactivar <b>${employee.full_name}</b>? O acesso à plataforma é suspenso.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Inactivar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await store.inactivate(employee.id)
      toast.success(`${employee.full_name} foi inactivado.`)
    } catch (err) {
      toast.error('Não foi possível inactivar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(fetchPage)
</script>

<style scoped>
.pluse-card {
  background: var(--card);
}
.pluse-table :deep(.q-table__top) {
  display: none;
}
.employee-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  font-size: 0.8125rem;
  font-weight: 700;
}
</style>
