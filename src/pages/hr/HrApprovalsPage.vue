<!--
  /employees/approvals — Caixa de aprovações (unificada, RH-2).
  Junta tudo o que aguarda o Diretor Financeiro: clientes, colaboradores,
  contratos, cessações e transferências pendentes, num só sítio.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Aprovações pendentes"
    description="Triagem de tudo o que aguarda decisão do Diretor Financeiro — clientes, admissões, contratos, cessações e transferências."
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
      <!-- Tabs (minimalist, scrollable em mobile) -->
      <nav class="approvals-tabs-bar" role="tablist" aria-label="Categorias de aprovação">
        <button
          v-for="group in groups" :key="group.key"
          type="button" role="tab"
          :aria-selected="activeTab === group.key"
          class="approvals-tab"
          :class="{ 'is-active': activeTab === group.key }"
          @click="activeTab = group.key"
        >
          <AppIcon :name="group.icon" :size="15" class="approvals-tab__icon" />
          <span class="approvals-tab__label">{{ group.shortTitle || group.title }}</span>
          <span
            v-if="group.items.length"
            class="approvals-tab__count"
            :class="{ 'is-active': activeTab === group.key, 'is-warn': group.items.length > 0 }"
          >
            {{ group.items.length }}
          </span>
        </button>
      </nav>

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
              <div class="approval-card__row">
                <span class="approval-icon" :class="`approval-icon--${group.tone}`">
                  <AppIcon :name="group.icon" :size="16" />
                </span>
                <div class="approval-card__body">
                  <router-link
                    v-if="item.to && !item.modal"
                    :to="item.to" class="approval-title"
                  >{{ item.title }}</router-link>
                  <button
                    v-else
                    type="button" class="approval-title approval-title--btn"
                    @click="openDetail(group, item)"
                  >{{ item.title }}</button>
                  <div v-if="item.subtitle" class="text-sm text-muted-foreground">
                    {{ item.subtitle }}
                  </div>
                  <!-- Linhas estruturadas (origem/destino/motivo/etc) -->
                  <ul v-if="item.details?.length" class="approval-details">
                    <li
                      v-for="(d, di) in item.details"
                      :key="di"
                      :class="['approval-detail', d.tone ? `approval-detail--${d.tone}` : '']"
                    >
                      <AppIcon v-if="d.icon" :name="d.icon" :size="13" class="approval-detail__icon" />
                      <span v-if="d.label" class="approval-detail__label">{{ d.label }}:</span>
                      <span class="approval-detail__value">{{ d.value }}</span>
                    </li>
                  </ul>
                </div>
                <div class="approval-card__actions">
                  <q-btn
                    v-if="item.modal"
                    outline no-caps icon="visibility" label="Ver"
                    @click="openDetail(group, item)"
                  />
                  <q-btn
                    v-else
                    outline no-caps icon="visibility" label="Ver" :to="item.to"
                  />
                  <q-btn
                    outline no-caps color="negative" icon="cancel" label="Rejeitar"
                    @click="openDecision(group, item)"
                  />
                  <q-btn
                    color="positive" unelevated no-caps
                    icon="check_circle" label="Aprovar"
                    @click="openDecision(group, item)"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- Modal de detalhe (Ausências / Justificações) -->
    <AppModal v-model="showDetail" size="md">
      <div v-if="detailItem && detailGroup" class="p-5">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-4">
          <span class="approval-icon" :class="`approval-icon--${detailGroup.tone}`">
            <AppIcon :name="detailGroup.icon" :size="18" />
          </span>
          <div class="grow min-w-0">
            <h3 class="text-base font-bold text-mono leading-tight">
              {{ detailItem.title }}
            </h3>
            <p v-if="detailItem.subtitle" class="text-sm text-muted-foreground mt-0.5">
              {{ detailItem.subtitle }}
            </p>
          </div>
          <AppBadge v-if="detailItem.raw?.status_display" variant="warning">
            {{ detailItem.raw.status_display }}
          </AppBadge>
        </div>

        <!-- Detalhes específicos por tipo -->
        <dl v-if="detailGroup.key === 'leaves'" class="detail-grid">
          <div><dt>Tipo de ausência</dt><dd>{{ detailItem.raw.leave_type_display }}</dd></div>
          <div><dt>Período</dt><dd>{{ formatDate(detailItem.raw.start_date) }} → {{ formatDate(detailItem.raw.end_date) }}</dd></div>
          <div><dt>Total de dias</dt><dd><strong>{{ detailItem.raw.days }} dia{{ detailItem.raw.days === 1 ? '' : 's' }}</strong></dd></div>
          <div v-if="detailItem.raw.employee_number"><dt>Nº colaborador</dt><dd>{{ detailItem.raw.employee_number }}</dd></div>
          <div v-if="detailItem.raw.reason" class="detail-grid__wide">
            <dt>Motivo</dt><dd class="whitespace-pre-line">{{ detailItem.raw.reason }}</dd>
          </div>
          <div v-if="detailItem.raw.document" class="detail-grid__wide">
            <dt>Documento anexado</dt>
            <dd>
              <a :href="detailFileUrl(detailItem.raw.document)" target="_blank" rel="noopener" class="file-link">
                <AppIcon name="ki-document" :size="14" /> Abrir documento
              </a>
            </dd>
          </div>
        </dl>

        <dl v-else-if="detailGroup.key === 'justifications'" class="detail-grid">
          <div><dt>Colaborador</dt><dd>{{ detailItem.raw.employee_name }}</dd></div>
          <div v-if="detailItem.raw.shift_date">
            <dt>Turno</dt>
            <dd>{{ formatDate(detailItem.raw.shift_date) }} ({{ detailItem.raw.shift_period_display }})</dd>
          </div>
          <div v-if="detailItem.raw.post_name"><dt>Posto</dt><dd>{{ detailItem.raw.post_name }}</dd></div>
          <div v-if="detailItem.raw.justification_type_display"><dt>Tipo de justificação</dt><dd>{{ detailItem.raw.justification_type_display }}</dd></div>
          <div v-if="detailItem.raw.description" class="detail-grid__wide">
            <dt>Descrição</dt><dd class="whitespace-pre-line">{{ detailItem.raw.description }}</dd>
          </div>
          <div v-if="detailItem.raw.document" class="detail-grid__wide">
            <dt>Documento anexado</dt>
            <dd>
              <a :href="detailFileUrl(detailItem.raw.document)" target="_blank" rel="noopener" class="file-link">
                <AppIcon name="ki-document" :size="14" /> Abrir documento
              </a>
            </dd>
          </div>
        </dl>

        <!-- Footer com acções -->
        <div class="flex flex-wrap justify-end gap-2 mt-6 pt-4 border-t border-border">
          <q-btn flat no-caps label="Fechar" @click="showDetail = false" />
          <q-btn
            v-if="detailItem.raw?.status === 'pending'"
            outline no-caps color="negative" icon="cancel" label="Rejeitar"
            @click="showDetail = false; openDecision(detailGroup, detailItem)"
          />
          <q-btn
            v-if="detailItem.raw?.status === 'pending'"
            unelevated no-caps color="positive" icon="check_circle" label="Aprovar"
            @click="showDetail = false; openDecision(detailGroup, detailItem)"
          />
        </div>
      </div>
    </AppModal>

    <AppModal v-model="showDecision" size="md" :persistent="true">
      <div v-if="decisionItem && decisionGroup" class="decision-modal">
        <header class="decision-modal__head">
          <span class="decision-modal__icon">
            <AppIcon name="ki-warning-2" :size="18" />
          </span>
          <div>
            <h3>Confirmar decisão</h3>
            <p>{{ decisionItem.title }}</p>
          </div>
        </header>

        <p class="decision-modal__body">
          Escolha se pretende aprovar ou rejeitar este registo. A ação remove o item da caixa de pendentes.
        </p>

        <footer class="decision-modal__footer">
          <span class="decision-signature">MIGUEL M.C ERP</span>
          <div class="decision-modal__actions">
            <q-btn flat no-caps label="Cancelar" @click="showDecision = false" :disable="decisionLoading" />
            <q-btn
              outline
              no-caps
              color="negative"
              icon="cancel"
              label="Rejeitar"
              :loading="decisionLoading && decisionAction === 'reject'"
              @click="submitDecision('reject')"
            />
            <q-btn
              unelevated
              no-caps
              color="positive"
              icon="check_circle"
              label="Aprovar"
              :loading="decisionLoading && decisionAction === 'approve'"
              @click="submitDecision('approve')"
            />
          </div>
        </footer>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { clientService } from 'src/services/client.service'
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
import AppModal from 'src/components/ui/AppModal.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'

