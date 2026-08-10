<!--
  /clients/:id — detalhe do cliente + workflow de onboarding.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros · Cliente"
    :title="client?.name || 'Cliente'"
    :description="client?.client_type_display || ''"
    :breadcrumb="[
      { label: 'Clientes', to: { name: 'clients-list' } },
      { label: client?.name || 'Detalhe' },
    ]"
    :back-to="{ name: 'clients-list' }"
  >
    <template #meta>
      <span v-if="client" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="stageIcon(client.stage)" size="14px" />
        {{ client.stage_display }}
      </span>
      <span v-if="client?.risk_level" class="admin-meta-chip">
        <AppIcon name="ki-shield-tick" :size="13" />
        Risco {{ riskLevelLabel(client.risk_level) }}
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar" :to="{ name: 'clients-list' }"
      />
      <template v-if="client">
        <q-btn
          outline no-caps class="admin-hero-button"
          icon="edit" label="Editar"
          :to="{ name: 'clients-edit', params: { id: client.id } }"
        />
        <q-btn
          v-if="client.stage === 'prospecting'"
          unelevated no-caps class="admin-hero-primary"
          icon="send" label="Submeter análise de risco"
          @click="submitRisk"
        />
        <q-btn
          v-if="client.stage === 'risk_review' && canApprove"
          unelevated no-caps class="admin-hero-primary"
          icon="check_circle" label="Aprovar admissão"
          @click="approve"
        />
        <q-btn
          v-if="client.stage === 'risk_review' && canApprove"
          outline no-caps class="admin-hero-button"
          icon="cancel" label="Devolver"
          @click="reject"
        />
      </template>
    </template>

    <div v-if="!client" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <template v-else>
      <!-- Onboarding progress -->
      <div class="onboarding-bar">
        <div
          v-for="(s, i) in stages"
          :key="s.value"
          class="onboarding-step"
          :class="{
            'onboarding-step--done': stageIndex > i,
            'onboarding-step--current': stageIndex === i,
          }"
        >
          <span class="onboarding-step__dot">
            <q-icon :name="stageIndex > i ? 'check' : s.icon" size="15px" />
          </span>
          <span class="onboarding-step__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Tabs (minimalist, consistent) -->
      <nav class="client-tabs-bar" role="tablist" aria-label="Secções do cliente">
        <button
          v-for="tab in tabsDef"
          :key="tab.name"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.name"
          class="client-tab"
          :class="{ 'is-active': activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <q-icon :name="tab.icon" size="17px" class="client-tab__icon" />
          <span class="client-tab__label">{{ tab.label }}</span>
          <span
            v-if="tab.count"
            class="client-tab__count"
            :class="{ 'is-active': activeTab === tab.name }"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>

      <q-tab-panels v-model="activeTab" animated class="client-tab-panels">
        <!-- ── Geral ──────────────────────────────────────────────── -->
        <q-tab-panel name="geral" class="p-0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section class="detail-section">
              <header class="detail-section__head">
                <span class="detail-section__icon"><AppIcon name="ki-profile-user" :size="16" /></span>
                <span class="detail-section__title">Identificação</span>
              </header>
              <div class="detail-section__body">
                <div class="field-row">
                  <span class="field-row__label">Tipo de cliente</span>
                  <span class="field-row__value">{{ client.client_type_display }}</span>
                </div>
                <div class="field-row">
                  <span class="field-row__label">NUIT</span>
                  <span class="field-row__value">{{ client.nuit || '—' }}</span>
                </div>
                <div class="field-row field-row--wide">
                  <span class="field-row__label">Morada</span>
                  <span class="field-row__value">{{ client.address || '—' }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <header class="detail-section__head">
                <span class="detail-section__icon"><AppIcon name="ki-phone" :size="16" /></span>
                <span class="detail-section__title">Contacto</span>
              </header>
              <div class="detail-section__body">
                <div class="field-row">
                  <span class="field-row__label">Nome</span>
                  <span class="field-row__value">{{ client.contact_name || '—' }}</span>
                </div>
                <div class="field-row">
                  <span class="field-row__label">Telefone</span>
                  <span class="field-row__value">{{ client.contact_phone || '—' }}</span>
                </div>
                <div class="field-row field-row--wide">
                  <span class="field-row__label">Email</span>
                  <span class="field-row__value">{{ client.contact_email || '—' }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section lg:col-span-2">
              <header class="detail-section__head">
                <span class="detail-section__icon"><AppIcon name="ki-shield-tick" :size="16" /></span>
                <span class="detail-section__title">Análise de risco</span>
              </header>
              <div class="detail-section__body">
                <div class="field-row">
                  <span class="field-row__label">Nível de risco</span>
                  <span class="field-row__value">
                    {{ client.risk_level ? riskLevelLabel(client.risk_level) : '— (por definir)' }}
                  </span>
                </div>
                <div class="field-row">
                  <span class="field-row__label">Relatório</span>
                  <span class="field-row__value">
                    <a v-if="client.risk_analysis_file" :href="absoluteFileUrl(client.risk_analysis_file)"
                       target="_blank" rel="noopener" class="file-link">
                      <AppIcon name="ki-document" :size="14" /> Abrir relatório
                    </a>
                    <span v-else>— (por anexar)</span>
                  </span>
                </div>
                <div v-if="client.risk_notes" class="field-row field-row--wide">
                  <span class="field-row__label">Notas</span>
                  <span class="field-row__value whitespace-pre-line">{{ client.risk_notes }}</span>
                </div>
              </div>
            </section>

            <section v-if="client.notes" class="detail-section lg:col-span-2">
              <header class="detail-section__head">
                <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
                <span class="detail-section__title">Notas internas</span>
              </header>
              <div class="detail-section__body detail-section__body--single">
                <p class="text-sm whitespace-pre-line">{{ client.notes }}</p>
              </div>
            </section>
          </div>
        </q-tab-panel>

        <!-- ── Contratos comerciais ───────────────────────────────── -->
        <q-tab-panel name="contracts" class="p-0">
          <div class="tab-panel-head">
            <div>
              <h3>Contratos comerciais</h3>
              <p>Contratos de prestação de serviços com este cliente.</p>
            </div>
            <q-btn
              unelevated no-caps color="primary" icon="add"
              label="Novo contrato deste cliente"
              :to="{ name: 'client-contracts-new', query: { client: client.id } }"
            />
          </div>
          <div v-if="loadingContracts" class="empty-tab"><q-spinner /> A carregar…</div>
          <div v-else-if="!contracts.length" class="empty-tab">
            <AppIcon name="ki-document" :size="32" />
            <p><strong>Sem contratos comerciais.</strong></p>
            <p>Crie o primeiro contrato com este cliente.</p>
          </div>
          <!-- Resumo no topo -->
          <div v-if="contracts.length" class="contracts-summary">
            <div class="summary-pill">
              <span class="summary-pill__label">Activos</span>
              <strong>{{ contracts.filter((c) => c.contract_status === 'active').length }}</strong>
            </div>
            <div class="summary-pill">
              <span class="summary-pill__label">Em rascunho</span>
              <strong>{{ contracts.filter((c) => c.contract_status === 'draft').length }}</strong>
            </div>
            <div class="summary-pill summary-pill--accent">
              <span class="summary-pill__label">Total mensal (activos)</span>
              <strong>{{ formatAmount(totalActiveMonthly, 'MZN') }}</strong>
            </div>
          </div>

          <div v-else-if="!loadingContracts" />

          <div v-if="contracts.length" class="contract-grid">
            <router-link
              v-for="c in contracts" :key="c.id"
              :to="{ name: 'client-contracts-detail', params: { id: c.id } }"
              class="contract-card"
            >
              <header class="contract-card__head">
                <div class="contract-card__title-wrap">
                  <div class="contract-card__ref">{{ c.reference }}</div>
                  <h4 class="contract-card__title">{{ c.title }}</h4>
                </div>
                <AppBadge :variant="contractStatusVariant(c.contract_status)" size="sm">
                  {{ c.contract_status_display }}
                </AppBadge>
              </header>

              <div class="contract-card__amount">
                <span class="contract-card__amount-label">Valor mensal</span>
                <strong>{{ formatAmount(c.monthly_value, c.currency) }}</strong>
              </div>

              <div class="contract-card__meta">
                <div class="contract-card__meta-item">
                  <AppIcon name="ki-shield-tick" :size="13" />
                  <span>{{ c.modality_display }}</span>
                </div>
                <div class="contract-card__meta-item">
                  <AppIcon name="ki-calendar" :size="13" />
                  <span>
                    {{ formatDate(c.start_date) }}
                    {{ c.end_date ? '→ ' + formatDate(c.end_date) : '· sem prazo' }}
                  </span>
                </div>
                <div v-if="c.is_expiring_soon" class="contract-card__meta-item contract-card__meta-item--warning">
                  <AppIcon name="ki-warning-2" :size="13" />
                  <span>Expira em {{ c.days_to_expiry }} dia{{ c.days_to_expiry === 1 ? '' : 's' }}</span>
                </div>
              </div>

              <footer class="contract-card__foot">
                <span>Ver detalhe</span>
                <AppIcon name="ki-arrow-right" :size="14" />
              </footer>
            </router-link>
          </div>
        </q-tab-panel>

        <!-- ── Postos ─────────────────────────────────────────────── -->
        <q-tab-panel name="posts" class="p-0">
          <div class="tab-panel-head">
            <div>
              <h3>Postos de serviço</h3>
              <p>Locais físicos onde o PLUSE presta serviço a este cliente.</p>
            </div>
            <q-btn
              unelevated no-caps color="primary" icon="add"
              label="Adicionar posto"
              :to="{ name: 'posts-new', query: { client: client.id } }"
            />
          </div>
          <div v-if="loadingPosts" class="empty-tab"><q-spinner /> A carregar…</div>
          <div v-else-if="!posts.length" class="empty-tab">
            <AppIcon name="ki-geolocation" :size="32" />
            <p><strong>Sem postos.</strong></p>
            <p>Este cliente ainda não tem locais de prestação registados.</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <router-link
              v-for="p in posts" :key="p.id"
              :to="{ name: 'posts-detail', params: { id: p.id } }"
              class="post-row"
            >
              <span class="post-row__icon"><AppIcon name="ki-geolocation" :size="16" /></span>
              <div class="grow min-w-0">
                <div class="text-sm font-semibold text-mono">{{ p.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ p.service_type_display }} ·
                  {{ p.current_guards }}/{{ p.max_guards ?? '∞' }} vigilantes
                </div>
              </div>
              <AppBadge :variant="postStatusVariant(p.status)" size="sm">
                {{ p.status_display }}
              </AppBadge>
            </router-link>
          </div>
        </q-tab-panel>

        <!-- ── Colaboradores ──────────────────────────────────────── -->
        <q-tab-panel name="employees" class="p-0">
          <div class="tab-panel-head">
            <div>
              <h3>Colaboradores alocados</h3>
              <p>Vigilantes e equipa de operações afectos a este cliente, agrupados por posto.</p>
            </div>
            <q-btn
              unelevated no-caps color="primary" icon="add"
              label="Adicionar colaborador"
              :to="{ name: 'employees-new', query: { client: client.id } }"
            />
          </div>

          <!-- Resumo no topo -->
          <div v-if="employees.length" class="contracts-summary">
            <div class="summary-pill">
              <span class="summary-pill__label">Total</span>
              <strong>{{ employees.length }}</strong>
            </div>
            <div class="summary-pill">
              <span class="summary-pill__label">Em posto</span>
              <strong>{{ employees.filter((e) => e.post).length }}</strong>
            </div>
            <div class="summary-pill" :class="{ 'summary-pill--warn': unassignedEmployees.length }">
              <span class="summary-pill__label">Sem posto</span>
              <strong>{{ unassignedEmployees.length }}</strong>
            </div>
          </div>

          <div v-if="loadingEmployees" class="empty-tab"><q-spinner /> A carregar…</div>
          <div v-else-if="!employees.length" class="empty-tab">
            <AppIcon name="ki-people" :size="32" />
            <p><strong>Sem colaboradores alocados.</strong></p>
            <p>Crie colaboradores e associe a este cliente.</p>
          </div>

          <div v-else class="emp-groups">
            <!-- Um grupo por posto do cliente -->
            <section
              v-for="group in employeesByPost"
              :key="group.postId || 'unassigned'"
              class="emp-group"
              :class="{ 'emp-group--unassigned': !group.postId }"
            >
              <header class="emp-group__head">
                <span class="emp-group__icon">
                  <AppIcon
                    :name="group.postId ? 'ki-geolocation' : 'ki-warning-2'"
                    :size="14"
                  />
                </span>
                <div class="emp-group__title-wrap">
                  <router-link
                    v-if="group.postId"
                    :to="{ name: 'posts-detail', params: { id: group.postId } }"
                    class="emp-group__title"
                  >{{ group.postName }}</router-link>
                  <span v-else class="emp-group__title">Sem posto atribuído</span>
                  <span class="emp-group__count">
                    {{ group.employees.length }} colaborador{{ group.employees.length === 1 ? '' : 'es' }}
                  </span>
                </div>
                <q-btn
                  v-if="group.postId"
                  outline no-caps dense size="sm"
                  icon="arrow_forward"
                  label="Ver posto"
                  :to="{ name: 'posts-detail', params: { id: group.postId } }"
                />
              </header>

              <div class="emp-group__body">
                <router-link
                  v-for="e in group.employees" :key="e.id"
                  :to="{ name: 'employees-detail', params: { id: e.id } }"
                  class="emp-row"
                >
                  <span class="emp-row__avatar">{{ initials(e.full_name) }}</span>
                  <div class="emp-row__body">
                    <div class="emp-row__name">{{ e.full_name }}</div>
                    <div class="emp-row__meta">
                      <span class="emp-row__number">{{ e.employee_number }}</span>
                      <span v-if="e.current_job_title">{{ e.current_job_title }}</span>
                      <span v-else-if="e.department_display">{{ e.department_display }}</span>
                    </div>
                  </div>
                  <AppBadge :variant="postStatusVariant(e.status)" size="sm">
                    {{ e.status_display }}
                  </AppBadge>
                </router-link>
              </div>
            </section>
          </div>
        </q-tab-panel>

        <!-- ── Histórico ──────────────────────────────────────────── -->
        <q-tab-panel name="history" class="p-0">
          <AuditTrail :entity="client" title="Histórico do cliente" />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { clientContractService } from 'src/services/client-contract.service'
import { employeeService } from 'src/services/employee.service'
import { riskLevelLabel } from 'src/config/clients'
import { contractStatusVariant } from 'src/config/client-contracts'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AuditTrail from 'src/components/ui/AuditTrail.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()

const client = ref(null)
const posts = ref([])
const loadingPosts = ref(false)
const contracts = ref([])
const loadingContracts = ref(false)
const employees = ref([])
const loadingEmployees = ref(false)

// Tab actual — preservado em ?tab= para deep-link e refresh
const activeTab = ref(route.query.tab || 'geral')

// Definição declarativa das tabs (uniforme; contagens reactivas)
const tabsDef = computed(() => [
  { name: 'geral', icon: 'badge', label: 'Geral', count: 0 },
  { name: 'contracts', icon: 'description', label: 'Contratos', count: contracts.value.length },
  { name: 'posts', icon: 'place', label: 'Postos', count: posts.value.length },
  { name: 'employees', icon: 'people', label: 'Colaboradores', count: employees.value.length },
  { name: 'history', icon: 'history', label: 'Histórico', count: 0 },
])

// Total mensal dos contratos activos (somatório dos valores)
const totalActiveMonthly = computed(() => {
  return contracts.value
    .filter((c) => c.contract_status === 'active')
    .reduce((acc, c) => acc + Number(c.monthly_value || 0), 0)
})

// Colaboradores sem posto atribuído
const unassignedEmployees = computed(() =>
  employees.value.filter((e) => !e.post),
)

/**
 * Colaboradores agrupados por posto do cliente.
 *
 * Inclui:
 *   - Um grupo por cada posto deste cliente (ordem pelo nome do posto)
 *   - Postos sem colaboradores são omitidos (não fazem ruído)
 *   - No fim, um grupo "Sem posto" para colaboradores do cliente mas
 *     ainda não alocados a posto específico
 */
const employeesByPost = computed(() => {
  const byPost = new Map()
  for (const emp of employees.value) {
    const key = emp.post || 'unassigned'
    if (!byPost.has(key)) byPost.set(key, [])
    byPost.get(key).push(emp)
  }

  const groups = []
  for (const post of posts.value) {
    const list = byPost.get(post.id)
    if (!list?.length) continue
    groups.push({
      postId: post.id,
      postName: post.name,
      employees: list,
    })
  }

  const unassigned = byPost.get('unassigned')
  if (unassigned?.length) {
    groups.push({
      postId: null,
      postName: 'Sem posto atribuído',
      employees: unassigned,
    })
  }

  return groups
})
function initials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase()
}

const canApprove = computed(
  () => auth.user?.is_superuser
    || auth.hasAnyGroup('Diretor Financeiro', 'Administrador', 'Direcao'),
)

const stages = [
  { value: 'prospecting', label: 'Prospeção', icon: 'person_search' },
  { value: 'risk_review', label: 'Análise em aprovação', icon: 'fact_check' },
  { value: 'approved', label: 'Admissão concluída', icon: 'verified' },
]
const stageIndex = computed(
  () => stages.findIndex((s) => s.value === client.value?.stage),
)

function stageIcon(stage) {
  return { prospecting: 'person_search', risk_review: 'schedule', approved: 'check_circle' }[stage] || 'info'
}
function postStatusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}

