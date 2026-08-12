<!--
  /cco — Base de Operações: painel ao vivo (Fase 4.2).
  Visão diária dos postos, cobertura, presenças e ocorrências em aberto.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações · Base de Operações"
    title="Base de Operações"
    description="Painel ao vivo para decidir rapidamente sobre cobertura, presenças, atrasos, check-ins fora do raio e ocorrências em aberto."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-calendar" :size="14" />
        {{ formatDateLong(date) }}
      </span>
      <span class="admin-meta-chip cco-live-chip" :class="liveChipClass">
        <span class="cco-live-dot" :class="{ 'is-pulsing': loading }" />
        <span v-if="!online">Offline</span>
        <span v-else-if="loading">A actualizar…</span>
        <span v-else>Ao vivo · {{ relativeUpdated }}</span>
      </span>
      <span v-if="data?.stats?.posts_uncovered" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="13" />
        {{ data.stats.posts_uncovered }} posto(s) por cobrir
      </span>
    </template>

    <template #actions>
      <q-input
        v-model="date" type="date" outlined dense stack-label
        class="admin-hero-button" style="min-width: 160px;"
        @update:model-value="fetch"
      />
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="refresh" label="Actualizar" :loading="loading" @click="fetch"
      />
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Registar ocorrência"
        :to="{ name: 'incidents' }"
      />
    </template>

    <div v-if="!data && loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <template v-else-if="data">
      <!-- Stats (clicáveis para filtrar) -->
      <div class="stats-grid">
        <button type="button" class="stat-card stat-card--button"
                :class="{ 'is-active': filter.coverage === 'complete' }"
                @click="toggleCoverage('complete')">
          <span class="stat-card__label">Postos cobertos</span>
          <div class="stat-card__row">
            <strong class="stat-card__value">{{ data.stats.posts_covered }}</strong>
            <span class="stat-card__suffix">/ {{ data.stats.posts_total }}</span>
          </div>
        </button>
        <button type="button" class="stat-card stat-card--warning stat-card--button"
                :class="{ 'is-active': filter.coverage === 'partial' }"
                @click="toggleCoverage('partial')">
          <span class="stat-card__label">Cobertura parcial</span>
          <strong class="stat-card__value">{{ data.stats.posts_partial }}</strong>
        </button>
        <button type="button" class="stat-card stat-card--danger stat-card--button"
                :class="{ 'is-active': filter.coverage === 'uncovered' }"
                @click="toggleCoverage('uncovered')">
          <span class="stat-card__label">Por cobrir</span>
          <strong class="stat-card__value">{{ data.stats.posts_uncovered }}</strong>
        </button>
        <div class="stat-card stat-card--success">
          <span class="stat-card__label">Presenças</span>
          <strong class="stat-card__value">{{ data.stats.present }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Faltas</span>
          <strong class="stat-card__value">{{ data.stats.absent }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Substituídos</span>
          <strong class="stat-card__value">{{ data.stats.substituted }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Por marcar</span>
          <strong class="stat-card__value">{{ data.stats.pending }}</strong>
        </div>
        <div class="stat-card stat-card--info">
          <span class="stat-card__label">Ocorrências em aberto</span>
          <strong class="stat-card__value">{{ data.stats.open_incidents }}</strong>
        </div>
      </div>

      <section class="cco-command-strip">
        <article v-for="action in commandActions" :key="action.title" class="cco-command-card" :class="action.tone">
          <span class="cco-command-card__icon">
            <AppIcon :name="action.icon" :size="18" />
          </span>
          <div>
            <strong>{{ action.title }}</strong>
            <p>{{ action.copy }}</p>
          </div>
          <button type="button" class="cco-command-card__button" @click="action.run">
            {{ action.label }}
          </button>
        </article>
      </section>

      <!-- Filtros -->
      <div class="cco-filters">
        <q-input
          v-model="filter.search" outlined dense clearable debounce="300"
          placeholder="Filtrar por posto ou cliente…" class="cco-filter-search"
        >
          <template #prepend><q-icon name="search" size="18px" /></template>
        </q-input>
        <q-select
          v-model="filter.client" :options="clientOptions"
          outlined dense emit-value map-options clearable
          label="Cliente" style="min-width: 200px"
        />
        <q-select
          v-model="filter.coverage" :options="coverageOptions"
          outlined dense emit-value map-options clearable
          label="Cobertura" style="min-width: 180px"
        />
        <q-toggle
          v-model="filter.armedOnly" label="Só armados" dense color="primary"
        />
      </div>
      <ActiveFiltersBar
        :filters="filter"
        :config="filterConfig"
        @clear="onClearFilter"
        @clear-all="onClearAllFilters"
      />

      <!-- Postos -->
      <section class="block-title">
        <AppIcon name="ki-geolocation" :size="16" />
        <span>Postos do dia</span>
        <span class="block-title__count">{{ filteredPosts.length }} / {{ data.posts.length }}</span>
      </section>

      <div v-if="!filteredPosts.length" class="text-sm text-muted-foreground py-4">
        Sem postos para os filtros actuais.
      </div>

      <div v-else class="posts-grid">
        <div v-for="post in filteredPosts" :key="post.id" class="post-card"
             :class="`post-card--${post.coverage}`">
          <header class="post-card__head">
            <div class="grow min-w-0">
              <div class="post-card__title">{{ post.name }}</div>
              <div class="post-card__sub">
                {{ post.client_name }} · {{ post.service_type_display }}
                <span v-if="post.is_armed" class="armed-tag">armado</span>
              </div>
            </div>
            <span class="coverage-pill" :class="`coverage-pill--${post.coverage}`">
              {{ coverageLabel(post.coverage) }}
            </span>
          </header>

          <div v-if="post.shifts.length" class="post-card__shifts">
            <div v-for="s in post.shifts" :key="s.id" class="shift-line">
              <span class="period-chip" :class="`period-chip--${s.period}`">
                {{ s.period_display }}
              </span>
              <div class="shift-line__body">
                <div class="shift-line__head">
                  <span class="shift-line__name">{{ s.employee_name }}</span>
                  <AppBadge :variant="attendanceVariant(s.attendance_status)" size="sm">
                    {{ s.attendance_status_display }}
                  </AppBadge>
                </div>
                <div v-if="s.substitute_name" class="shift-line__sub">
                  substituído por {{ s.substitute_name }}
                </div>
              </div>
              <div class="shift-line__actions">
                <q-btn
                  v-if="s.attendance_status === 'pending'"
                  flat dense round size="sm" icon="how_to_reg" color="positive"
                  :loading="markingPresent === s.id"
                  @click="markPresent(s)"
                >
                  <q-tooltip>Marcar presença</q-tooltip>
                </q-btn>
                <q-btn
                  flat dense round size="sm" icon="swap_horiz"
                  @click="openSubstitution(post, s)"
                >
                  <q-tooltip>Substituir vigilante</q-tooltip>
                </q-btn>
                <q-btn
                  flat dense round size="sm" icon="person_off" color="negative"
                  @click="openAbsence(post, s)"
                >
                  <q-tooltip>Marcar falta</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
          <div v-else class="post-card__empty">
            Nenhum turno para hoje.
          </div>
          <footer class="post-card__actions">
            <q-btn
              no-caps unelevated size="sm" color="primary"
              icon="person_add"
              :label="post.shifts.length ? 'Adicionar reforço' : 'Alocar vigilante'"
              @click="openAllocation(post)"
            />
          </footer>
        </div>
      </div>

      <!-- Ocorrências em aberto -->
      <section class="block-title">
        <AppIcon name="ki-warning-2" :size="16" />
        <span>Ocorrências em aberto</span>
        <router-link :to="{ name: 'incidents' }" class="block-title__link">
          Ver todas →
        </router-link>
      </section>

      <div v-if="!data.incidents.length" class="text-sm text-muted-foreground py-4">
        Sem ocorrências em aberto.
      </div>

      <div v-else class="flex flex-col gap-2">
        <div v-for="i in data.incidents" :key="i.id" class="incident-row">
          <span class="incident-row__dot" :class="`incident-row__dot--${i.severity}`" />
          <div class="grow min-w-0">
            <div class="incident-row__title">
              {{ i.incident_type_display }} — {{ i.post_name }}
            </div>
            <div class="incident-row__meta">
              {{ formatDateTime(i.occurred_at) }} · {{ i.description }}
            </div>
          </div>
          <AppBadge :variant="severityVariant(i.severity)" size="sm">{{ i.severity_display }}</AppBadge>
          <AppBadge :variant="incidentStateVariant(i.state)" size="sm">{{ i.state_display }}</AppBadge>
        </div>
      </div>
    </template>

    <q-dialog v-model="actionDialog.open" persistent>
      <q-card class="cco-action-dialog">
        <q-card-section>
          <div class="cco-action-dialog__eyebrow">{{ actionDialog.eyebrow }}</div>
          <div class="cco-action-dialog__title">{{ actionDialog.title }}</div>
          <p class="cco-action-dialog__copy">{{ actionDialog.copy }}</p>
        </q-card-section>

        <q-card-section class="q-pt-none cco-action-dialog__body">
          <q-select
            v-if="actionDialog.mode !== 'absence'"
            v-model="actionForm.employee"
            :options="employeeOptions"
            label="Vigilante"
            outlined dense emit-value map-options use-input clearable
            :loading="loadingEmployees"
            @filter="filterEmployees"
          />
          <q-select
            v-if="actionDialog.mode === 'allocation'"
            v-model="actionForm.period"
            :options="periodOptions"
            label="Período"
            outlined dense emit-value map-options
          />
          <q-input
            v-if="actionDialog.mode === 'absence'"
            v-model="actionForm.reason"
            type="textarea"
            autogrow outlined dense
            label="Motivo da falta"
            placeholder="Ex.: não compareceu ao posto, informou doença, atraso sem contacto..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated no-caps color="primary"
            :label="actionDialog.okLabel"
            :loading="savingAction"
            @click="submitCcoAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { ccoService } from 'src/services/operations.service'
import { shiftService } from 'src/services/scheduling.service'
import { employeeService } from 'src/services/employee.service'
import { attendanceVariant } from 'src/config/scheduling'
import { severityVariant, incidentStateVariant } from 'src/config/operations'
import { formatRelativeTime, useRealtimePolling } from 'src/composables/useRealtimePolling'
import { usePendingCounts } from 'src/composables/usePendingCounts'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import ActiveFiltersBar from 'src/components/ui/ActiveFiltersBar.vue'

const $q = useQuasar()
const date = ref(new Date().toISOString().slice(0, 10))
const loadingEmployees = ref(false)
const savingAction = ref(false)
const markingPresent = ref(null)  // id do shift cuja acção está em curso
const allEmployees = ref([])
const employeeOptions = ref([])

const periodOptions = [
  { label: 'Diurno', value: 'day' },
  { label: 'Noturno', value: 'night' },
  { label: '24 horas', value: 'full' },
]

const actionDialog = reactive({
  open: false,
  mode: 'allocation',
  eyebrow: '',
  title: '',
  copy: '',
  okLabel: 'Guardar',
  post: null,
  shift: null,
})
const actionForm = reactive({
  employee: null,
  period: 'day',
  reason: '',
})

const { data, loading, lastUpdated, online, fetch } = useRealtimePolling(
  () => ccoService.overview(date.value),
  { intervalMs: 30_000 },
)

// Activa o polling de contagens pendentes (emite `pluse-incident-critical`)
usePendingCounts()

// ── Filtros sobre os postos ─────────────────────────────────────────────
const filter = reactive({
  search: '',
  client: null,
  coverage: '',
  armedOnly: false,
})

const coverageOptions = [
  { value: 'complete', label: 'Cobertura completa' },
  { value: 'partial', label: 'Cobertura parcial' },
  { value: 'uncovered', label: 'Por cobrir' },
]

const clientOptions = computed(() => {
  if (!data.value?.posts) return []
  const seen = new Map()
  for (const p of data.value.posts) {
    if (!seen.has(p.client_name)) seen.set(p.client_name, p.client_name)
  }
  return [...seen.values()].map((name) => ({ value: name, label: name }))
})

const filteredPosts = computed(() => {
  if (!data.value?.posts) return []
  const q = filter.search.trim().toLowerCase()
  return data.value.posts.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.client_name.toLowerCase().includes(q)) return false
    if (filter.client && p.client_name !== filter.client) return false
    if (filter.coverage && p.coverage !== filter.coverage) return false
    if (filter.armedOnly && !p.is_armed) return false
    return true
  })
})

