<!--
  /attendance — Marcação de presenças (Fase 2).
  Lista os turnos de um dia e permite marcar presença/falta/substituição.
-->
<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Marcação de presenças"
    description="Registo diário de presença por turno — presente, falta ou substituição."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-check-circle" :size="14" />
        {{ rows.length }} turno{{ rows.length === 1 ? '' : 's' }}
      </span>
      <span v-if="pendingCount" class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ pendingCount }} por marcar
      </span>
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input
          v-model="filters.date" label="Data" type="date" outlined dense stack-label
          @update:model-value="fetchShifts"
        />
        <q-select
          v-model="filters.post" :options="postOptions"
          outlined dense emit-value map-options clearable
          label="Posto (opcional)" style="min-width: 220px"
          @update:model-value="fetchShifts"
        />
      </q-card-section>
    </q-card>

    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!rows.length"
      title="Sem turnos neste dia"
      description="Não há turnos escalados para a data seleccionada."
      icon="ki-calendar"
    />

    <div v-else class="flex flex-col gap-2 mt-4">
      <div v-for="s in rows" :key="s.id" class="shift-row">
        <span class="shift-row__period" :class="`shift-row__period--${s.period}`">
          {{ s.period_display }}
        </span>
        <div class="grow min-w-0">
          <div class="text-sm font-semibold text-mono">{{ s.employee_name }}</div>
          <div class="text-xs text-muted-foreground">
            {{ s.post_name }}
            <template v-if="s.is_double"> · dobra</template>
            <template v-if="s.substitute_name"> · substituído por {{ s.substitute_name }}</template>
          </div>
        </div>
        <AppBadge :variant="attendanceVariant(s.attendance_status)">
          {{ s.attendance_status_display }}
        </AppBadge>
        <q-btn outline no-caps size="sm" icon="how_to_reg" label="Marcar"
               @click="openMark(s)" />
      </div>
    </div>

    <!-- Mark modal -->
    <AppModal v-model="showMark" size="md" persistent>
      <div v-if="current" class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Marcar presença
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          {{ current.employee_name }} · {{ current.post_name }} ·
          {{ current.date }} ({{ current.period_display }})
        </p>
        <q-form ref="markForm" greedy class="flex flex-col gap-4" @submit="submitMark">
          <q-select
            v-model="mark.attendance_status" :options="attendanceStatusOptions"
            label="Estado *" outlined dense emit-value map-options :rules="[req]"
          />
          <q-select
            v-if="mark.attendance_status === 'substituted'"
            v-model="mark.substitute" :options="employeeOptions"
            label="Vigilante substituto *" outlined dense emit-value map-options
            use-input input-debounce="200" @filter="filterEmployees" :rules="[req]"
          />
          <q-input
            v-if="mark.attendance_status === 'absent'"
            v-model="mark.absence_reason" label="Justificação da falta"
            type="textarea" outlined dense autogrow
            hint="Registo preliminar — a aprovação formal é tratada em Faltas (RH)."
          />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showMark = false" />
            <q-btn unelevated no-caps color="primary" type="submit" label="Guardar"
                   :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { shiftService } from 'src/services/scheduling.service'
import { postService } from 'src/services/post.service'
import { employeeService } from 'src/services/employee.service'
import { attendanceStatusOptions, attendanceVariant } from 'src/config/scheduling'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const today = new Date().toISOString().slice(0, 10)
const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ date: today, post: '' })

const pendingCount = computed(
  () => rows.value.filter((s) => s.attendance_status === 'pending').length,
)

// ── Reference options ───────────────────────────────────────────────────
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
    }))
    allEmployees.value = (emps?.results ?? emps ?? []).map((e) => ({
      label: `${e.full_name} (${e.employee_number})`,
      value: e.id,
    }))
    employeeOptions.value = allEmployees.value
  } catch { /* interceptor toasts */ }
}

async function fetchShifts() {
  if (!filters.date) return
  loading.value = true
  try {
    const params = { date: filters.date, page_size: 200, ordering: 'post__name' }
    if (filters.post) params.post = filters.post
    const data = await shiftService.list(params)
    rows.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

// ── Mark modal ───────────────────────────────────────────────────────────
const showMark = ref(false)
const markForm = ref(null)
const current = ref(null)
const mark = reactive({ attendance_status: 'present', substitute: '', absence_reason: '' })

function openMark(shift) {
  current.value = shift
  Object.assign(mark, {
    attendance_status: shift.attendance_status === 'pending'
      ? 'present' : shift.attendance_status,
    substitute: shift.substitute || '',
    absence_reason: shift.absence_reason || '',
  })
  showMark.value = true
}

async function submitMark() {
  if (!(await markForm.value?.validate())) return
  saving.value = true
  try {
    const payload = { attendance_status: mark.attendance_status }
    if (mark.attendance_status === 'substituted') payload.substitute = mark.substitute
    if (mark.attendance_status === 'absent') payload.absence_reason = mark.absence_reason
    const updated = await shiftService.markAttendance(current.value.id, payload)
    const idx = rows.value.findIndex((s) => s.id === updated.id)
    if (idx >= 0) rows.value[idx] = { ...rows.value[idx], ...updated }
    toast.success('Presença marcada.')
    showMark.value = false
  } catch (err) {
    toast.error('Não foi possível marcar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadRefs()
  await fetchShifts()
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
.shift-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.shift-row__period {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--muted);
  color: var(--muted-foreground);
}
.shift-row__period--day {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.shift-row__period--night {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
</style>