async function load() {
  client.value = await clientService.get(route.params.id)
}

async function loadPosts() {
  loadingPosts.value = true
  try {
    const data = await postService.list({ client: route.params.id, page_size: 100 })
    posts.value = data?.results ?? data ?? []
  } catch {
    /* interceptor toasts */
  } finally {
    loadingPosts.value = false
  }
}

async function loadContracts() {
  loadingContracts.value = true
  try {
    const data = await clientContractService.list({ client: route.params.id, page_size: 100 })
    contracts.value = data?.results ?? data ?? []
  } catch {
    /* interceptor toasts */
  } finally {
    loadingContracts.value = false
  }
}

async function loadEmployees() {
  loadingEmployees.value = true
  try {
    const data = await employeeService.list({ client: route.params.id, page_size: 200 })
    employees.value = data?.results ?? data ?? []
  } catch {
    /* interceptor toasts */
  } finally {
    loadingEmployees.value = false
  }
}

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function formatAmount(v, currency = 'MZN') {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return v
  try {
    return `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  } catch {
    return `${n} ${currency}`
  }
}

function submitRisk() {
  $q.dialog({
    title: 'Submeter análise de risco',
    message: 'A análise será submetida para aprovação. Exige nível de risco e relatório anexado. Continuar?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Submeter', color: 'primary', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      client.value = await clientService.submitRisk(client.value.id)
      toast.success('Análise de risco submetida.')
    } catch (err) {
      toast.error('Não foi possível submeter.', { caption: err?.response?.data?.detail })
    }
  })
}

function approve() {
  $q.dialog({
    title: 'Aprovar admissão do cliente',
    message: `Aprovar a admissão de <b>${client.value.name}</b>? O cliente fica operacional e os postos poderão ser activados.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      client.value = await clientService.approveOnboarding(client.value.id)
      toast.success('Cliente aprovado — admissão concluída.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

function reject() {
  $q.dialog({
    title: 'Devolver análise',
    message: 'Motivo da devolução (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Devolver', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      client.value = await clientService.rejectOnboarding(client.value.id, reason || '')
      toast.success('Análise devolvida ao cliente.')
    } catch (err) {
      toast.error('Não foi possível devolver.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  try {
    await load()
  } catch {
    toast.error('Cliente não encontrado.')
    router.push({ name: 'clients-list' })
    return
  }
  loadPosts()
  loadContracts()
  loadEmployees()
})

// Sincroniza tab activa com query string (deep-link friendly)
watch(activeTab, (next) => {
  if (next === (route.query.tab || 'geral')) return
  router.replace({ query: { ...route.query, tab: next === 'geral' ? undefined : next } })
})
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

/* ── Onboarding progress bar ────────────────────────────────────────── */
.onboarding-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.onboarding-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.onboarding-step__dot {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  background: var(--muted);
  color: var(--muted-foreground);
}
.onboarding-step__label {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--muted-foreground);
}
.onboarding-step--current {
  border-color: color-mix(in oklab, var(--primary) 40%, var(--border));
  background: color-mix(in oklab, var(--primary) 6%, var(--card));
}
.onboarding-step--current .onboarding-step__dot {
  background: var(--primary);
  color: white;
}
.onboarding-step--current .onboarding-step__label { color: var(--mono); }
.onboarding-step--done .onboarding-step__dot {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 18%, transparent);
  color: var(--pluse-emerald-600, #059669);
}

/* ── Detail sections ────────────────────────────────────────────────── */
.detail-section {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.detail-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 30%, transparent);
}
.detail-section__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.detail-section__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.detail-section__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  padding: 18px;
}
.detail-section__body--single { grid-template-columns: 1fr; }
.field-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.field-row--wide { grid-column: 1 / -1; }
.field-row__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.field-row__value {
  font-size: 0.9rem;
  color: var(--foreground);
  word-break: break-word;
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

.posts-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.post-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  text-decoration: none;
  transition: border-color 140ms ease;
}
.post-row:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
}
.post-row__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