const uncoveredPosts = computed(() => (
  data.value?.posts?.filter((post) => post.coverage === 'uncovered') ?? []
))

const filterConfig = [
  { key: 'search', label: 'Pesquisa', emptyValue: '' },
  { key: 'client', label: 'Cliente', emptyValue: null },
  { key: 'coverage', label: 'Cobertura', emptyValue: '', options: coverageOptions },
  { key: 'armedOnly', label: 'Armados', emptyValue: false },
]

const commandActions = computed(() => [
  {
    title: 'Alocar posto descoberto',
    copy: `${uncoveredPosts.value.length} posto(s) sem cobertura podem receber substituto agora.`,
    label: 'Alocar',
    icon: 'ki-warning-2',
    tone: 'is-red',
    run: openQuickAllocation,
  },
  {
    title: 'Filtrar sem cobertura',
    copy: 'Mostrar apenas postos sem vigilante confirmado no turno.',
    label: 'Filtrar',
    icon: 'ki-check-circle',
    tone: 'is-amber',
    run: () => { filter.coverage = 'uncovered' },
  },
  {
    title: 'Actualizar operação',
    copy: 'Recarregar cobertura, presenças e ocorrências sem sair do painel.',
    label: 'Actualizar',
    icon: 'ki-refresh',
    tone: 'is-blue',
    run: fetch,
  },
])

