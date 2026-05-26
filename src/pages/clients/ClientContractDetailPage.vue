<!--
  /client-contracts/:id — detalhe de contrato comercial.
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Contrato · ${contract?.reference || '…'}`"
    :title="contract?.title || 'Contrato de cliente'"
    :description="contract?.client_name || ''"
    :breadcrumb="[
      { label: 'Contratos de clientes', to: { name: 'client-contracts-list' } },
      { label: contract?.reference || contract?.title || 'Detalhe' },
    ]"
    :back-to="{ name: 'client-contracts-list' }"
  >
    <template #meta>
      <span v-if="contract" class="admin-meta-chip admin-meta-chip--accent">
        <q-icon :name="statusIcon(contract.contract_status)" size="14px" />
        {{ contract.contract_status_display }}
      </span>
      <span v-if="contract" class="admin-meta-chip">
        <AppIcon name="ki-document" :size="13" />
        {{ contract.modality_display }}
      </span>
      <span
        v-if="contract?.is_expiring_soon && contract.contract_status === 'active'"
        class="admin-meta-chip admin-meta-chip--accent"
      >
        <q-icon name="schedule" size="13px" />
        Expira em {{ contract.days_to_expiry }} dia(s)
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar"
        :to="{ name: 'client-contracts-list' }"
      />
      <template v-if="contract">
        <q-btn
          outline no-caps class="admin-hero-button"
          icon="edit" label="Editar"
          :to="{ name: 'client-contracts-edit', params: { id: contract.id } }"
        />
        <q-btn
          v-if="contract.contract_status === 'draft'"
          unelevated no-caps class="admin-hero-primary"
          icon="check_circle" label="Activar"
          @click="showActivate = true"
        />
        <q-btn
          v-if="contract.contract_status === 'active'"
          outline no-caps class="admin-hero-button"
          icon="block" label="Terminar"
          @click="showTerminate = true"
        />
      </template>
    </template>

    <div v-if="!contract" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Identificação -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-profile-user" :size="16" /></span>
            <span class="detail-section__title">Identificação</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Cliente</span>
              <span class="field-row__value">
                <router-link
                  v-if="contract.client"
                  :to="{ name: 'clients-detail', params: { id: contract.client } }"
                  class="file-link"
                >
                  {{ contract.client_name }}
                </router-link>
                <span v-else>—</span>
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Modalidade</span>
              <span class="field-row__value">{{ contract.modality_display }}</span>
            </div>
            <div class="field-row field-row--wide">
              <span class="field-row__label">Título</span>
              <span class="field-row__value">{{ contract.title }}</span>
            </div>
          </div>
        </section>

        <!-- Período -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-calendar-tick" :size="16" /></span>
            <span class="detail-section__title">Período</span>
          </header>
          <div class="detail-section__body">
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
              <span class="field-row__label">Data assinatura</span>
              <span class="field-row__value">
                {{ contract.signed_date ? formatDate(contract.signed_date) : '—' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Dias até expirar</span>
              <span class="field-row__value">
                {{ contract.days_to_expiry !== null && contract.days_to_expiry !== undefined
                  ? `${contract.days_to_expiry} dia(s)` : '—' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Renovação automática</span>
              <span class="field-row__value">
                {{ contract.auto_renew ? `Sim — ${contract.auto_renew_months || 12} meses` : 'Não' }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Aviso prévio</span>
              <span class="field-row__value">
                {{ contract.notice_period_days != null ? `${contract.notice_period_days} dias` : '—' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Valores -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-dollar" :size="16" /></span>
            <span class="detail-section__title">Valores</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Valor mensal</span>
              <span class="field-row__value text-mono font-semibold">
                {{ formatAmount(contract.monthly_value, contract.currency) }}
              </span>
            </div>
            <div class="field-row">
              <span class="field-row__label">Moeda</span>
              <span class="field-row__value">{{ contract.currency || 'MZN' }}</span>
            </div>
            <div class="field-row field-row--wide">
              <span class="field-row__label">Prazo de pagamento</span>
              <span class="field-row__value">
                {{ contract.payment_terms_days != null ? `${contract.payment_terms_days} dias` : '—' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Anexos -->
        <section class="detail-section">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
            <span class="detail-section__title">Anexos</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <div class="flex flex-col gap-2">
              <a
                v-if="contract.signed_file"
                :href="absoluteFileUrl(contract.signed_file)"
                target="_blank" rel="noopener"
                class="file-link"
              >
                <AppIcon name="ki-document" :size="14" /> Contrato assinado
              </a>
              <span v-else class="text-sm text-muted-foreground">Sem contrato assinado anexado.</span>

              <a
                v-if="contract.proposal_file"
                :href="absoluteFileUrl(contract.proposal_file)"
                target="_blank" rel="noopener"
                class="file-link"
              >
                <AppIcon name="ki-document" :size="14" /> Proposta comercial
              </a>
              <span v-else class="text-sm text-muted-foreground">Sem proposta anexada.</span>
            </div>
          </div>
        </section>

        <!-- Postos cobertos -->
        <section class="detail-section lg:col-span-2">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-geolocation" :size="16" /></span>
            <span class="detail-section__title">Postos cobertos</span>
            <span class="posts-count">{{ contract.posts_data?.length || 0 }}</span>
            <q-btn
              class="ms-auto" outline no-caps size="sm" color="primary" icon="add"
              label="Adicionar posto"
              :to="{ name: 'posts-new', query: { client: contract.client, return_to_contract: contract.id } }"
            />
          </header>
          <div class="detail-section__body detail-section__body--single">
            <div v-if="!contract.posts_data?.length" class="text-sm text-muted-foreground">
              Este contrato ainda não tem postos associados.
              <router-link
                :to="{ name: 'client-contracts-edit', params: { id: contract.id } }"
                class="text-primary font-semibold"
              >
                Editar contrato →
              </router-link>
            </div>
            <div v-else class="flex flex-col gap-2">
              <router-link
                v-for="p in contract.posts_data" :key="p.id"
                :to="{ name: 'posts-detail', params: { id: p.id } }"
                class="post-row"
              >
                <span class="post-row__icon"><AppIcon name="ki-geolocation" :size="16" /></span>
                <span class="text-sm font-semibold text-mono">{{ p.name }}</span>
              </router-link>
            </div>
          </div>
        </section>

        <!-- Cessação -->
        <section v-if="contract.terminated_date" class="detail-section lg:col-span-2 termination-section">
          <header class="detail-section__head">
            <span class="detail-section__icon detail-section__icon--danger">
              <AppIcon name="ki-exit-right" :size="16" />
            </span>
            <span class="detail-section__title">Cessação</span>
          </header>
          <div class="detail-section__body">
            <div class="field-row">
              <span class="field-row__label">Data</span>
              <span class="field-row__value">{{ formatDate(contract.terminated_date) }}</span>
            </div>
            <div v-if="contract.termination_reason" class="field-row field-row--wide">
              <span class="field-row__label">Motivo</span>
              <span class="field-row__value whitespace-pre-line">{{ contract.termination_reason }}</span>
            </div>
          </div>
        </section>

        <!-- Notas -->
        <section v-if="contract.notes" class="detail-section lg:col-span-2">
          <header class="detail-section__head">
            <span class="detail-section__icon"><AppIcon name="ki-document" :size="16" /></span>
            <span class="detail-section__title">Notas</span>
          </header>
          <div class="detail-section__body detail-section__body--single">
            <p class="text-sm whitespace-pre-line">{{ contract.notes }}</p>
          </div>
        </section>
      </div>

      <!-- Diálogo: activar -->
      <AppModal v-model="showActivate" size="sm" persistent>
        <div class="p-5">
          <AppHeading :level="3" class="text-base font-semibold text-mono mb-2">
            Activar contrato
          </AppHeading>
          <p class="text-xs text-muted-foreground mb-4">
            Marca o contrato como assinado e activo.
          </p>
          <q-form ref="activateFormRef" greedy class="flex flex-col gap-3" @submit="submitActivate">
            <q-input
              v-model="activateForm.signed_date" label="Data de assinatura"
              type="date" outlined dense stack-label
            />
            <div class="flex justify-end gap-2 pt-2">
              <q-btn flat no-caps label="Cancelar" @click="showActivate = false" />
              <q-btn unelevated no-caps color="primary" type="submit" label="Activar" :loading="submitting" />
            </div>
          </q-form>
        </div>
      </AppModal>

      <!-- Diálogo: terminar -->
      <AppModal v-model="showTerminate" size="md" persistent>
        <div class="p-5">
          <AppHeading :level="3" class="text-base font-semibold text-mono mb-2">
            Terminar contrato
          </AppHeading>
          <p class="text-xs text-muted-foreground mb-4">
            Marca o contrato como terminado. Indique a data e (opcional) o motivo.
          </p>
          <q-form ref="terminateFormRef" greedy class="flex flex-col gap-3" @submit="submitTerminate">
            <q-input
              v-model="terminateForm.terminated_date" label="Data de cessação *"
              type="date" outlined dense stack-label :rules="[req]"
            />
            <q-input
              v-model="terminateForm.termination_reason" label="Motivo (opcional)"
              type="textarea" outlined dense autogrow
            />
            <div class="flex justify-end gap-2 pt-2">
              <q-btn flat no-caps label="Cancelar" @click="showTerminate = false" />
              <q-btn unelevated no-caps color="negative" type="submit" label="Terminar" :loading="submitting" />
            </div>
          </q-form>
        </div>
      </AppModal>

      <AuditTrail v-if="contract" :entity="contract" title="Histórico do contrato" />
    </template>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientContractService } from 'src/services/client-contract.service'
import { useToast } from 'src/composables/useToast'
import { absoluteFileUrl } from 'src/utils/file-url'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AuditTrail from 'src/components/ui/AuditTrail.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const contract = ref(null)
const submitting = ref(false)
const showActivate = ref(false)
const showTerminate = ref(false)
const activateFormRef = ref(null)
const terminateFormRef = ref(null)

const activateForm = reactive({ signed_date: '' })
const terminateForm = reactive({ terminated_date: '', termination_reason: '' })

function statusIcon(status) {
  return {
    draft: 'edit_note',
    active: 'check_circle',
    expired: 'schedule',
    terminated: 'block',
  }[status] || 'info'
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

async function load() {
  contract.value = await clientContractService.get(route.params.id)
}

async function submitActivate() {
  submitting.value = true
  try {
    contract.value = await clientContractService.activate(contract.value.id, {
      signed_date: activateForm.signed_date,
    })
    toast.success('Contrato activado.')
    showActivate.value = false
  } catch (err) {
    toast.error('Não foi possível activar.', { caption: err?.response?.data?.detail })
  } finally {
    submitting.value = false
  }
}

async function submitTerminate() {
  const ok = await terminateFormRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    contract.value = await clientContractService.terminate(contract.value.id, {
      terminated_date: terminateForm.terminated_date,
      termination_reason: terminateForm.termination_reason,
    })
    toast.success('Contrato terminado.')
    showTerminate.value = false
  } catch (err) {
    toast.error('Não foi possível terminar.', { caption: err?.response?.data?.detail })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  activateForm.signed_date = new Date().toISOString().slice(0, 10)
  terminateForm.terminated_date = new Date().toISOString().slice(0, 10)
  try {
    await load()
  } catch {
    toast.error('Contrato não encontrado.')
    router.push({ name: 'client-contracts-list' })
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
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 9px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

@media (max-width: 640px) {
  .detail-section__body { grid-template-columns: 1fr; }
}
</style>