const toast = useToast()

const loading = ref(false)
const clientApprovals = ref([])
const employees = ref([])
const contracts = ref([])
const terminations = ref([])
const transfers = ref([])
const leaves = ref([])
const justifications = ref([])

// Tab actual — começa na primeira com items, fallback para 'clients'
const activeTab = ref('clients')

// ── Modal de detalhe (usado para Ausências e Justificações) ───────────
const showDetail = ref(false)
const detailItem = ref(null)
const detailGroup = ref(null)
const showDecision = ref(false)
const decisionItem = ref(null)
const decisionGroup = ref(null)
const decisionLoading = ref(false)
const decisionAction = ref('approve')

function openDetail(group, item) {
  detailGroup.value = group
  detailItem.value = item
  showDetail.value = true
}

function detailFileUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function rows(data) {
  return data?.results ?? data ?? []
}
function formatDate(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

function riskLabel(value) {
  return {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',
  }[value] || value || 'Não definido'
}

function buildClientDetails(c) {
  const details = [
    {
      icon: 'ki-warning-2',
      label: 'Etapa',
      value: c.stage_display || 'Análise de risco em aprovação',
      tone: 'accent',
    },
    {
      icon: 'ki-document',
      label: 'Risco',
      value: riskLabel(c.risk_level),
    },
  ]
  if (c.client_type_display) {
    details.push({ icon: 'ki-briefcase', label: 'Tipo', value: c.client_type_display })
  }
  if (c.nuit) {
    details.push({ icon: 'ki-bank', label: 'NUIT', value: c.nuit, tone: 'subtle' })
  }
  return details
}

/**
 * Constrói as linhas de info (origem → destino, motivo, etc) para um
 * Transfer. Cada linha tem { icon?, label?, value, tone? }.
 */
/**
 * Linhas resumidas para um Pedido de ausência (no card da lista).
 */
function buildLeaveDetails(l) {
  const details = []
  if (l.employee_number) {
    details.push({ icon: 'ki-profile-user', label: 'Nº', value: l.employee_number, tone: 'subtle' })
  }
  details.push({
    icon: 'ki-calendar', label: 'Período',
    value: `${formatDate(l.start_date)} → ${formatDate(l.end_date)} (${l.days} dia${l.days === 1 ? '' : 's'})`,
    tone: 'accent',
  })
  if (l.reason) {
    details.push({ icon: 'ki-message-text', label: 'Motivo', value: l.reason })
  }
  if (l.document) {
    details.push({ icon: 'ki-document', label: 'Documento', value: 'Anexado' })
  }
  return details
}

/**
 * Linhas resumidas para uma Justificação de falta.
 */
function buildJustificationDetails(j) {
  const details = []
  if (j.shift_date) {
    details.push({
      icon: 'ki-calendar', label: 'Turno',
      value: `${formatDate(j.shift_date)} (${j.shift_period_display || '—'}) · ${j.post_name || '—'}`,
      tone: 'accent',
    })
  }
  if (j.description) {
    details.push({ icon: 'ki-message-text', label: 'Descrição', value: j.description })
  }
  if (j.document) {
    details.push({ icon: 'ki-document', label: 'Documento', value: 'Anexado' })
  }
  return details
}

function buildTransferDetails(t) {
  const details = []

  // Origem (snapshot)
  const fromBits = []
  if (t.previous_client_name) fromBits.push(t.previous_client_name)
  if (t.previous_post_name) fromBits.push(t.previous_post_name)
  if (!fromBits.length && t.previous_department_display) {
    fromBits.push(t.previous_department_display)
    if (t.previous_support_unit_display) fromBits.push(t.previous_support_unit_display)
  }
  if (t.previous_shift) fromBits.push(`turno ${t.previous_shift}`)
  const fromText = fromBits.length ? fromBits.join(' · ') : '—'

  // Destino
  const toBits = []
  if (t.new_client_name) toBits.push(t.new_client_name)
  if (t.new_post_name) toBits.push(t.new_post_name)
  if (!toBits.length && t.new_department_display) {
    toBits.push(t.new_department_display)
    if (t.new_support_unit_display) toBits.push(t.new_support_unit_display)
  }
  if (t.new_shift) toBits.push(`turno ${t.new_shift}`)
  const toText = toBits.length ? toBits.join(' · ') : '—'

  details.push({ icon: 'ki-arrow-up', label: 'Origem', value: fromText })
  details.push({ icon: 'ki-arrow-right', label: 'Destino', value: toText, tone: 'accent' })

  if (t.reason) {
    details.push({ icon: 'ki-message-text', label: 'Motivo', value: t.reason })
  }
  if (t.notes) {
    details.push({ icon: 'ki-document', label: 'Notas', value: t.notes })
  }
  if (t.created_by_name) {
    details.push({
      icon: 'ki-profile-user',
      label: 'Submetida por',
      value: t.created_by_name,
      tone: 'subtle',
    })
  }

  return details
}

const groups = computed(() => [
  {
    key: 'clients',
    title: 'Clientes em aprovação',
    shortTitle: 'Clientes',
    icon: 'ki-profile-user',
    tone: 'info',
    service: clientService,
    items: clientApprovals.value.map((c) => ({
      id: c.id,
      title: c.short_name ? `${c.name} (${c.short_name})` : c.name,
      subtitle: c.stage_display || 'Análise de risco em aprovação',
      details: buildClientDetails(c),
      to: { name: 'clients-detail', params: { id: c.id } },
    })),
  },
  {
    key: 'employees',
    title: 'Admissões de colaboradores',
    shortTitle: 'Admissões',
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
    shortTitle: 'Contratos',
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
    shortTitle: 'Cessações',
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
    shortTitle: 'Transferências',
    icon: 'ki-arrow-right',
    tone: 'warning',
    service: transferService,
    items: transfers.value.map((t) => ({
      id: t.id,
      title: t.employee_name || 'Transferência',
      subtitle: t.employee_number
        ? `${t.employee_number} · Efectiva a ${formatDate(t.effective_date)}`
        : `Efectiva a ${formatDate(t.effective_date)}`,
      details: buildTransferDetails(t),
      to: { name: 'employees-detail', params: { id: t.employee }, query: { tab: 'transfers' } },
    })),
  },
  {
    key: 'leaves',
    title: 'Pedidos de ausência (férias / baixas)',
    shortTitle: 'Ausências',
    icon: 'ki-calendar-tick',
    tone: 'primary',
    service: leaveRequestService,
    items: leaves.value.map((l) => ({
      id: l.id,
      raw: l,
      title: `${l.leave_type_display} — ${l.employee_name}`,
      subtitle: `${formatDate(l.start_date)} → ${formatDate(l.end_date)} · ${l.days} dia(s)`,
      details: buildLeaveDetails(l),
      modal: true,
    })),
  },
  {
    key: 'justifications',
    title: 'Justificações de falta',
    shortTitle: 'Justificações',
    icon: 'ki-warning-2',
    tone: 'danger',
    service: absenceJustificationService,
    items: justifications.value.map((j) => ({
      id: j.id,
      raw: j,
      title: `Falta — ${j.employee_name}`,
      subtitle: `${j.justification_type_display} · ${formatDate(j.shift_date)} (${j.shift_period_display}) · ${j.post_name}`,
      details: buildJustificationDetails(j),
      modal: true,
    })),
  },
])

const totalPending = computed(
  () => groups.value.reduce((n, g) => n + g.items.length, 0),
)

async function loadAll() {
  loading.value = true
  try {
    const [cli, emp, con, ter, tra, lvs, jst] = await Promise.all([
      clientService.list({ stage: 'risk_review', page_size: 100 }),
      employeeService.list({ status: 'pending', page_size: 100 }),
      contractService.list({ status: 'pending', page_size: 100 }),
      terminationService.list({ status: 'pending', page_size: 100 }),
      transferService.list({ status: 'pending', page_size: 100 }),
      leaveRequestService.list({ status: 'pending', page_size: 100 }),
      absenceJustificationService.list({ status: 'pending', page_size: 100 }),
    ])
    clientApprovals.value = rows(cli)
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

function openDecision(group, item) {
  decisionGroup.value = group
  decisionItem.value = item
  showDecision.value = true
}

async function submitDecision(action) {
  if (!decisionGroup.value || !decisionItem.value || decisionLoading.value) return

  decisionAction.value = action
  decisionLoading.value = true
  try {
    if (action === 'approve') {
      await decisionGroup.value.service.approve(decisionItem.value.id)
      toast.success('Aprovado.', { caption: decisionItem.value.title })
    } else {
      await decisionGroup.value.service.reject(decisionItem.value.id)
      toast.success('Rejeitado.', { caption: decisionItem.value.title })
    }
    showDecision.value = false
    await loadAll()
    refreshPendingCounts()
  } catch (err) {
    if (action === 'approve') {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    } else {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  } finally {
    decisionLoading.value = false
  }
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
/* ── Tabs (minimalist, scrollable em mobile) ────────────────────────── */
.approvals-tabs-bar {
  display: flex;
  gap: 2px;
  margin-bottom: 22px;
  padding: 0 4px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}
.approvals-tabs-bar::-webkit-scrollbar { display: none; }

.approvals-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  margin-bottom: -1px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted-foreground);
  cursor: pointer;
  white-space: nowrap;
  flex: none;
  border-radius: 6px 6px 0 0;
  transition: color 180ms ease, border-color 200ms ease, background-color 160ms ease;
}
.approvals-tab:hover:not(.is-active) {
  color: var(--foreground);
  background: color-mix(in oklab, var(--muted) 40%, transparent);
}
.approvals-tab:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--primary) 50%, transparent);
  outline-offset: -2px;
}
.approvals-tab.is-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.approvals-tab__icon {
  color: color-mix(in oklab, var(--muted-foreground) 80%, transparent);
  flex: none;
  transition: color 180ms ease;
}
.approvals-tab.is-active .approvals-tab__icon {
  color: var(--primary);
}
.approvals-tab__label {
  letter-spacing: -0.005em;
}
.approvals-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  transition: background-color 180ms ease, color 180ms ease;
}
.approvals-tab__count.is-active {
  background: color-mix(in oklab, var(--destructive) 24%, transparent);
}