function openQuickAllocation() {
  const post = uncoveredPosts.value[0]

  if (!post) {
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Todos os postos estão cobertos.',
      caption: 'Não há alocação urgente neste momento.',
    })
    return
  }

  openAllocation(post)
}

function resetActionForm() {
  actionForm.employee = null
  actionForm.period = 'day'
  actionForm.reason = ''
}

function openAllocation(post) {
  resetActionForm()
  actionDialog.mode = 'allocation'
  actionDialog.eyebrow = 'Alocação operacional'
  actionDialog.title = post.shifts?.length ? 'Adicionar reforço ao posto' : 'Alocar vigilante ao posto'
  actionDialog.copy = `${post.name} · ${post.client_name}`
  actionDialog.okLabel = 'Alocar vigilante'
  actionDialog.post = post
  actionDialog.shift = null
  actionDialog.open = true
}

function openSubstitution(post, shift) {
  resetActionForm()
  actionDialog.mode = 'substitution'
  actionDialog.eyebrow = 'Substituição'
  actionDialog.title = 'Substituir vigilante escalado'
  actionDialog.copy = `${shift.employee_name} · ${post.name} · ${shift.period_display}`
  actionDialog.okLabel = 'Confirmar substituição'
  actionDialog.post = post
  actionDialog.shift = shift
  actionDialog.open = true
}

