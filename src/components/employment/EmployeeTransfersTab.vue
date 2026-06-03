<!--
  Transfers tab on the employee detail page — moves between departments,
  clients and posts. Created PENDING; on approval the new placement is
  applied to the employee record.
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <AppHeading :level="3" class="text-sm font-semibold text-mono">
        Transferências
      </AppHeading>
      <q-btn
        unelevated no-caps color="primary" size="sm" icon="add"
        label="Nova transferência" @click="openModal"
      />
    </div>

    <div v-if="loading" class="loading-row">
      <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="!items.length"
      title="Sem transferências"
      description="Este colaborador não tem transferências registadas."
      icon="ki-arrow-right"
    />

    <div v-else class="flex flex-col gap-3">
      <article v-for="t in items" :key="t.id" class="transfer-card">
        <header class="transfer-card__head">
          <span class="transfer-card__icon"><AppIcon name="ki-arrow-right" :size="18" /></span>
          <div class="transfer-card__head-body">
            <div class="transfer-card__title">
              Efectiva a {{ formatDate(t.effective_date) }}
            </div>
            <div class="transfer-card__sub">
              Registada {{ formatDate(t.created_at) }}
              <span v-if="t.created_by_name"> · por {{ t.created_by_name }}</span>
            </div>
          </div>
          <AppBadge :variant="statusVariant(t.status)">{{ t.status_display }}</AppBadge>
          <q-btn
            v-if="t.status === 'pending' && canApprove"
            flat round dense icon="more_vert" size="sm"
          >
            <q-menu>
              <q-list dense style="min-width: 150px">
                <q-item clickable v-close-popup @click="approve(t)">
                  <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                  <q-item-section>Aprovar</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="reject(t)">
                  <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                  <q-item-section>Rejeitar</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </header>

        <div class="transfer-card__flow">
          <div class="transfer-side transfer-side--from">
            <span class="transfer-side__label">
              <AppIcon name="ki-arrow-up" :size="11" /> Origem
            </span>
            <strong>{{ describeOrigin(t) }}</strong>
          </div>
          <span class="transfer-card__arrow" aria-hidden="true">→</span>
          <div class="transfer-side transfer-side--to">
            <span class="transfer-side__label">
              <AppIcon name="ki-arrow-right" :size="11" /> Destino
            </span>
            <strong>{{ describeDestination(t) }}</strong>
          </div>
        </div>

        <div v-if="t.reason || t.notes" class="transfer-card__meta">
          <div v-if="t.reason" class="transfer-meta">
            <span class="transfer-meta__label">
              <AppIcon name="ki-message-text" :size="12" /> Motivo
            </span>
            <span class="transfer-meta__value">{{ t.reason }}</span>
          </div>
          <div v-if="t.notes" class="transfer-meta">
            <span class="transfer-meta__label">
              <AppIcon name="ki-document" :size="12" /> Notas
            </span>
            <span class="transfer-meta__value">{{ t.notes }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- Add modal -->
    <AppModal v-model="showModal" size="lg" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Nova transferência
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Fica pendente até aprovação. A aprovação aplica a nova lotação ao colaborador.
        </p>
        <q-form ref="formRef" greedy class="flex flex-col gap-4" @submit="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input
              v-model="form.effective_date" label="Data efectiva *"
              type="date" outlined dense stack-label :rules="[req]"
            />
            <q-select
              v-model="form.new_department" :options="departmentOptions"
              label="Novo departamento" outlined dense emit-value map-options clearable
            />
            <q-select
              v-if="form.new_department === 'support'"
              v-model="form.new_support_unit" :options="supportUnitOptions"
              label="Nova unidade *" outlined dense emit-value map-options
            />
            <q-select
              v-if="form.new_department === 'operations'"
              v-model="form.new_client" :options="clientOptions"
              label="Novo cliente *" outlined dense emit-value map-options
              :loading="loadingRefs"
            />
            <q-select
              v-model="form.new_post" :options="postOptions"
              label="Novo posto" outlined dense emit-value map-options clearable
              :loading="loadingRefs"
            />
            <q-input v-model="form.new_shift" label="Novo turno" outlined dense />
          </div>
          <q-input v-model="form.reason" label="Motivo" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting"
                   @click="showModal = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Registar transferência" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { transferService } from 'src/services/employment.service'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { departmentOptions, supportUnitOptions } from 'src/config/employment'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  employeeId: { type: [Number, String], required: true },
})
const emit = defineEmits(['changed'])

const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const canApprove = computed(
  () => auth.user?.is_superuser || auth.hasAnyGroup('Diretor Financeiro', 'Administrador'),
)

