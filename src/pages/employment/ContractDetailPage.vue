<!--
  /employment-contracts/:id — work contract detail.
  Shows the contract, the approval workflow (Diretor Financeiro), and the
  termination flow (register / view a cessação).
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Contratos · ${contract?.reference || '…'}`"
    :title="contract?.job_title || 'Contrato de trabalho'"
    :description="contract?.employee_name || ''"
  >
    <template #meta>
      <span v-if="contract" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="statusIcon(contract.status)" size="14px" />
        {{ contract.status_display }}
      </span>
      <span v-if="contract" class="admin-meta-chip">
        <AppIcon name="ki-document" :size="13" />
        {{ contract.contract_type_display }}
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar"
        :to="{ name: 'employment-contracts-list' }"
      />
      <template v-if="contract">
        <q-btn
          v-if="contract.status === 'pending' && canApprove"
          unelevated no-caps class="admin-hero-primary"
          icon="check_circle" label="Aprovar"
          @click="approve"
        />
        <q-btn
          v-if="contract.status === 'pending' && canApprove"
          outline no-caps class="admin-hero-button"
          icon="cancel" label="Rejeitar"
          @click="reject"
        />
        <q-btn
          v-if="contract.status !== 'pending'"
          outline no-caps class="admin-hero-button"
          icon="edit" label="Editar"
          :to="{ name: 'employment-contracts-edit', params: { id: contract.id } }"
        />
        <q-btn
          v-if="contract.status === 'active' && !termination"
          unelevated no-caps class="admin-hero-primary"
          icon="logout" label="Registar cessação"
          @click="showTermination = true"
        />
      </template>
    </template>

    <div v-if="!contract" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Vigência -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-calendar-tick" :size="16" /></span>
            <span class="detail-section__title">Vigência</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Tipo</span>
              <span class="field-row__value">{{ contract.contract_type_display }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Início</span>
              <span class="field-row__value">{{ formatDate(contract.start_date) }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Fim</span>
              <span class="field-row__value">
                {{ contract.end_date ? formatDate(contract.end_date) : 'Sem termo' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Fim do probatório</span>
              <span class="field-row__value">
                {{ contract.probation_end_date ? formatDate(contract.probation_end_date) : '—' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Horas semanais</span>
              <span class="field-row__value">
                {{ contract.weekly_hours ? `${contract.weekly_hours}h` : '—' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Situação</span>
              <span class="field-row__value">
                {{ contract.is_current ? 'Em vigor' : 'Fora de vigor' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Função e remuneração -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-dollar" :size="16" /></span>
            <span class="detail-section__title">Função e remuneração</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Cargo</span>
              <span class="field-row__value">{{ contract.job_title }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Local de trabalho</span>
              <span class="field-row__value">{{ contract.workplace || '—' }}</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Salário do contrato</span>
              <span class="field-row__value">{{ contract.base_salary }} MZN</span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Categoria salarial</span>
              <span class="field-row__value">{{ contract.salary_category_label || '—' }}</span>
            </div>
          </div>
        </section>

        <!-- Documento / notas -->
        <section class="detail-section lg:col-span-2">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
            <span class="detail-section__title">Documento e notas</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <a
              v-if="contract.file"
              :href="absoluteFileUrl(contract.file)"
              target="_blank" rel="noopener"
              class="file-link"
            >
              <AppIcon name="ki-document" :size="16" /> Abrir contrato assinado
            </a>
            <span v-else class="text-sm text-muted-foreground">Sem documento anexado.</span>
            <p v-if="contract.notes" class="text-sm whitespace-pre-line mt-2">{{ contract.notes }}</p>
          </div>
        </section>
      </div>

      <!-- Cessação registada -->
      <section v-if="termination" class="detail-section termination-section">
        <header class="detail-section__head">
          <span class="detail-section__icon detail-section__icon--danger">
            <AppIcon name="ki-exit-right" :size="16" />
          </span>
          <span class="detail-section__title">Cessação de contrato</span>
          <AppBadge :variant="statusVariant(termination.status)" class="ms-auto">
            {{ termination.status_display }}
          </AppBadge>
        </header>
        <div class="detail-section__body">
          <div class="field-row">
            <span class="field-row__label">Motivo</span>
            <span class="field-row__value">{{ termination.reason_display }}</span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Data de cessação</span>
            <span class="field-row__value">{{ formatDate(termination.termination_date) }}</span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Último dia de trabalho</span>
            <span class="field-row__value">
              {{ termination.last_working_day ? formatDate(termination.last_working_day) : '—' }}
            </span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Aviso prévio</span>
            <span class="field-row__value">
              {{ termination.notice_given ? 'Dado' : 'Não dado' }}
            </span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Acerto de contas</span>
            <span class="field-row__value">
              {{ termination.final_settlement_amount
                ? `${termination.final_settlement_amount} MZN` : '—' }}
            </span>
          </div>
        </div>
        <div
          v-if="termination.status === 'pending' && canApprove"
          class="flex justify-end gap-2 px-4 pb-4"
        >
          <q-btn outline no-caps color="negative" label="Rejeitar cessação"
                 @click="rejectTermination" />
          <q-btn unelevated no-caps color="primary" label="Aprovar cessação"
                 @click="approveTermination" />
        </div>
      </section>
    </template>

    <!-- Termination modal -->
    <AppModal v-model="showTermination" size="lg" persistent>
      <div class="p-5">
        <AppHeading :level="3" class="text-base font-semibold text-mono mb-1">
          Registar cessação de contrato
        </AppHeading>
        <p class="text-xs text-muted-foreground mb-4">
          Fica pendente até aprovação do Diretor Financeiro. A aprovação inactiva
          o contrato e o colaborador.
        </p>
        <q-form ref="termFormRef" greedy class="flex flex-col gap-4" @submit="submitTermination">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select
              v-model="termForm.reason" :options="terminationReasonOptions"
              label="Motivo *" outlined dense emit-value map-options :rules="[req]"
              class="md:col-span-2"
            />
            <q-input
              v-model="termForm.termination_date" label="Data de cessação *"
              type="date" outlined dense stack-label :rules="[req]"
            />
            <q-input
              v-model="termForm.last_working_day" label="Último dia de trabalho"
              type="date" outlined dense stack-label
            />
            <q-input
              v-model="termForm.final_settlement_amount" label="Acerto de contas (MZN)"
              type="number" outlined dense step="0.01"
            />
            <q-input
              v-model="termForm.notice_date" label="Data do aviso prévio"
              type="date" outlined dense stack-label
            />
          </div>
          <q-checkbox v-model="termForm.notice_given" label="Aviso prévio foi dado" />
          <q-file
            v-model="termForm.file" label="Documento de rescisão (PDF)"
            outlined dense clearable max-file-size="10485760"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <template #prepend><q-icon name="attach_file" /></template>
          </q-file>
          <q-input v-model="termForm.notes" label="Notas" type="textarea" outlined dense autogrow />
          <div class="flex justify-end gap-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting"
                   @click="showTermination = false" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   label="Registar cessação" :loading="submitting" />
          </div>
        </q-form>
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { contractService, terminationService } from 'src/services/employment.service'
import { terminationReasonOptions } from 'src/config/employment'
import { useAuthStore } from 'src/stores/auth'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppModal from 'src/components/ui/AppModal.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const toast = useToast()

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const contract = ref(null)
const termination = ref(null)
const submitting = ref(false)
const showTermination = ref(false)
const termFormRef = ref(null)

const canApprove = computed(
  () => auth.user?.is_superuser || auth.hasAnyGroup('Diretor Financeiro', 'Administrador'),
)

const termForm = reactive({
  reason: '',
  termination_date: '',
  last_working_day: '',
  notice_given: false,
  notice_date: '',
  final_settlement_amount: '',
  file: null,
  notes: '',
})

function statusIcon(status) {
  return { active: 'check_circle', pending: 'schedule', inactive: 'block' }[status] || 'info'
}
function statusVariant(status) {
  return { active: 'success', pending: 'warning', inactive: 'neutral' }[status] || 'neutral'
}
function formatDate(s) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function load() {
  contract.value = await contractService.get(route.params.id)
  try {
    const data = await terminationService.list({ contract: route.params.id })
    const rows = data?.results ?? data ?? []
    termination.value = rows[0] || null
  } catch { /* ignore */ }
}

async function approve() {
  $q.dialog({
    title: 'Aprovar contrato',
    message: `Aprovar o contrato <b>${contract.value.reference}</b>?`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      contract.value = await contractService.approve(contract.value.id)
      toast.success('Contrato aprovado.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function reject() {
  $q.dialog({
    title: 'Rejeitar contrato',
    message: 'Motivo da rejeição (opcional):',
    prompt: { model: '', type: 'textarea', isValid: () => true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Rejeitar', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async (reason) => {
    try {
      contract.value = await contractService.reject(contract.value.id, reason || '')
      toast.success('Contrato rejeitado.')
    } catch (err) {
      toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function submitTermination() {
  const ok = await termFormRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { contract: contract.value.id, ...termForm }
    if (!(payload.file instanceof File)) delete payload.file
    termination.value = await terminationService.create(payload)
    toast.success('Cessação registada — pendente de aprovação.')
    showTermination.value = false
  } catch (err) {
    toast.error('Não foi possível registar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
  } finally {
    submitting.value = false
  }
}

async function approveTermination() {
  $q.dialog({
    title: 'Aprovar cessação',
    message: 'Aprovar esta cessação? O contrato e o colaborador serão inactivados.',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      termination.value = await terminationService.approve(termination.value.id)
      await load()
      toast.success('Cessação aprovada.')
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

async function rejectTermination() {
  try {
    termination.value = await terminationService.reject(termination.value.id)
    toast.success('Cessação rejeitada.')
  } catch (err) {
    toast.error('Não foi possível rejeitar.', { caption: err?.response?.data?.detail })
  }
}

onMounted(async () => {
  try {
    await load()
  } catch {
    toast.error('Contrato não encontrado.')
    router.push({ name: 'employment-contracts-list' })
  }
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
.detail-section {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.termination-section {
  margin-top: 20px;
  border-color: color-mix(in oklab, var(--destructive) 30%, var(--border));
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
.detail-section__icon--danger {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
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
.detail-section__body--single {
  grid-template-columns: 1fr;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
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
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.file-link:hover { text-decoration: underline; }
</style>