/* ── Contracts summary pills ────────────────────────────────────────── */
.contracts-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.summary-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  min-width: 120px;
}
.summary-pill__label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.summary-pill strong {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--mono);
}
.summary-pill--accent {
  border-color: color-mix(in oklab, var(--primary) 30%, var(--border));
  background: color-mix(in oklab, var(--primary) 6%, var(--card));
}
.summary-pill--accent strong { color: var(--primary); }
.summary-pill--warn {
  border-color: color-mix(in oklab, #f59e0b 30%, var(--border));
  background: color-mix(in oklab, #f59e0b 6%, var(--card));
}
.summary-pill--warn strong { color: #b45309; }

/* ── Contract cards ─────────────────────────────────────────────────── */
.contract-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}
.contract-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  text-decoration: none;
  color: inherit;
  transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}
.contract-card:hover {
  border-color: color-mix(in oklab, var(--primary) 35%, var(--border));
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -10px rgba(15, 23, 42, .15);
}
.contract-card__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.contract-card__title-wrap { flex: 1; min-width: 0; }
.contract-card__ref {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted-foreground);
  font-family: ui-monospace, monospace;
  letter-spacing: 0.02em;
}
.contract-card__title {
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 2px 0 0;
  word-break: break-word;
  line-height: 1.3;
}

