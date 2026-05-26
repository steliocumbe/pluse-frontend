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

    <template v-else>
      <!-- Tabs com contagens por categoria -->
      <q-tabs
        v-model="activeTab"
        class="approvals-tabs"
        align="left"
        active-color="primary"
        indicator-color="primary"
        no-caps
        dense
      >
        <q-tab
          v-for="group in groups"
          :key="group.key"
          :name="group.key"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <AppIcon :name="group.icon" :size="14" />
              <span>{{ group.title }}</span>
              <span v-if="group.items.length" class="tab-badge">{{ group.items.length }}</span>
            </div>
          </template>
        </q-tab>
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="approvals-panels">
        <q-tab-panel
          v-for="group in groups" :key="group.key"
          :name="group.key" class="p-0"
        >
          <div v-if="!group.items.length" class="empty-tab">
            <AppIcon name="ki-check-circle" :size="32" icon-class="text-positive" />
            <p>Nada pendente nesta categoria.</p>
          </div>

          <div v-else class="grid gap-3">
            <q-card
              v-for="item in group.items"
              :key="`${group.key}-${item.id}`"
              flat bordered class="approval-card"
            >
              <div class="flex flex-wrap items-center gap-4 p-4">
                <span class="approval-icon" :class="`approval-icon--${group.tone}`">
                  <AppIcon :name="group.icon" :size="16" />
                </span>
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
        </q-tab-panel>
      </q-tab-panels>
    </template>
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
import {
  leaveRequestService,
  absenceJustificationService,
} from 'src/services/leaves.service'
import { useToast } from 'src/composables/useToast'
import { refreshPendingCounts } from 'src/composables/usePendingCounts'
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
const leaves = ref([])
const justifications = ref([])

// Tab actual — começa na primeira com items, fallback para 'employees'
const activeTab = ref('employees')

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
  {
    key: 'leaves',
    title: 'Pedidos de ausência (férias / baixas)',
    icon: 'ki-calendar-tick',
    tone: 'primary',
    service: leaveRequestService,
    items: leaves.value.map((l) => ({
      id: l.id,
      title: `${l.leave_type_display} — ${l.employee_name}`,
      subtitle: `${formatDate(l.start_date)} → ${formatDate(l.end_date)} · ${l.days} dia(s)`,
      to: l.leave_type === 'sick_leave' ? '/sick-leaves' : '/leaves',
    })),
  },
  {
    key: 'justifications',
    title: 'Justificações de falta',
    icon: 'ki-warning-2',
    tone: 'danger',
    service: absenceJustificationService,
    items: justifications.value.map((j) => ({
      id: j.id,
      title: `Falta — ${j.employee_name}`,
      subtitle: `${j.justification_type_display} · ${formatDate(j.shift_date)} (${j.shift_period_display}) · ${j.post_name}`,
      to: '/absences',
    })),
  },
])

const totalPending = computed(
  () => groups.value.reduce((n, g) => n + g.items.length, 0),
)

async function loadAll() {
  loading.value = true
  try {
    const [emp, con, ter, tra, lvs, jst] = await Promise.all([
      employeeService.list({ status: 'pending', page_size: 100 }),
      contractService.list({ status: 'pending', page_size: 100 }),
      terminationService.list({ status: 'pending', page_size: 100 }),
      transferService.list({ status: 'pending', page_size: 100 }),
      leaveRequestService.list({ status: 'pending', page_size: 100 }),
      absenceJustificationService.list({ status: 'pending', page_size: 100 }),
    ])
    employees.value = rows(emp)
    contracts.value = rows(con)
    terminations.value = rows(ter)
    transfers.value = rows(tra)
    leaves.value = rows(lvs)
    justifications.value = rows(jst)

    // Auto-select primeira tab com items
    if (groups.value.find((g) => g.key === activeTab.value)?.items.length === 0) {
      const firstWithItems = groups.value.find((g) => g.items.length > 0)
      if (firstWithItems) activeTab.value = firstWithItems.key
    }
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
      refreshPendingCounts()
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
      refreshPendingCounts()
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
/* ── Tabs ───────────────────────────────────────────────────────────── */
.approvals-tabs {
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.approvals-tabs :deep(.q-tab) {
  padding: 10px 14px;
  min-height: 44px;
  font-weight: 600;
}
.tab-badge {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  margin-left: 2px;
}
.approvals-panels {
  background: transparent;
}
.approvals-panels :deep(.q-tab-panel) {
  padding: 0;
}

.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 16px;
  color: var(--muted-foreground);
  background: var(--card);
  border: 1px dashed var(--border);
  border-radius: 12px;
}
.empty-tab p { margin: 0; font-size: 0.9rem; }

.approval-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
}
.approval-icon--primary { background: color-mix(in oklab, var(--primary) 14%, transparent); color: var(--primary); }
.approval-icon--info { background: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent); color: var(--pluse-cyan-500, #06b6d4); }
.approval-icon--danger { background: color-mix(in oklab, var(--destructive) 14%, transparent); color: var(--destructive); }
.approval-icon--warning { background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent); color: var(--pluse-amber-600, #d97706); }

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
