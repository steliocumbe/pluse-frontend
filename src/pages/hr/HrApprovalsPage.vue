<!--
  /employees/approvals — Caixa de aprovações (unificada, RH-2).
  Junta tudo o que aguarda o Diretor Financeiro: colaboradores, contratos,
  cessações e transferências pendentes, num só sítio.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Aprovações pendentes"
    description="Triagem de tudo o que aguarda decisão do Diretor Financeiro — admissões, contratos, cessações e transferências."
  >
    <template #meta>
      <span class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ totalPending }} a aguardar
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="refresh" label="Actualizar" :loading="loading"
        @click="loadAll"
      />
    </template>

    <div v-if="loading && totalPending === 0" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="totalPending === 0"
      title="Nada pendente"
      description="Não há aprovações por tratar. Voltaremos aqui quando houver novos pedidos."
      icon="ki-check-circle"
    />

    <div v-else class="flex flex-col gap-6">
      <section v-for="group in groups" :key="group.key" v-show="group.items.length">
        <header class="group-head">
          <span class="group-icon" :class="`group-icon--${group.tone}`">
            <AppIcon :name="group.icon" :size="16" />
          </span>
          <span class="group-title">{{ group.title }}</span>
          <span class="group-count">{{ group.items.length }}</span>
        </header>

        <div class="grid gap-3">
          <q-card
            v-for="item in group.items"
            :key="`${group.key}-${item.id}`"
            flat bordered class="approval-card"
          >
            <div class="flex flex-wrap items-center gap-4 p-4">
              <div class="grow min-w-0">
                <router-link :to="item.to" class="approval-title">
                  {{ item.title }}
                </router-link>
                <div class="text-sm text-muted-foreground">{{ item.subtitle }}</div>
              </div>
              <div class="flex flex-wrap gap-2 ms-auto">
                <q-btn outline no-caps icon="visibility" label="Ver" :to="item.to" />
                <q-btn
                  v-if="group.key !== 'employees'"
                  outline no-caps color="negative" icon="cancel" label="Rejeitar"
                  @click="reject(group, item)"
                />
                <q-btn
                  color="positive" unelevated no-caps
                  icon="check_circle" label="Aprovar"
                  @click="approve(group, item)"
                />
              </div>
            </div>
          </q-card>
        </div>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { employeeService } from 'src/services/employee.service'
import {
  contractService,
  terminationService,
  transferService,
} from 'src/services/employment.service'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const toast = useToast()

const loading = ref(false)
const employees = ref([])
const contracts = ref([])
const terminations = ref([])
const transfers = ref([])

function rows(data) {
  return data?.results ?? data ?? []
}
function formatDate(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

const groups = computed(() => [
  {
    key: 'employees',
    title: 'Admissões de colaboradores',
    icon: 'ki-people',
    tone: 'primary',
    service: employeeService,
    items: employees.value.map((e) => ({
      id: e.id,
      title: e.full_name,
      subtitle: `${e.employee_number}${e.current_job_title ? ' · ' + e.current_job_title : ''}`,
      to: `/employees/${e.id}`,
    })),
  },
  {
    key: 'contracts',
    title: 'Contratos de trabalho',
    icon: 'ki-document',
    tone: 'info',
    service: contractService,
    items: contracts.value.map((c) => ({
      id: c.id,
      title: `${c.reference} — ${c.job_title}`,
      subtitle: `${c.employee_name} · ${c.contract_type_display}`,
      to: { name: 'employment-contracts-detail', params: { id: c.id } },
    })),
  },
  {
    key: 'terminations',
    title: 'Cessações de contrato',
    icon: 'ki-exit-right',
    tone: 'danger',
    service: terminationService,
    items: terminations.value.map((t) => ({
      id: t.id,
      title: `Cessação — ${t.employee_name}`,
      subtitle: `${t.reason_display} · ${formatDate(t.termination_date)}`,
      to: { name: 'employment-contracts-detail', params: { id: t.contract } },
    })),
  },
  {
    key: 'transfers',
    title: 'Transferências',
    icon: 'ki-arrow-right',
    tone: 'warning',
    service: transferService,
    items: transfers.value.map((t) => ({
      id: t.id,
      title: `Transferência — ${t.employee_name}`,
      subtitle: `Efectiva a ${formatDate(t.effective_date)}`,
      to: `/employees/${t.employee}`,
    })),
  },
])

const totalPending = computed(
  () => groups.value.reduce((n, g) => n + g.items.length, 0),
)

async function loadAll() {
  loading.value = true
  try {
    const [emp, con, ter, tra] = await Promise.all([
      employeeService.list({ status: 'pending', page_size: 100 }),
      contractService.list({ status: 'pending', page_size: 100 }),
      terminationService.list({ status: 'pending', page_size: 100 }),
      transferService.list({ status: 'pending', page_size: 100 }),
    ])
    employees.value = rows(emp)
    contracts.value = rows(con)
    terminations.value = rows(ter)
    transfers.value = rows(tra)
  } catch {
    /* axios interceptor toasts */
  } finally {
    loading.value = false
  }
}

function approve(group, item) {
  $q.dialog({
    title: 'Aprovar',
    message: `Aprovar <b>${item.title}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await group.service.approve(item.id)
      toast.success('Aprovado.')
      await loadAll()
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

function reject(group, item) {
  $q.dialog({
    title: 'Rejeitar',
    message: `Rejeitar <b>${item.title}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await group.service.reject(item.id)
      toast.success('Rejeitado.')
      await loadAll()
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(loadAll)
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
.group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.group-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 8px;
}
.group-icon--primary { background: color-mix(in oklab, var(--primary) 14%, transparent); color: var(--primary); }
.group-icon--info { background: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent); color: var(--pluse-cyan-500, #06b6d4); }
.group-icon--danger { background: color-mix(in oklab, var(--destructive) 14%, transparent); color: var(--destructive); }
.group-icon--warning { background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent); color: var(--pluse-amber-600, #d97706); }
.group-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--mono);
}
.group-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.approval-card {
  background: var(--card);
  transition: border-color 160ms ease;
}
.approval-card:hover {
  border-color: color-mix(in oklab, var(--primary) 24%, var(--border));
}
.approval-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--mono);
  text-decoration: none;
}
.approval-title:hover { color: var(--primary); }
</style>