.contract-card__amount {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 7%, transparent);
}
.contract-card__amount-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.contract-card__amount strong {
  font-size: 1.22rem;
  font-weight: 800;
  color: var(--primary);
  margin-top: 2px;
}

.contract-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.contract-card__meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--foreground);
}
.contract-card__meta-item :first-child {
  color: var(--muted-foreground);
  flex: none;
}
.contract-card__meta-item--warning {
  color: var(--pluse-amber-700, #b45309);
  font-weight: 600;
}
.contract-card__meta-item--warning :first-child {
  color: inherit;
}

.contract-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary);
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

/* ── Tabs (minimalista, profissional) ───────────────────────────────── */
.client-tabs-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 22px;
  padding: 0 4px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.client-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 12px;
  margin-bottom: -1px;          /* sobrepõe a border do nav */
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted-foreground);
  cursor: pointer;
  position: relative;
  transition:
    color 180ms ease,
    border-color 200ms ease,
    background-color 160ms ease;
  white-space: nowrap;
  border-radius: 6px 6px 0 0;
}
.client-tab:hover:not(.is-active) {
  color: var(--foreground);
  background: color-mix(in oklab, var(--muted) 40%, transparent);
}
.client-tab:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--primary) 50%, transparent);
  outline-offset: -2px;
  z-index: 1;
}

