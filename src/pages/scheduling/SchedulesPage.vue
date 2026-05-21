<!--
  /schedules — Escalas (Fase 2).
  Grelha semanal: um cartão por posto, linhas por período, colunas por dia.
  Célula vazia → atribuir turno; chip de turno → cancelar.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Escalas"
    description="Planeamento semanal de turnos — quem cobre cada posto, em que dia e período."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-calendar" :size="14" />
        {{ shifts.length }} turno{{ shifts.length === 1 ? '' : 's' }} esta semana
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="auto_awesome_motion" label="Gerar escala" @click="openGenerate"
      />
      <q-btn
        unelevated no-caps class="admin-hero-primary"
        icon="add" label="Atribuir turno" @click="openAssign()"
      />
    </template>

    <!-- Semana + filtro -->
    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-center gap-2">
        <q-btn flat round dense icon="chevron_left" @click="shiftWeek(-7)" />
        <div class="week-label">{{ weekRangeLabel }}</div>
        <q-btn flat round dense icon="chevron_right" @click="shiftWeek(7)" />
        <q-btn flat no-caps size="sm" label="Hoje" @click="goToday" />
        <q-space />
        <q-select
          v-model="filters.post" :options="postOptions"
          outlined dense emit-value map-options clearable
          label="Posto" style="min-width: 240px"
          @update:model-value="fetchWeek"
        />
      </q-card-section>
    </q-card>

    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!board.length"
      title="Sem turnos nesta semana"
      description="Escolha um posto para ver/preencher a grelha, ou gere a escala de uma vez."
      icon="ki-calendar"
    />

    <div v-else class="flex flex-col gap-4">
      <q-card v-for="post in board" :key="post.id" flat bordered class="escala-card">
        <div class="escala-card__head">
          <AppIcon name="ki-geolocation" :size="15" />
          <span>{{ post.name }}</span>
        </div>
        <div class="escala-grid" :style="gridStyle">
          <div class="escala-grid__corner">Período</div>
          <div
            v-for="d in weekDays" :key="d.iso"
            class="escala-grid__day" :class="{ 'is-today': d.iso === todayIso }"
          >
            <span class="escala-grid__dow">{{ d.dow }}</span>
            <span class="escala-grid__date">{{ d.short }}</span>
          </div>

          <template v-for="period in post.periods" :key="period.key">
            <div class="escala-grid__period">{{ period.label }}</div>
            <div
              v-for="d in weekDays" :key="period.key + d.iso"
              class="escala-grid__cell" :class="{ 'is-today': d.iso === todayIso }"
              @click="onCellClick(post, period.key, d.iso, period.cells[d.iso])"
            >
              <div
                v-for="s in period.cells[d.iso] || []" :key="s.id"
                class="shift-chip" :class="`shift-chip--${attendanceVariant(s.attendance_status)}`"
                @click.stop
              >
                <span class="shift-chip__name">{{ guardName(s) }}</span>
                <span v-if="s.is_double" class="shift-chip__tag">D</span>
                <q-menu>
                  <q-list dense style="min-width: 180px">
                    <q-item-label header>
                      {{ s.attendance_status_display }}
                    </q-item-label>
                    <q-item clickable v-close-popup @click="cancelShift(s)">
                      <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                      <q-item-section>Cancelar turno</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </div>
              <span v-if="!(period.cells[d.iso] || []).length" class="cell-add">+</span>
            </div>
          </template>
        </div>
      </q-card>
    </div>

    <!-- Atribuir turno -->
    <AppModal v-model="showAssign" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Atribuir turno
        </AppHeading>
        <q-form ref="assignForm" greedy class="flex flex-col gap-4" @submit="submitAssign">
          <q-select v-model="assign.post" :options="postOptions" label="Posto *"
                    outlined dense emit-value map-options :rules="[req]" />
          <q-select v-model="assign.employee" :options="employeeOptions" label="Vigilante *"
                    outlined dense emit-value map-options use-input input-debounce="200"
                    @filter="filterEmployees" :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="assign.date" label="Data *" type="date" outlined dense
                     stack-label :rules="[req]" />
            <q-select v-model="assign.period" :options="periodOptions" label="Período *"
                      outlined dense emit-value map-options :rules="[req]" />
          </div>
          <q-checkbox v-model="assign.is_double" label="É uma dobra (turno extra)" />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showAssign = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Atribuir"
                   :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>

    <!-- Gerar escala -->
    <AppModal v-model="showGenerate" size="md" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Gerar escala
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Cria os turnos de um posto num intervalo de datas, alternando os
          vigilantes indicados. Turnos já existentes são ignorados.
        </p>
        <q-form ref="generateForm" greedy class="flex flex-col gap-4" @submit="submitGenerate">
          <q-select v-model="gen.post" :options="postOptions" label="Posto *"
                    outlined dense emit-value map-options :rules="[req]" />
          <div class="grid grid-cols-2 gap-3">
            <q-input v-model="gen.start_date" label="Início *" type="date" outlined dense
                     stack-label :rules="[req]" />
            <q-input v-model="gen.end_date" label="Fim *" type="date" outlined dense
                     stack-label :rules="[req]" />
          </div>
          <q-select v-model="gen.periods" :options="periodOptions" label="Períodos *"
                    outlined dense emit-value map-options multiple use-chips
                    hint="Preenchidos a partir do regime de turno do posto — editável."
                    :rules="[(v) => (v && v.length > 0) || 'Escolha pelo menos um']" />
          <q-select v-model="gen.employees" :options="employeeOptions" label="Vigilantes (rotação) *"
                    outlined dense emit-value map-options multiple use-chips use-input
                    input-debounce="200" @filter="filterEmployees"
                    :rules="[(v) => (v && v.length > 0) || 'Escolha pelo menos um']" />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showGenerate = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Gerar"
                   :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { shiftService } from 'src/services/scheduling.service'
