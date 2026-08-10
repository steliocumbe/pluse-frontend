<!--
  Diálogo de confirmação e activação de posto.
  Carrega automaticamente os contratos do cliente associados a este posto
  e permite activar um contrato em rascunho em simultâneo.
-->
<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="activate-dialog">
      <!-- ── Cabeçalho ─────────────────────────────────────────── -->
      <div class="activate-dialog__header">
        <div class="activate-dialog__header-icon">
          <q-icon name="check_circle" size="22px" />
        </div>
        <div>
          <div class="activate-dialog__title">Activar posto</div>
          <div class="activate-dialog__subtitle">{{ post.name }}</div>
        </div>
      </div>

      <q-separator />

      <q-card-section class="activate-dialog__body">

        <!-- ── Requisitos ────────────────────────────────────────── -->
        <div class="req-section">
          <div class="req-section__label">Requisitos de activação</div>
          <div class="req-row" :class="clientApproved ? 'req-row--ok' : 'req-row--fail'">
            <q-icon :name="clientApproved ? 'check_circle' : 'cancel'" size="18px" />
            <div>
              <div class="req-row__text">Cliente aprovado pela direcção</div>
              <div v-if="!clientApproved" class="req-row__hint">
                O cliente ainda não foi aprovado — complete o processo de admissão do cliente antes de activar este posto.
              </div>
            </div>
          </div>
          <div class="req-row" :class="hasOpeningForm ? 'req-row--ok' : 'req-row--fail'">
            <q-icon :name="hasOpeningForm ? 'check_circle' : 'cancel'" size="18px" />
            <div>
              <div class="req-row__text">Formulário de abertura anexado</div>
              <div v-if="!hasOpeningForm" class="req-row__hint">
                Edite o posto e anexe o formulário de abertura assinado.
              </div>
            </div>
          </div>
        </div>

        <!-- ── Contratos deste posto ─────────────────────────────── -->
        <div class="contract-section">
          <div class="contract-section__label">
            Contratos comerciais deste posto
            <q-spinner v-if="loadingContracts" size="13px" class="q-ml-xs" />
          </div>

          <div v-if="!loadingContracts && !contracts.length" class="contract-empty">
            <q-icon name="info" size="15px" class="q-mr-xs" />
            Nenhum contrato encontrado para este posto.
            <a
              :href="`/client-contracts/new?client=${post.client}`"
              target="_blank"
              class="contract-empty__link"
            >Criar contrato</a>
          </div>

          <div v-else class="contract-list">
            <label
              v-for="c in contracts"
              :key="c.id"
              class="contract-item"
              :class="{
                'contract-item--selectable': c.contract_status === 'draft',
                'contract-item--selected': selectedContractId === c.id,
                'contract-item--active': c.contract_status === 'active',
              }"
            >
              <input
                v-if="c.contract_status === 'draft'"
                type="radio"
                :value="c.id"
                v-model="selectedContractId"
                class="sr-only"
              />
              <div class="contract-item__icon">
                <q-icon name="description" size="16px" />
              </div>
              <div class="contract-item__body">
                <div class="contract-item__ref">{{ c.reference }}</div>
                <div class="contract-item__title">{{ c.title }}</div>
                <div class="contract-item__meta">
                  {{ c.modality_display }} ·
                  {{ formatDate(c.start_date) }}
                  {{ c.end_date ? '→ ' + formatDate(c.end_date) : '' }}
                </div>
              </div>
              <div class="contract-item__right">
                <span
                  class="contract-item__badge"
                  :class="`contract-item__badge--${c.contract_status}`"
                >
                  {{ c.contract_status === 'draft' ? 'Rascunho' :
                     c.contract_status === 'active' ? 'Activo' :
                     c.contract_status_display }}
                </span>
                <span
                  v-if="c.contract_status === 'draft' && selectedContractId === c.id"
                  class="contract-item__will-activate"
                >
                  <q-icon name="bolt" size="12px" /> será activado
                </span>
                <span
                  v-else-if="c.contract_status === 'draft'"
                  class="contract-item__select-hint"
                >
                  clique para seleccionar
                </span>
              </div>
            </label>
          </div>

          <div v-if="selectedContractId" class="contract-note">
            <q-icon name="info" size="13px" class="q-mr-xs" />
            O contrato seleccionado será marcado como <strong>Activo</strong> ao mesmo tempo que o posto.
          </div>
        </div>

      </q-card-section>

      <q-separator />

      <!-- ── Acções ─────────────────────────────────────────────── -->
      <q-card-actions class="activate-dialog__actions">
        <q-btn
          flat no-caps
          label="Cancelar"
          @click="onDialogCancel"
          :disable="activating"
        />
        <q-btn
          unelevated no-caps
          color="positive"
          icon="check_circle"
          :label="activating ? 'A activar…' : 'Activar posto'"
          :loading="activating"
          :disable="!canActivate"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { clientContractService } from 'src/services/client-contract.service'
import { postService } from 'src/services/post.service'
import { useToast } from 'src/composables/useToast'

const props = defineProps({
  post: { type: Object, required: true },
})

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const toast = useToast()
const contracts = ref([])
const loadingContracts = ref(true)
const selectedContractId = ref(null)
const activating = ref(false)