.client-tab.is-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.client-tab.is-active .client-tab__icon {
  color: var(--primary);
}

.client-tab__icon {
  color: color-mix(in oklab, var(--muted-foreground) 80%, transparent);
  transition: color 180ms ease;
  flex: none;
}
.client-tab:hover:not(.is-active) .client-tab__icon {
  color: var(--foreground);
}
.client-tab__label {
  letter-spacing: -0.005em;
}

.client-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--muted-foreground) 14%, transparent);
  color: var(--muted-foreground);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  transition: background-color 180ms ease, color 180ms ease;
}
.client-tab__count.is-active {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}

.client-tab-panels {
  background: transparent;
}
.client-tab-panels :deep(.q-tab-panel) { padding: 0; }

@media (max-width: 640px) {
  .client-tabs-bar {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .client-tabs-bar::-webkit-scrollbar { display: none; }
  .client-tab { padding: 12px 14px 10px; font-size: 0.82rem; }
}

.tab-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.tab-panel-head > div { min-width: 0; flex: 1 1 240px; }
.tab-panel-head > .q-btn { flex: none; }
.tab-panel-head h3 {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--mono);
  margin: 0;
}
.tab-panel-head p {
  font-size: 0.84rem;
  color: var(--muted-foreground);
  margin: 2px 0 0;
}