/**
 * Acção rápida — confirma presença sem abrir modal.
 * Útil para a Base de Operações marcar manualmente um vigilante (ex: sem dispositivo móvel,
 * só com rádio) sem ter de passar por um diálogo.
 */
async function markPresent(shift) {
  $q.dialog({
    title: 'Marcar presença',
    message: `Confirmar que <b>${shift.employee_name}</b> está em serviço?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Confirmar', color: 'positive', unelevated: true, noCaps: true, icon: 'how_to_reg' },
  }).onOk(async () => {
    markingPresent.value = shift.id
    try {
      await shiftService.markAttendance(shift.id, {
        attendance_status: 'present',
        checked_in_at: new Date().toISOString(),
      })
      $q.notify({
        type: 'positive', icon: 'how_to_reg',
        message: `${shift.employee_name} marcado como presente.`,
      })
      await fetch()
    } catch (error) {
      const data = error?.response?.data || {}
      $q.notify({
        type: 'negative',
        message: data.detail || 'Não foi possível marcar a presença.',
      })
    } finally {
      markingPresent.value = null
    }
  })
}

function openAbsence(post, shift) {
  resetActionForm()
  actionDialog.mode = 'absence'
  actionDialog.eyebrow = 'Presença'
  actionDialog.title = 'Marcar falta'
  actionDialog.copy = `${shift.employee_name} · ${post.name} · ${shift.period_display}`
  actionDialog.okLabel = 'Marcar falta'
  actionDialog.post = post
  actionDialog.shift = shift
  actionDialog.open = true
}

async function submitCcoAction() {
  if (actionDialog.mode !== 'absence' && !actionForm.employee) {
    $q.notify({ type: 'warning', message: 'Escolha o vigilante antes de continuar.' })
    return
  }

  savingAction.value = true
  try {
    if (actionDialog.mode === 'allocation') {
      await shiftService.create({
        post: actionDialog.post.id,
        employee: actionForm.employee,
        date: date.value,
        period: actionForm.period,
      })
      $q.notify({ type: 'positive', icon: 'person_add', message: 'Vigilante alocado ao posto.' })
    } else if (actionDialog.mode === 'substitution') {
      await shiftService.markAttendance(actionDialog.shift.id, {
        attendance_status: 'substituted',
        substitute: actionForm.employee,
      })
      $q.notify({ type: 'positive', icon: 'swap_horiz', message: 'Substituição registada.' })
    } else {
      await shiftService.markAttendance(actionDialog.shift.id, {
        attendance_status: 'absent',
        absence_reason: actionForm.reason || 'Falta marcada pela Base de Operações.',
      })
      $q.notify({ type: 'positive', icon: 'person_off', message: 'Falta registada.' })
    }
    actionDialog.open = false
    await fetch()
  } catch (error) {
    const data = error?.response?.data || {}
    const detail = data.detail || data.employee?.[0] || data.non_field_errors?.[0] || 'Não foi possível concluir a ação.'
    $q.notify({ type: 'negative', message: detail })
  } finally {
    savingAction.value = false
  }
}

function filterEmployees(needle, update) {
  update(() => {
    const q = String(needle || '').toLowerCase()
    employeeOptions.value = q
      ? allEmployees.value.filter((employee) => employee.label.toLowerCase().includes(q))
      : allEmployees.value
  })
}

async function loadEmployees() {
  loadingEmployees.value = true
  try {
    const data = await employeeService.list({ page_size: 300, status: 'active' })
    const rows = data?.results ?? data ?? []
    allEmployees.value = rows.map((employee) => ({
      label: employee.employee_number
        ? `${employee.full_name} · ${employee.employee_number}`
        : employee.full_name,
      value: employee.id,
    }))
    employeeOptions.value = allEmployees.value
  } finally {
    loadingEmployees.value = false
  }
}
function onClearFilter(key, emptyValue) { filter[key] = emptyValue }
function onClearAllFilters() {
  filter.search = ''
  filter.client = null
  filter.coverage = ''
  filter.armedOnly = false
}

function toggleCoverage(value) {
  filter.coverage = filter.coverage === value ? '' : value
}

// ── Notificação de ocorrências críticas ─────────────────────────────────
function notifyCritical(event) {
  const { delta } = event.detail || {}
  $q.notify({
    type: 'negative',
    icon: 'warning',
    message: `Nova ocorrência crítica/alta (${delta})`,
    caption: 'Verifique a lista de ocorrências em aberto.',
    timeout: 0,
    actions: [
      { label: 'Ver', color: 'white', handler: () => fetch() },
      { label: 'Fechar', color: 'white' },
    ],
    position: 'top-right',
  })
  // Browser notification (se utilizador autorizar)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('PLUSE — Ocorrência crítica', {
      body: 'Há novas ocorrências críticas em aberto.',
      icon: '/icons/android-chrome-192x192.png',
      tag: 'pluse-incident-critical',
    })
  }
  // Pequeno beep
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    o.start(); o.stop(ctx.currentTime + 0.4)
  } catch { /* sem áudio */ }
  fetch()  // refresh imediato
}

onMounted(() => {
  loadEmployees()
  window.addEventListener('pluse-incident-critical', notifyCritical)
  // Pedir permissão para notificações (não-bloqueante)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('pluse-incident-critical', notifyCritical)
})

// Atualiza o label "há X seg" a cada segundo (não bate no backend).
const tick = ref(0)
let tickTimer = null
onMounted(() => { tickTimer = setInterval(() => { tick.value += 1 }, 1000) })
onBeforeUnmount(() => { if (tickTimer) clearInterval(tickTimer) })

const relativeUpdated = computed(() => {
  void tick.value  // dependência para forçar reactividade
  return formatRelativeTime(lastUpdated.value)
})

const liveChipClass = computed(() => ({
  'cco-live-chip--offline': !online.value,
  'cco-live-chip--syncing': loading.value && online.value,
  'cco-live-chip--ok': !loading.value && online.value && lastUpdated.value,
}))

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
function formatDateLong(s) {
  if (!s) return ''
  try {
    const d = new Date(s)
    return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
  } catch { return s }
}
function formatDateTime(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleString('pt-PT') } catch { return s }
}
function coverageLabel(c) {
  return { complete: 'Cobertura completa', partial: 'Cobertura parcial', uncovered: 'Por cobrir' }[c] || c
}
</script>

<style scoped>
/* ── Live indicator ───────────────────────────────────────────────────── */
.cco-live-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.cco-live-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  transition: background-color .2s;
}
.cco-live-chip--ok .cco-live-dot { background: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.18); }
.cco-live-chip--syncing .cco-live-dot { background: #f59e0b; }
.cco-live-chip--offline .cco-live-dot { background: #dc2626; }
.cco-live-dot.is-pulsing {
  animation: cco-live-pulse 1.2s ease-in-out infinite;
}
@keyframes cco-live-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: .65; }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}

/* ── Stats grid ──────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.stat-card {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.stat-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.stat-card__row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 3px;
}
.stat-card__value {
  display: block;
  margin-top: 3px;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--mono);
}
.stat-card__row .stat-card__value { margin-top: 0; }
.stat-card__suffix { font-size: 0.9rem; color: var(--muted-foreground); }
.stat-card--success { background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 8%, var(--card)); }
.stat-card--warning { background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 8%, var(--card)); }
.stat-card--danger {
  background: color-mix(in oklab, var(--destructive) 8%, var(--card));
  border-color: color-mix(in oklab, var(--destructive) 30%, var(--border));
}
.stat-card--danger .stat-card__value { color: var(--destructive); }
.stat-card--info { background: color-mix(in oklab, var(--primary) 8%, var(--card)); }

/* Stats clicáveis: cards transformam-se em botões para filtrar */
.stat-card--button {
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .15s ease, border-color .15s ease;
}
.stat-card--button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -6px rgba(15, 23, 42, .12);
}
.stat-card--button.is-active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--primary) 22%, transparent);
}

.cco-command-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.cco-command-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid color-mix(in oklab, var(--pluse-tone) 22%, var(--border));
  border-radius: 16px;
  background:
    linear-gradient(135deg, color-mix(in oklab, var(--pluse-tone) 10%, var(--card)), color-mix(in oklab, var(--card) 94%, var(--muted) 6%) 58%);
  padding: 14px;
  box-shadow: 0 14px 32px color-mix(in oklab, black 14%, transparent);
}

.cco-command-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  border-radius: 13px;
  background: color-mix(in oklab, var(--pluse-tone) 15%, transparent);
  color: var(--pluse-tone);
  place-items: center;
}

.cco-command-card strong {
  display: block;
  color: var(--mono);
  font-size: 0.95rem;
  font-weight: 850;
}

.cco-command-card p {
  margin: 3px 0 0;
  color: var(--muted-foreground);
  font-size: 0.82rem;
  line-height: 1.35;
}

.cco-command-card__button {
  border: 1px solid color-mix(in oklab, var(--pluse-tone) 30%, transparent);
  border-radius: 999px;
  background: color-mix(in oklab, var(--card) 92%, var(--muted) 8%);
  color: var(--pluse-tone);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 850;
  padding: 7px 10px;
}

.cco-command-card.is-blue { --pluse-tone: var(--primary); }
.cco-command-card.is-amber { --pluse-tone: var(--pluse-amber-500, #f59e0b); }
.cco-command-card.is-red { --pluse-tone: var(--destructive); }

/* ── Filtros de Operações ──────────────────────────────────────────────────── */
.cco-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 8px;
}
.cco-filter-search { min-width: 220px; flex: 1; }

.block-title__count {
  margin-left: auto;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

/* ── Block titles ────────────────────────────────────────────────────── */
.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
}
.block-title__link {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.block-title__link:hover { text-decoration: underline; }

/* ── Posts grid ──────────────────────────────────────────────────────── */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.post-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.post-card--partial {
  border-color: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 38%, var(--border));
}
.post-card--uncovered {
  border-color: color-mix(in oklab, var(--destructive) 38%, var(--border));
}
.post-card__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 20%, transparent);
}
.post-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.post-card__sub {
  font-size: 0.74rem;
  color: var(--muted-foreground);
  margin-top: 2px;
}
.armed-tag {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.coverage-pill {
  flex: none;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.coverage-pill--complete {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 18%, transparent);
  color: var(--pluse-emerald-600, #059669);
}
.coverage-pill--partial {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 20%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.coverage-pill--uncovered {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.post-card__shifts {
  display: flex;
  flex-direction: column;
}
.shift-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.shift-line:last-child { border-bottom: none; }
.shift-line__body {
  flex: 1;
  min-width: 0;
}
.shift-line__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.shift-line__name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.shift-line__sub {
  font-size: 0.7rem;
  color: var(--muted-foreground);
}
.shift-line__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: none;
  align-self: center;
  color: var(--muted-foreground);
}
.period-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.66rem;
  font-weight: 700;
  background: var(--muted);
  color: var(--muted-foreground);
}
.period-chip--day {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.period-chip--night {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
.post-card__empty {
  padding: 16px 14px;
  font-size: 0.8rem;
  color: var(--muted-foreground);
  font-style: italic;
}
.post-card__actions {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px 14px;
  border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
}

.cco-action-dialog {
  width: min(440px, calc(100vw - 32px));
  border-radius: 18px;
}
.cco-action-dialog__eyebrow {
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0;
  text-transform: uppercase;
}
.cco-action-dialog__title {
  margin-top: 6px;
  color: var(--mono);
  font-size: 1.18rem;
  font-weight: 850;
}
.cco-action-dialog__copy {
  margin: 6px 0 0;
  color: var(--muted-foreground);
  font-size: 0.9rem;
}
.cco-action-dialog__body {
  display: grid;
  gap: 12px;
}

/* ── Incidents list ──────────────────────────────────────────────────── */
.incident-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.incident-row__dot {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
}
.incident-row__dot--low { background: var(--muted-foreground); }
.incident-row__dot--medium { background: var(--pluse-cyan-500, #06b6d4); }
.incident-row__dot--high { background: var(--pluse-amber-500, #f59e0b); }
.incident-row__dot--critical { background: var(--destructive); }
.incident-row__title {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--mono);
}
.incident-row__meta {
  font-size: 0.74rem;
  color: var(--muted-foreground);
}

@media (max-width: 1180px) {
  .cco-command-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .cco-command-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .cco-command-card__button {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
