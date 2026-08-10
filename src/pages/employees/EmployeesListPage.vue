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

      <q-card-section class="pt-0">
        <ActiveFiltersBar
          :filters="filters"
          :config="filterConfig"
          @clear="onClearFilter"
          @clear-all="onClearAllFilters"
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
        :rows-per-page-options="[10, 15, 25, 50]"
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
                  <q-separator v-if="props.row.status === 'pending' || props.row.status === 'inactive'" />
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
                    v-if="props.row.status === 'inactive'"
                    clickable
                    v-close-popup
                    @click="activate(props.row)"
                  >
                    <q-item-section avatar><q-icon name="play_circle" color="positive" /></q-item-section>
                    <q-item-section>Activar vigilante</q-item-section>
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
                  <q-item clickable v-close-popup @click="deleteEmployee(props.row)">
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section>Apagar</q-item-section>
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

      <ModernAlert
        v-model="confirmState.open"
        :tone="confirmState.mode === 'delete' ? 'negative' : (confirmState.mode === 'approve' || confirmState.mode === 'activate') ? 'positive' : 'warning'"
        :title="confirmState.mode === 'delete' ? 'Apagar colaborador' : confirmState.mode === 'approve' ? 'Aprovar colaborador' : confirmState.mode === 'activate' ? 'Activar vigilante' : 'Inactivar colaborador'"
        :message="confirmState.employee
          ? (confirmState.mode === 'delete'
            ? `Apagar <b>${confirmState.employee.full_name}</b>? O registo vai desaparecer da lista.`
            : confirmState.mode === 'approve'
              ? `Aprovar <b>${confirmState.employee.full_name}</b>? A conta de utilizador (se existir) será activada.`
              : confirmState.mode === 'activate'
                ? `Activar <b>${confirmState.employee.full_name}</b>? A conta de utilizador (se existir) será reactivada.`
                : `Inactivar <b>${confirmState.employee.full_name}</b>? O acesso à plataforma é suspenso.`)
          : ''"
        :confirm-label="confirmState.mode === 'delete' ? 'Apagar' : confirmState.mode === 'approve' ? 'Aprovar' : confirmState.mode === 'activate' ? 'Activar' : 'Inactivar'"
        :confirm-icon="confirmState.mode === 'delete' ? 'delete' : (confirmState.mode === 'approve' || confirmState.mode === 'activate') ? 'check_circle' : 'block'"
        :confirm-tone="confirmState.mode === 'delete' ? 'negative' : (confirmState.mode === 'approve' || confirmState.mode === 'activate') ? 'positive' : 'negative'"
        @confirm="runConfirmAction"
        @cancel="confirmState.open = false"
      />
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'
import ModernAlert from 'src/components/ui/ModernAlert.vue'

const router = useRouter()
const store = useEmployeesStore()
const toast = useToast()

const filters = reactive({ search: '', status: '' })
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})
const confirmState = ref({ open: false, employee: null, mode: 'inactivate' })

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

// Config para a barra de filtros activos
const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'status', label: 'Estado', emptyValue: '', options: statusOptions },
]

function onClearFilter(key, emptyValue) {
  filters[key] = emptyValue
  onFiltersChanged()
}

function onClearAllFilters() {
  filters.search = ''
  filters.status = ''
  onFiltersChanged()
}

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
  confirmState.value = { open: true, employee, mode: 'approve' }
}

async function activate(employee) {
  confirmState.value = { open: true, employee, mode: 'activate' }
}

async function inactivate(employee) {
  confirmState.value = { open: true, employee, mode: 'inactivate' }
}

function deleteEmployee(employee) {
  confirmState.value = { open: true, employee, mode: 'delete' }
}

async function runConfirmAction() {
  const { employee, mode } = confirmState.value
  confirmState.value.open = false
  if (!employee) return

  try {
    if (mode === 'approve' || mode === 'activate') {
      await store.approve(employee.id)
      toast.success(mode === 'activate' ? `${employee.full_name} foi activado.` : `${employee.full_name} foi aprovado.`)
      return
    }
    if (mode === 'delete') {
      await store.remove(employee.id)
      toast.success(`${employee.full_name} foi apagado.`)
      await fetchPage()
      return
    }
    await store.inactivate(employee.id)
    toast.success(`${employee.full_name} foi inactivado.`)
  } catch (err) {
    toast.error('Não foi possível concluir a acção.', { caption: err?.response?.data?.detail })
  }
}

onMounted(fetchPage)
</script>

<style scoped>
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