.approvals-panels {
  background: transparent;
}
.approvals-panels :deep(.q-tab-panel) {
  padding: 0;
}

@media (max-width: 640px) {
  .approvals-tab { padding: 12px 12px 10px; font-size: 0.82rem; }
  .approvals-tab__icon { display: none; }
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
.approval-card__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
}
.approval-card__body {
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.approval-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
}
.approval-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--mono);
  text-decoration: none;
  line-height: 1.25;
}
.approval-title:hover { color: var(--primary); }
.approval-title--btn {
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

/* ── Modal de detalhe ───────────────────────────────────────────────── */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px 18px;
  margin: 0;
}
.detail-grid > div { min-width: 0; }
.detail-grid__wide { grid-column: 1 / -1; }
.detail-grid dt {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
  margin: 0 0 4px;
}
.detail-grid dd {
  margin: 0;
  font-size: 0.92rem;
  color: var(--foreground);
  word-break: break-word;
}
.detail-grid dd strong {
  font-weight: 700;
  color: var(--primary);
}
.file-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.file-link:hover { text-decoration: underline; }

.decision-modal {
  padding: 20px;
  background: linear-gradient(180deg, color-mix(in oklab, var(--card) 92%, white), var(--card));
}

.decision-modal__head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.decision-modal__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: color-mix(in oklab, white 72%, var(--primary) 28%);
  box-shadow: 0 0 24px color-mix(in oklab, white 70%, var(--primary) 30%);
}

