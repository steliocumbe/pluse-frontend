<!--
  /absences — Faltas e substituições (Fase 3.2).
  Lista turnos em falta (ou substituídos) e permite ao RH inserir a
  justificação. A aprovação fica com o Diretor Financeiro.
-->
<template>
  <AdminPageTemplate
    eyebrow="Recursos Humanos"
    title="Faltas e substituições"
    description="Turnos em que o vigilante escalado não compareceu — quem faltou, quem cobriu, e a justificação (RH) com aprovação do Diretor Financeiro."
  >
    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ rows.length }} ocorrência{{ rows.length === 1 ? '' : 's' }}
      </span>
      <span v-if="unjustifiedCount" class="admin-meta-chip admin-meta-chip--accent">
        {{ unjustifiedCount }} por justificar
      </span>
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section class="flex flex-wrap items-end gap-3">
        <q-input v-model="filters.from" label="De" type="date" outlined dense stack-label
                 @update:model-value="fetch" />
        <q-input v-model="filters.to" label="Até" type="date" outlined dense stack-label
                 @update:model-value="fetch" />
        <q-select
          v-model="filters.post" :options="postOptions"
          outlined dense emit-value map-options clearable
          label="Posto (opcional)" style="min-width: 220px"
          @update:model-value="fetch"
        />
      </q-card-section>
    </q-card>

    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="2em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!rows.length"
      title="Sem faltas no período"
      description="Não há turnos em falta ou substituídos no intervalo seleccionado."
      icon="ki-check-circle"
    />

    <div v-else class="flex flex-col gap-2 mt-4">
      <div v-for="r in rows" :key="r.id" class="abs-row">
        <span class="abs-row__date">
          <span class="abs-row__day">{{ dayOf(r.date) }}</span>
          <span class="abs-row__month">{{ monthOf(r.date) }}</span>
        </span>
        <div class="grow min-w-0">
          <div class="text-sm font-semibold text-mono">{{ r.employee_name }}</div>
          <div class="text-xs text-muted-foreground">
            {{ r.post_name }} · {{ r.period_display }}
            <template v-if="r.substitute_name"> · substituído por {{ r.substitute_name }}</template>
          </div>
        </div>
        <AppBadge :variant="r.attendance_status === 'absent' ? 'danger' : 'warning'" size="sm">
          {{ r.attendance_status_display }}
        </AppBadge>
        <div class="abs-row__just">
          <template v-if="justificationOf(r)">
            <AppBadge :variant="leaveStatusVariant(justificationOf(r).status)" size="sm">
              Justif. {{ justificationOf(r).status_display }}
            </AppBadge>
            <q-btn
              v-if="justificationOf(r).status === 'pending' && canApprove"
              flat round dense icon="more_vert" size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 170px">
                  <q-item clickable v-close-popup @click="approveJustification(justificationOf(r))">
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section>Aprovar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="rejectJustification(justificationOf(r))">
                    <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                    <q-item-section>Rejeitar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
          <q-btn
            v-else outline no-caps size="sm" icon="note_add"
            label="Justificar" @click="openJustify(r)"
          />
        </div>
      </div>
    </div>

    <!-- Justify modal -->
    <AppModal v-model="showJustify" size="md" persistent>
      <div v-if="current" class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Justificar falta
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          {{ current.employee_name }} · {{ current.post_name }} ·
          {{ formatDate(current.date) }} ({{ current.period_display }})
        </p>
        <p class="text-xs text-muted-foreground mb-4">
          A justificação fica pendente até aprovação do Diretor Financeiro.
        </p>
        <q-form ref="justifyForm" greedy class="flex flex-col gap-4" @submit="submitJustify">
          <q-select
            v-model="justify.justification_type" :options="justificationTypeOptions"
            label="Tipo *" outlined dense emit-value map-options :rules="[req]"
          />
          <q-input v-model="justify.description" label="Descrição *" type="textarea"
                   outlined dense autogrow :rules="[req]" />
          <q-file v-model="justify.document" label="Documento (atestado, etc.)"
                  outlined dense clearable max-file-size="10485760"
                  accept=".pdf,.jpg,.jpeg,.png">
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="saving" @click="showJustify = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Submeter justificação" :loading="saving" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { shiftService } from 'src/services/scheduling.service'
import { postService } from 'src/services/post.service'
import {
  absenceJustificationService,
} from 'src/services/leaves.service'
import {
  justificationTypeOptions, leaveStatusVariant,
} from 'src/config/leaves'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const canApprove = computed(
  () => auth.user?.is_superuser
    || auth.hasAnyGroup('Diretor Financeiro', 'Administrador', 'Direcao'),
)

function firstOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
const today = new Date().toISOString().slice(0, 10)

const rows = ref([])
const justifications = ref([])
const postOptions = ref([])
const loading = ref(false)
const saving = ref(false)
const filters = reactive({ from: firstOfMonth(), to: today, post: '' })

const justificationByShiftId = computed(() => {
  const map = new Map()
  for (const j of justifications.value) map.set(j.shift, j)
  return map
})
function justificationOf(shift) {
  return justificationByShiftId.value.get(shift.id) || null
}

const unjustifiedCount = computed(
  () => rows.value.filter((r) => !justificationOf(r)).length,
)

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
function dayOf(iso) { try { return new Date(iso).getDate() } catch { return '' } }
function monthOf(iso) { try { return MONTHS[new Date(iso).getMonth()] } catch { return '' } }
function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function loadPosts() {
  try {
    const data = await postService.list({ page_size: 200 })
    postOptions.value = (data?.results ?? data ?? []).map((p) => ({
      label: p.client_name ? `${p.name} — ${p.client_name}` : p.name,
      value: p.id,
    }))
  } catch { /* interceptor toasts */ }
}

async function fetch() {
  if (!filters.from || !filters.to) return
  loading.value = true
  try {
    const params = {
      date__gte: filters.from, date__lte: filters.to,
      attendance_status__in: 'absent,substituted',
      page_size: 200, ordering: '-date',
    }
    if (filters.post) params.post = filters.post
    const [shifts, justifs] = await Promise.all([
      shiftService.list(params),
      absenceJustificationService.list({ page_size: 200 }),
    ])
    rows.value = shifts?.results ?? shifts ?? []
    justifications.value = justifs?.results ?? justifs ?? []
  } finally {
    loading.value = false
  }
}

// ── Justify modal ───────────────────────────────────────────────────────
const showJustify = ref(false)
const justifyForm = ref(null)
const current = ref(null)
const justify = reactive({ justification_type: 'medical', description: '', document: null })

function openJustify(shift) {
  current.value = shift
  Object.assign(justify, { justification_type: 'medical', description: '', document: null })
  showJustify.value = true
}

async function submitJustify() {
  if (!(await justifyForm.value?.validate())) return
  saving.value = true
  try {
    const payload = {
      shift: current.value.id,
      justification_type: justify.justification_type,
      description: justify.description,
    }
    if (justify.document instanceof File) payload.document = justify.document
    const created = await absenceJustificationService.create(payload)
    justifications.value.push(created)
    toast.success('Justificação submetida.')
    showJustify.value = false
  } catch (err) {
    toast.error('Não foi possível submeter.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    saving.value = false
  }
}

// ── Approve / reject justification ──────────────────────────────────────
function approveJustification(j) {
  $q.dialog({
    title: 'Aprovar justificação',
    message: 'Aprovar a justificação desta falta?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      const updated = await absenceJustificationService.approve(j.id)
      const idx = justifications.value.findIndex((x) => x.id === updated.id)
      if (idx >= 0) justifications.value[idx] = updated
      toast.success('Justificação aprovada.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}
function rejectJustification(j) {
  $q.dialog({
    title: 'Rejeitar justificação',
    message: 'Motivo (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      const updated = await absenceJustificationService.reject(j.id, reason || '')
      const idx = justifications.value.findIndex((x) => x.id === updated.id)
      if (idx >= 0) justifications.value[idx] = updated
      toast.success('Justificação rejeitada.')
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(async () => {
  await loadPosts()
  await fetch()
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
.abs-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.abs-row__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--destructive) 12%, transparent);
  color: var(--destructive);
}
.abs-row__day { font-size: 1.1rem; font-weight: 800; line-height: 1; }
.abs-row__month {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.abs-row__just {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