const clientApproved = computed(() => !!props.post.client_is_operational)
const hasOpeningForm = computed(() => !!props.post.opening_form_file)
const canActivate = computed(() => clientApproved.value && hasOpeningForm.value)

function formatDate(s) {
  if (!s) return ''
  try { return new Date(s).toLocaleDateString('pt-PT') } catch { return s }
}

async function loadContracts() {
  loadingContracts.value = true
  try {
    // Filtra directamente pelo post via query param (backend suporta ?posts=<id>)
    const data = await clientContractService.list({
      posts: props.post.id,
      page_size: 50,
    })
    contracts.value = (data?.results ?? data ?? []).filter(
      (c) => c.contract_status !== 'expired' && c.contract_status !== 'terminated',
    )
    // Pré-selecciona o único rascunho, se existir
    const drafts = contracts.value.filter((c) => c.contract_status === 'draft')
    if (drafts.length === 1) selectedContractId.value = drafts[0].id
  } catch {
    /* silencioso — o utilizador pode activar sem contrato */
  } finally {
    loadingContracts.value = false
  }
}

async function confirm() {
  activating.value = true
  try {
    const updated = await postService.activate(props.post.id)
    if (selectedContractId.value) {
      await clientContractService.activate(selectedContractId.value)
    }
    onDialogOK(updated)
  } catch (err) {
    toast.error('Não foi possível activar o posto.', {
      caption: err?.response?.data?.detail,
    })
  } finally {
    activating.value = false
  }
}

onMounted(loadContracts)
</script>

<style scoped>
.activate-dialog {
  width: 520px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────────────── */
.activate-dialog__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px 18px;
}
.activate-dialog__header-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: color-mix(in oklab, var(--q-positive) 14%, transparent);
  color: var(--q-positive);
  flex-shrink: 0;
}
.activate-dialog__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground, #111);
}
.activate-dialog__subtitle {
  font-size: 0.82rem;
  color: var(--muted-foreground, #888);
  margin-top: 2px;
}

/* ── Body ───────────────────────────────────────────────────── */
.activate-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 22px;
}

/* ── Requisitos ─────────────────────────────────────────────── */
.req-section__label,
.contract-section__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted-foreground, #888);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.req-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.req-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid;
}
.req-row--ok {
  background: color-mix(in oklab, var(--q-positive, #21ba45) 8%, transparent);
  border-color: color-mix(in oklab, var(--q-positive, #21ba45) 25%, transparent);
  color: color-mix(in oklab, var(--q-positive, #21ba45) 80%, #000);
}
.req-row--fail {
  background: color-mix(in oklab, var(--q-negative, #c10015) 8%, transparent);
  border-color: color-mix(in oklab, var(--q-negative, #c10015) 25%, transparent);
  color: color-mix(in oklab, var(--q-negative, #c10015) 80%, #000);
}
.req-row__text {
  font-size: 0.87rem;
  font-weight: 600;
}
.req-row__hint {
  font-size: 0.78rem;
  opacity: 0.75;
  margin-top: 2px;
}

/* ── Contratos ──────────────────────────────────────────────── */
.contract-section {
  display: flex;
  flex-direction: column;
}
.contract-empty {
  font-size: 0.83rem;
  color: var(--muted-foreground, #888);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 0;
}
.contract-empty__link {
  color: var(--q-primary);
  font-weight: 600;
  margin-left: 4px;
  text-decoration: none;
}
.contract-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.contract-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border, #e2e8f0);
  background: var(--card, #fff);
  cursor: default;
  transition: border-color 0.15s, background 0.15s;
}
.contract-item--selectable {
  cursor: pointer;
}
.contract-item--selectable:hover {
  border-color: var(--q-primary);
  background: color-mix(in oklab, var(--q-primary) 5%, transparent);
}
.contract-item--selected {
  border-color: var(--q-positive, #21ba45) !important;
  background: color-mix(in oklab, var(--q-positive, #21ba45) 8%, transparent) !important;
}
.contract-item--active {
  opacity: 0.6;
}
.contract-item__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--q-primary) 10%, transparent);
  color: var(--q-primary);
  flex-shrink: 0;
}
.contract-item__body {
  flex: 1;
  min-width: 0;
}
.contract-item__ref {
  font-size: 0.78rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--muted-foreground, #888);
}
.contract-item__title {
  font-size: 0.87rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.contract-item__meta {
  font-size: 0.75rem;
  color: var(--muted-foreground, #888);
  margin-top: 2px;
}
.contract-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.contract-item__badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.contract-item__badge--draft {
  background: color-mix(in oklab, #f59e0b 15%, transparent);
  color: #92400e;
}
.contract-item__badge--active {
  background: color-mix(in oklab, var(--q-positive, #21ba45) 15%, transparent);
  color: color-mix(in oklab, var(--q-positive, #21ba45) 70%, #000);
}
.contract-item__will-activate {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--q-positive, #21ba45);
  display: flex;
  align-items: center;
  gap: 2px;
}
.contract-item__select-hint {
  font-size: 0.68rem;
  color: var(--muted-foreground, #888);
}
.contract-note {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  color: var(--muted-foreground, #888);
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--q-info, #31ccec) 10%, transparent);
}

/* ── Acções ─────────────────────────────────────────────────── */
.activate-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
}
</style>
