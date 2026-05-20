<!--
  Disciplinary tab on the employee detail page — logs verbal/written
  warnings, suspensions and disciplinary processes. Records are logged
  (no approval workflow).
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <AppHeading :level="3" class="text-sm font-semibold text-mono">
        Registos disciplinares
      </AppHeading>
      <q-btn
        unelevated no-caps color="primary" size="sm" icon="add"
        label="Novo registo" @click="openModal"
      />
    </div>

    <div v-if="loading" class="loading-row">
      <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!items.length"
      title="Sem ocorrências"
      description="Não há registos disciplinares para este colaborador."
      icon="ki-shield-tick"
    />

    <div v-else class="flex flex-col gap-2">
      <div v-for="r in items" :key="r.id" class="disc-row">
        <span class="disc-row__icon" :class="`disc-row__icon--${toneOf(r.record_type)}`">
          <AppIcon name="ki-warning-2" :size="18" />
        </span>
        <div class="grow min-w-0">
          <div class="text-sm font-semibold text-mono">{{ r.record_type_display }}</div>
          <div class="text-xs text-muted-foreground">
            Ocorrência {{ formatDate(r.incident_date) }}
            <template v-if="r.suspension_days"> · {{ r.suspension_days }} dia(s)</template>
          </div>
          <p class="text-sm mt-1 whitespace-pre-line">{{ r.description }}</p>
          <a v-if="r.file" :href="absoluteFileUrl(r.file)" target="_blank" rel="noopener"
             class="file-link">
            <AppIcon name="ki-document" :size="13" /> Documento
          </a>
        </div>
        <AppBadge :variant="outcomeVariant(r.outcome)">{{ r.outcome_display }}</AppBadge>
      </div>
    </div>

    <!-- Add modal -->
    <AppModal v-model="showModal" size="lg" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-4">
          Novo registo disciplinar
        </AppHeading>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select
              v-model="form.record_type" :options="disciplinaryTypeOptions"
              label="Tipo *" outlined dense emit-value map-options :rules="[req]"
            />
            <q-input
              v-model="form.incident_date" label="Data da ocorrência *"
              type="date" outlined dense stack-label :rules="[req]"
            />
            <q-input
              v-if="form.record_type === 'suspension'"
              v-model.number="form.suspension_days" label="Dias de suspensão *"
              type="number" outlined dense min="1" :rules="[req]"
            />
            <q-select
              v-model="form.outcome" :options="disciplinaryOutcomeOptions"
              label="Desfecho" outlined dense emit-value map-options
            />
          </div>
          <q-input
            v-model="form.description" label="Descrição da ocorrência *"
            type="textarea" outlined dense autogrow :rules="[req]"
          />
          <q-input v-model="form.measure" label="Medida / sanção aplicada" outlined dense />
          <q-file
            v-model="form.file" label="Documento (opcional)"
            outlined dense clearable max-file-size="10485760"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting"
                   @click="showModal = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Guardar registo" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { disciplinaryService } from 'src/services/employment.service'
import { disciplinaryTypeOptions, disciplinaryOutcomeOptions } from 'src/config/employment'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  employeeId: { type: [Number, String], required: true },
})

const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const items = ref([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const form = reactive({
  record_type: '',
  incident_date: '',
  suspension_days: null,
  outcome: 'open',
  description: '',
  measure: '',
  file: null,
})

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function toneOf(type) {
  return {
    verbal_warning: 'warning',
    written_warning: 'warning',
    suspension: 'danger',
    disciplinary_process: 'danger',
  }[type] || 'warning'
}
function outcomeVariant(outcome) {
  return {
    open: 'warning',
    dismissed: 'neutral',
    sanctioned: 'danger',
    escalated: 'danger',
  }[outcome] || 'neutral'
}

async function fetchRecords() {
  loading.value = true
  try {
    const data = await disciplinaryService.list({
      employee: props.employeeId,
      page_size: 100,
    })
    items.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

function openModal() {
  Object.assign(form, {
    record_type: '', incident_date: '', suspension_days: null,
    outcome: 'open', description: '', measure: '', file: null,
  })
  showModal.value = true
}

async function submit() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { employee: props.employeeId, ...form }
    if (!(payload.file instanceof File)) delete payload.file
    await disciplinaryService.create(payload)
    toast.success('Registo disciplinar guardado.')
    showModal.value = false
    await fetchRecords()
  } catch (err) {
    toast.error('Não foi possível guardar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    submitting.value = false
  }
}

onMounted(fetchRecords)
</script>

<style scoped>
.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--muted-foreground);
}
.disc-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.disc-row__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
}
.disc-row__icon--warning {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: var(--pluse-amber-600, #d97706);
}
.disc-row__icon--danger {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.file-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.file-link:hover { text-decoration: underline; }
</style>
