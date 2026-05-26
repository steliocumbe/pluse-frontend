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
          icon="check_circle" label="Aprovar onboarding"
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

      <!-- Tabs -->
      <q-card flat bordered class="client-tabs-card">
        <q-tabs
          v-model="activeTab"
          class="client-tabs"
          align="left"
          active-color="primary"
          indicator-color="primary"
          no-caps dense
        >
          <q-tab name="geral" icon="badge" label="Geral" />
          <q-tab name="contracts" icon="description">
            <template #default>
              <div class="flex items-center gap-2">
                <q-icon name="description" size="18px" />
                <span>Contratos</span>
                <span v-if="contracts.length" class="client-tab-badge">{{ contracts.length }}</span>
              </div>
            </template>
          </q-tab>
          <q-tab name="posts">
            <template #default>
              <div class="flex items-center gap-2">
                <q-icon name="place" size="18px" />
                <span>Postos</span>
                <span v-if="posts.length" class="client-tab-badge">{{ posts.length }}</span>
              </div>
            </template>
          </q-tab>
          <q-tab name="employees">
            <template #default>
              <div class="flex items-center gap-2">
                <q-icon name="people" size="18px" />
                <span>Colaboradores</span>
                <span v-if="employees.length" class="client-tab-badge">{{ employees.length }}</span>
              </div>
            </template>
          </q-tab>
          <q-tab name="history" icon="history" label="Histórico" />
        </q-tabs>
      </q-card>

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
          <div v-else class="contract-grid">
            <article v-for="c in contracts" :key="c.id" class="contract-card">
              <header class="contract-card__head">
                <div class="min-w-0">
                  <div class="text-xs text-muted-foreground text-mono">{{ c.reference }}</div>
                  <div class="text-sm font-semibold text-mono truncate">{{ c.title }}</div>
                </div>
                <AppBadge :variant="contractStatusVariant(c.contract_status)">
                  {{ c.contract_status_display }}
                </AppBadge>
              </header>
              <div class="contract-card__body">
                <div class="contract-card__row">
                  <span class="contract-card__label">Modalidade</span>
                  <span>{{ c.modality_display }}</span>
                </div>
                <div class="contract-card__row">
                  <span class="contract-card__label">Período</span>
                  <span>
                    {{ formatDate(c.start_date) }}
                    {{ c.end_date ? '→ ' + formatDate(c.end_date) : '' }}
                  </span>
                </div>
                <div class="contract-card__row">
                  <span class="contract-card__label">Valor mensal</span>
                  <span class="text-mono font-semibold">
                    {{ formatAmount(c.monthly_value, c.currency) }}
                  </span>
                </div>
              </div>
              <footer class="contract-card__foot">
                <q-btn
                  outline no-caps dense size="sm" icon="visibility" label="Ver"
                  :to="{ name: 'client-contracts-detail', params: { id: c.id } }"
                />
              </footer>
            </article>
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
              <p>Vigilantes e equipa de operações afectos a este cliente.</p>
            </div>
            <q-btn
              outline no-caps color="primary" icon="add"
              label="Adicionar colaborador"
              :to="{ name: 'employees-new', query: { client: client.id } }"
            />
          </div>
          <div v-if="loadingEmployees" class="empty-tab"><q-spinner /> A carregar…</div>
          <div v-else-if="!employees.length" class="empty-tab">
            <AppIcon name="ki-people" :size="32" />
            <p><strong>Sem colaboradores alocados.</strong></p>
            <p>Crie colaboradores e associe a este cliente.</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <router-link
              v-for="e in employees" :key="e.id"
              :to="{ name: 'employees-detail', params: { id: e.id } }"
              class="emp-row"
            >
              <span class="emp-row__avatar">{{ initials(e.full_name) }}</span>
              <div class="grow min-w-0">
                <div class="text-sm font-semibold text-mono">{{ e.full_name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ e.employee_number }}
                  <span v-if="e.current_job_title"> · {{ e.current_job_title }}</span>
                  <span v-if="e.post_name"> · {{ e.post_name }}</span>
                </div>
              </div>
              <AppBadge :variant="postStatusVariant(e.status)" size="sm">
                {{ e.status_display }}
              </AppBadge>
            </router-link>
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
  { value: 'approved', label: 'Onboarding concluído', icon: 'verified' },
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
    title: 'Aprovar onboarding',
    message: `Concluir o onboarding de <b>${client.value.name}</b>? O cliente fica operacional.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      client.value = await clientService.approveOnboarding(client.value.id)
      toast.success('Onboarding concluído.')
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

/* ── Contract cards ─────────────────────────────────────────────────── */
.contract-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.contract-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  overflow: hidden;
}
.contract-card__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 24%, transparent);
}
.contract-card__head > .min-w-0 { flex: 1; min-width: 0; }
.contract-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
}
.contract-card__row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.84rem;
}
.contract-card__label {
  color: var(--muted-foreground);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.contract-card__foot {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}

/* ── Tabs ───────────────────────────────────────────────────────────── */
.client-tabs-card {
  background: var(--card);
  margin-bottom: 18px;
  overflow: hidden;
}
.client-tabs :deep(.q-tab) {
  padding: 12px 18px;
  min-height: 48px;
  font-weight: 600;
}
.client-tab-badge {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  margin-left: 2px;
}
.client-tab-panels {
  background: transparent;
}
.client-tab-panels :deep(.q-tab-panel) { padding: 0; }

.tab-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.tab-panel-head > div { flex: 1; min-width: 200px; }
.tab-panel-head h3 {
  font-size: 1rem;
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

/* ── Employee row ───────────────────────────────────────────────────── */
.emp-row {
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
.emp-row:hover {
  border-color: color-mix(in oklab, var(--primary) 28%, var(--border));
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

@media (max-width: 640px) {
  .onboarding-bar { flex-direction: column; }
  .detail-section__body { grid-template-columns: 1fr; }
}
</style>