.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 16px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--muted-foreground);
}
.empty-tab p { margin: 0; font-size: 0.9rem; }

/* ── Employee groups (by post) ──────────────────────────────────────── */
.emp-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.emp-group {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  overflow: hidden;
}
.emp-group--unassigned {
  border-color: color-mix(in oklab, #f59e0b 30%, var(--border));
  background: color-mix(in oklab, #f59e0b 4%, var(--card));
}
.emp-group__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 24%, transparent);
}
.emp-group--unassigned .emp-group__head {
  background: color-mix(in oklab, #f59e0b 8%, transparent);
  border-bottom-color: color-mix(in oklab, #f59e0b 22%, var(--border));
}
.emp-group__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
.emp-group--unassigned .emp-group__icon {
  background: color-mix(in oklab, #f59e0b 20%, transparent);
  color: #b45309;
}
.emp-group__title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.emp-group__title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--foreground);
  text-decoration: none;
  word-break: break-word;
  line-height: 1.25;
}
a.emp-group__title:hover { color: var(--primary); text-decoration: underline; }
.emp-group__count {
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--muted-foreground);
}
.emp-group__body {
  display: flex;
  flex-direction: column;
}

/* ── Employee row ───────────────────────────────────────────────────── */
.emp-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--card);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
  transition: background-color 140ms ease;
}
.emp-row:last-child { border-bottom: none; }
.emp-row:hover {
  background: color-mix(in oklab, var(--primary) 5%, transparent);
}
.emp-row__avatar {
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 50%;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.emp-row__body {
  flex: 1;
  min-width: 0;
}
.emp-row__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.emp-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.74rem;
  color: var(--muted-foreground);
}
.emp-row__meta > * { display: inline-flex; }
.emp-row__meta > * + *::before {
  content: '·';
  margin-right: 8px;
  color: color-mix(in oklab, var(--muted-foreground) 60%, transparent);
}
.emp-row__number {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .onboarding-bar { flex-direction: column; }
  .detail-section__body { grid-template-columns: 1fr; }
}
</style>