.decision-modal__head h3 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 760;
  color: var(--mono);
}

.decision-modal__head p {
  margin: 4px 0 0;
  color: var(--muted-foreground);
  font-size: 0.9rem;
}

.decision-modal__body {
  margin: 14px 0 0;
  color: var(--foreground);
  line-height: 1.45;
}

.decision-modal__footer {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.decision-signature {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: color-mix(in oklab, var(--foreground) 74%, white 26%);
}

.decision-modal__actions {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Detalhes estruturados (origem/destino/motivo/etc) ───────────────── */
.approval-details {
  list-style: none;
  margin: 4px 0 0;
  padding: 8px 10px;
  background: color-mix(in oklab, var(--muted) 50%, transparent);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.approval-detail {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.84rem;
  color: var(--foreground);
  line-height: 1.4;
}
.approval-detail__icon {
  flex: none;
  color: var(--muted-foreground);
  align-self: center;
}
.approval-detail__label {
  color: var(--muted-foreground);
  font-weight: 600;
  font-size: 0.78rem;
  flex: none;
}
.approval-detail__value {
  color: var(--foreground);
  word-break: break-word;
}
.approval-detail--accent .approval-detail__value {
  color: var(--primary);
  font-weight: 600;
}
.approval-detail--accent .approval-detail__icon {
  color: var(--primary);
}
.approval-detail--subtle .approval-detail__value {
  color: var(--muted-foreground);
  font-size: 0.78rem;
  font-style: italic;
}

@media (max-width: 640px) {
  .approval-card__actions {
    margin-left: 0;
    width: 100%;
  }
  .approval-card__actions .q-btn { flex: 1; min-width: 0; }
}
</style>