const items = ref([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const clientOptions = ref([])
const postOptions = ref([])
const loadingRefs = ref(false)

const form = reactive({
  effective_date: '',
  new_department: '',
  new_support_unit: '',
  new_client: null,
  new_post: null,
  new_shift: '',
  reason: '',
})

function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}
function statusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}
function describeOrigin(t) {
  const parts = []
  if (t.previous_client_name) parts.push(t.previous_client_name)
  if (t.previous_post_name) parts.push(t.previous_post_name)
  if (!parts.length && t.previous_department_display) {
    parts.push(t.previous_department_display)
    if (t.previous_support_unit_display) parts.push(t.previous_support_unit_display)
  }
  if (t.previous_shift) parts.push(`turno ${t.previous_shift}`)
  return parts.length ? parts.join(' · ') : '— (sem registo)'
}

function describeDestination(t) {
  const parts = []
  if (t.new_client_name) parts.push(t.new_client_name)
  if (t.new_post_name) parts.push(t.new_post_name)
  if (!parts.length && t.new_department_display) {
    parts.push(t.new_department_display)
    if (t.new_support_unit_display) parts.push(t.new_support_unit_display)
  }
  if (t.new_shift) parts.push(`turno ${t.new_shift}`)
  return parts.length ? parts.join(' · ') : '—'
}

async function fetchTransfers() {
  loading.value = true
  try {
    const data = await transferService.list({
      employee: props.employeeId,
      page_size: 100,
    })
    items.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

async function openModal() {
  Object.assign(form, {
    effective_date: '', new_department: '', new_support_unit: '',
    new_client: null, new_post: null, new_shift: '', reason: '',
  })
  showModal.value = true
  if (!clientOptions.value.length) {
    loadingRefs.value = true
    try {
      const [cli, pos] = await Promise.all([
        clientService.list({ page_size: 200 }),
        postService.list({ page_size: 200 }),
      ])
      clientOptions.value = (cli?.results ?? cli ?? []).map((c) => ({
        label: c.name, value: c.id,
      }))
      postOptions.value = (pos?.results ?? pos ?? []).map((p) => {
        const base = p.client_name ? `${p.name} — ${p.client_name}` : p.name
        const cap = p.max_guards != null
          ? ` (${p.current_guards}/${p.max_guards}${p.has_capacity ? '' : ' · cheio'})`
          : ''
        return { label: base + cap, value: p.id, disable: p.has_capacity === false }
      })
    } catch { /* ignore */ } finally {
      loadingRefs.value = false
    }
  }
}

async function submit() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    await transferService.create({ employee: props.employeeId, ...form })
    toast.success('Transferência registada — pendente de aprovação.')
    showModal.value = false
    await fetchTransfers()
  } catch (err) {
    toast.error('Não foi possível registar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    submitting.value = false
  }
}

function approve(t) {
  $q.dialog({
    title: 'Aprovar transferência',
    message: 'A nova lotação será aplicada ao colaborador. Continuar?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await transferService.approve(t.id)
      toast.success('Transferência aprovada.')
      await fetchTransfers()
      emit('changed')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

function reject(t) {
  $q.dialog({
    title: 'Rejeitar transferência',
    message: 'Rejeitar esta transferência?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await transferService.reject(t.id)
      toast.success('Transferência rejeitada.')
      await fetchTransfers()
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(fetchTransfers)
</script>

<style scoped>
.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--muted-foreground);
}
.transfer-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}
.transfer-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.transfer-card__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.transfer-card__head-body { flex: 1; min-width: 0; }
.transfer-card__title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--foreground);
}
.transfer-card__sub {
  font-size: 0.74rem;
  color: var(--muted-foreground);
}

.transfer-card__flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: stretch;
  padding: 12px;
  background: color-mix(in oklab, var(--muted) 30%, transparent);
  border-radius: 10px;
}
.transfer-side {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.transfer-side__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-foreground);
}
.transfer-side strong {
  font-size: 0.86rem;
  color: var(--foreground);
  font-weight: 600;
  word-break: break-word;
  line-height: 1.35;
}
.transfer-side--to strong { color: var(--primary); }
.transfer-card__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: var(--primary);
  font-weight: 700;
}

.transfer-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0 0;
}
.transfer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--foreground);
  line-height: 1.4;
}
.transfer-meta__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--muted-foreground);
  flex: none;
}
.transfer-meta__value {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

@media (max-width: 640px) {
  .transfer-card__flow {
    grid-template-columns: 1fr;
    text-align: left;
  }
  .transfer-card__arrow {
    transform: rotate(90deg);
    font-size: 1.2rem;
  }
}
</style>