import { postService } from 'src/services/post.service'
import { employeeService } from 'src/services/employee.service'
import { periodOptions, periodLabel, attendanceVariant } from 'src/config/scheduling'
import { periodsForRegime } from 'src/config/posts'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const DOW = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PERIOD_ORDER = ['day', 'night', 'full']
const gridStyle = 'grid-template-columns: 116px repeat(7, minmax(0, 1fr));'

function toIso(d) {
  return d.toISOString().slice(0, 10)
}
function mondayOf(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() // 0 Dom .. 6 Sáb
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day))
  return date
}

const todayIso = toIso(new Date())
const weekStart = ref(mondayOf(new Date()))

const weekDays = computed(() => {
  const out = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    out.push({ iso: toIso(d), dow: DOW[i], short: `${d.getDate()}/${d.getMonth() + 1}` })
  }
  return out
})
const weekRangeLabel = computed(() => {
  const a = new Date(weekStart.value)
  const b = new Date(weekStart.value)
  b.setDate(b.getDate() + 6)
  return `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
})

const shifts = ref([])
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ post: '' })

function guardName(s) {
  return s.attendance_status === 'substituted' && s.substitute_name
    ? s.substitute_name
    : s.employee_name
}

// ── Grelha ──────────────────────────────────────────────────────────────
const board = computed(() => {
  const byPost = new Map()
  for (const s of shifts.value) {
    if (!byPost.has(s.post)) {
      byPost.set(s.post, { id: s.post, name: s.post_name, periods: new Map() })
    }
    const post = byPost.get(s.post)
    if (!post.periods.has(s.period)) post.periods.set(s.period, {})
    const cells = post.periods.get(s.period)
    ;(cells[s.date] ||= []).push(s)
  }

  // Posto filtrado sem turnos — mostra a grelha vazia para se poder preencher.
  if (filters.post) {
    if (!byPost.has(filters.post)) {
      const opt = postOptions.value.find((o) => o.value === filters.post)
      byPost.set(filters.post, {
        id: filters.post, name: opt?.label || 'Posto', periods: new Map(),
      })
    }
    const opt = postOptions.value.find((o) => o.value === filters.post)
    const regime = periodsForRegime(opt?.shiftHours)
    const post = byPost.get(filters.post)
    for (const p of (regime.length ? regime : ['day', 'night'])) {
      if (!post.periods.has(p)) post.periods.set(p, {})
    }
  }

  return [...byPost.values()].map((post) => ({
    id: post.id,
    name: post.name,
    periods: PERIOD_ORDER
      .filter((p) => post.periods.has(p))
      .map((p) => ({ key: p, label: periodLabel(p), cells: post.periods.get(p) })),
  }))
})

// ── Opções de referência ────────────────────────────────────────────────
const postOptions = ref([])
const allEmployees = ref([])
const employeeOptions = ref([])

function filterEmployees(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    employeeOptions.value = n
      ? allEmployees.value.filter((o) => o.label.toLowerCase().includes(n))
      : allEmployees.value
  })
}

async function loadRefs() {
  try {
    const [posts, emps] = await Promise.all([
      postService.list({ page_size: 200 }),
      employeeService.list({ page_size: 300, status: 'active' }),
    ])
    postOptions.value = (posts?.results ?? posts ?? []).map((p) => ({
      label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
      value: p.id,
      shiftHours: p.shift_hours,
    }))
    allEmployees.value = (emps?.results ?? emps ?? []).map((e) => ({
      label: `${e.full_name} (${e.employee_number})`,
      value: e.id,
    }))
    employeeOptions.value = allEmployees.value
  } catch { /* interceptor toasts */ }
}

async function fetchWeek() {
  loading.value = true
  try {
    const params = {
      date__gte: weekDays.value[0].iso,
      date__lte: weekDays.value[6].iso,
      page_size: 500,
    }
    if (filters.post) params.post = filters.post
    const data = await shiftService.list(params)
    shifts.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

function shiftWeek(days) {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + days)
  weekStart.value = d
  fetchWeek()
}
function goToday() {
  weekStart.value = mondayOf(new Date())
  fetchWeek()
}

function cancelShift(shift) {
  $q.dialog({
    title: 'Cancelar turno',
    message: `Cancelar o turno de ${guardName(shift)} em ${shift.date}?`,
    cancel: { label: 'Voltar', flat: true, noCaps: true },
    ok: { label: 'Cancelar turno', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await shiftService.remove(shift.id)
      toast.success('Turno cancelado.')
      await fetchWeek()
    } catch (err) {
      toast.error('Não foi possível cancelar.', { caption: err?.response?.data?.detail })
    }
  })
}

// ── Atribuir turno ───────────────────────────────────────────────────────
const showAssign = ref(false)
const assignForm = ref(null)
const assign = reactive({ post: '', employee: '', date: '', period: 'day', is_double: false })

function openAssign(prefill = {}) {
  Object.assign(assign, {
    post: prefill.post || filters.post || '',
    employee: '',
    date: prefill.date || weekDays.value[0].iso,
    period: prefill.period || 'day',
    is_double: false,
  })
  showAssign.value = true
}
function onCellClick(post, periodKey, dateIso, existing) {
  if (existing && existing.length) return // chip handles its own click
  openAssign({ post: post.id, period: periodKey, date: dateIso })
}

async function submitAssign() {
  if (!(await assignForm.value?.validate())) return
  saving.value = true
  try {
    await shiftService.create({ ...assign })
    toast.success('Turno atribuído.')
    showAssign.value = false
    await fetchWeek()
  } catch (err) {
    toast.error('Não foi possível atribuir.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

// ── Gerar escala ─────────────────────────────────────────────────────────
const showGenerate = ref(false)
const generateForm = ref(null)
const gen = reactive({ post: '', start_date: '', end_date: '', periods: [], employees: [] })

function openGenerate() {
  Object.assign(gen, {
    post: filters.post || '',
    start_date: weekDays.value[0].iso,
    end_date: weekDays.value[6].iso,
    periods: [],
    employees: [],
  })
  showGenerate.value = true
}

watch(() => gen.post, (postId) => {
  const opt = postOptions.value.find((o) => o.value === postId)
  const derived = periodsForRegime(opt?.shiftHours)
  gen.periods = derived.length ? derived : []
})

async function submitGenerate() {
  if (!(await generateForm.value?.validate())) return
  saving.value = true
  try {
    const res = await shiftService.generate({ ...gen })
    toast.success(`${res.created} turno(s) gerado(s).`)
    showGenerate.value = false
    await fetchWeek()
  } catch (err) {
    toast.error('Não foi possível gerar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadRefs()
  await fetchWeek()
})
</script>

<style scoped>
.pluse-card { background: var(--card); }
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
.week-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
  min-width: 190px;
  text-align: center;
}

/* ── Cartão de escala por posto ─────────────────────────────────────── */
.escala-card { background: var(--card); overflow: hidden; }
.escala-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--mono);
  background: color-mix(in oklab, var(--muted) 35%, transparent);
  border-bottom: 1px solid var(--border);
}

/* ── Grelha ─────────────────────────────────────────────────────────── */
.escala-grid {
  display: grid;
  overflow-x: auto;
}
.escala-grid__corner,
.escala-grid__day,
.escala-grid__period,
.escala-grid__cell {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  min-width: 0;
}
.escala-grid__corner,
.escala-grid__day {
  padding: 8px 6px;
  background: color-mix(in oklab, var(--muted) 20%, transparent);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted-foreground);
  text-align: center;
}
.escala-grid__corner { text-align: left; padding-left: 12px; }
.escala-grid__day { display: flex; flex-direction: column; }
.escala-grid__dow { color: var(--mono); }
.escala-grid__date { font-weight: 600; }
.escala-grid__day.is-today,
.escala-grid__cell.is-today {
  background: color-mix(in oklab, var(--primary) 7%, transparent);
}
.escala-grid__period {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--mono);
  background: color-mix(in oklab, var(--muted) 12%, transparent);
}
.escala-grid__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  min-height: 48px;
  cursor: pointer;
  transition: background 120ms ease;
}
.escala-grid__cell:hover {
  background: color-mix(in oklab, var(--primary) 6%, transparent);
}
.cell-add {
  margin: auto;
  font-size: 1rem;
  color: color-mix(in oklab, var(--muted-foreground) 60%, transparent);
}

/* ── Chip de turno ──────────────────────────────────────────────────── */
.shift-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 7px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.shift-chip__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shift-chip__tag {
  flex: none;
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  background: var(--pluse-amber-500, #f59e0b);
  color: white;
}
.shift-chip--neutral {
  background: color-mix(in oklab, var(--muted) 60%, transparent);
  color: var(--foreground);
  border-color: var(--border);
}
.shift-chip--success {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 16%, transparent);
  color: var(--pluse-emerald-600, #059669);
}
.shift-chip--danger {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.shift-chip--warning {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 18%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
</style>
