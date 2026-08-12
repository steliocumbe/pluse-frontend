<!--
  /clients/wizard — Assistente de novo cliente.

  Stepper em 3 passos: Cliente (obrigatório) → Contrato (opcional) → Postos (opcional).
  Cada passo cria a sua entidade no backend. O utilizador pode saltar passos a qualquer momento.
  Após criar o cliente, sair do wizard leva ao detalhe do cliente (não destrói o que foi criado).
-->
<template>
  <AdminPageTemplate
    eyebrow="Novo cliente · Assistido"
    title="Assistente de novo cliente"
    description="Crie um cliente, opcionalmente o primeiro contrato comercial e os primeiros postos — tudo num único fluxo guiado."
    :breadcrumb="[
      { label: 'Clientes', to: { name: 'clients-list' } },
      { label: 'Novo (assistido)' },
    ]"
    :back-to="{ name: 'clients-list' }"
  >
    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        :icon="createdClient ? 'visibility' : 'arrow_back'"
        :label="createdClient ? 'Sair (manter o cliente)' : 'Cancelar'"
        @click="onLeave"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <q-stepper
          v-model="step"
          color="primary"
          animated
          flat
          header-nav
          :vertical="$q.screen.lt.md"
          class="wizard-stepper"
        >
          <!-- ─────────────────────────────  Passo 1 · Cliente ───────────────────────────── -->
          <q-step
            :name="1"
            title="Cliente"
            icon="person_add"
            :done="!!createdClient"
            :header-nav="false"
          >
            <q-form ref="clientFormRef" greedy class="flex flex-col gap-5" @submit.prevent="onCreateClient">
              <div v-if="clientGlobalErrors.length"
                class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <p v-for="(e, i) in clientGlobalErrors" :key="i" class="m-0">{{ e }}</p>
              </div>

              <p class="text-sm text-muted-foreground m-0">
                Identificação mínima para registar o cliente em <strong>Prospeção</strong>.
                Detalhes (análise de risco, anexos, contactos extra) podem ser preenchidos depois no detalhe.
              </p>

              <div class="form-group-label">Identificação</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <q-input
                  v-model="clientForm.name" label="Nome *" outlined dense :rules="[req]"
                  class="md:col-span-2"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.name"
                  :error-message="clientFieldErrors.name"
                  @update:model-value="() => clientErr.clearField('name')"
                />
                <q-input
                  v-model="clientForm.short_name" label="Nome curto" outlined dense
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.short_name"
                  :error-message="clientFieldErrors.short_name"
                  @update:model-value="() => clientErr.clearField('short_name')"
                />
                <q-select
                  v-model="clientForm.client_type" :options="clientTypeOptions"
                  label="Tipo de cliente *" outlined dense emit-value map-options :rules="[req]"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.client_type"
                  :error-message="clientFieldErrors.client_type"
                  @update:model-value="() => clientErr.clearField('client_type')"
                />
                <q-input
                  v-model="clientForm.nuit" label="NUIT" outlined dense hint="9 dígitos (opcional)"
                  :rules="[nuit()]"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.nuit"
                  :error-message="clientFieldErrors.nuit"
                  @update:model-value="() => clientErr.clearField('nuit')"
                />
                <q-input
                  v-model="clientForm.contact_email" label="Email de contacto" type="email" outlined dense
                  :rules="[email()]"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.contact_email"
                  :error-message="clientFieldErrors.contact_email"
                  @update:model-value="() => clientErr.clearField('contact_email')"
                />
                <q-input
                  v-model="clientForm.contact_phone" label="Telefone de contacto" outlined dense
                  inputmode="tel" hint="9 dígitos, com ou sem +258"
                  :rules="[mozambicanPhone()]"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.contact_phone"
                  :error-message="clientFieldErrors.contact_phone"
                  @update:model-value="() => clientErr.clearField('contact_phone')"
                />
                <q-input
                  v-model="clientForm.address" label="Morada" type="textarea" outlined dense autogrow
                  class="md:col-span-2"
                  :disable="!!createdClient"
                  :error="!!clientFieldErrors.address"
                  :error-message="clientFieldErrors.address"
                  @update:model-value="() => clientErr.clearField('address')"
                />
              </div>

              <div class="form-group-label">Documentação do cliente</div>
              <ClientDocumentSlots
                v-model="clientDocuments"
                :disabled="!!createdClient"
              />

              <div v-if="createdClient" class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <q-icon name="check_circle" class="q-mr-xs" />
                Cliente <strong>{{ createdClient.name }}</strong> criado com sucesso.
              </div>

              <q-stepper-navigation>
                <div class="flex flex-wrap gap-2 justify-end">
                  <q-btn
                    v-if="createdClient"
                    flat no-caps label="Saltar contrato e postos"
                    @click="goToClientDetail"
                  />
                  <q-btn
                    v-if="!createdClient"
                    unelevated no-caps color="primary"
                    type="submit"
                    icon-right="arrow_forward"
                    label="Criar cliente e continuar"
                    :loading="submittingClient"
                  />
                  <q-btn
                    v-else
                    unelevated no-caps color="primary"
                    icon-right="arrow_forward"
                    label="Continuar para contrato"
                    @click="step = 2"
                  />
                </div>
              </q-stepper-navigation>
            </q-form>
          </q-step>

          <!-- ─────────────────────────────  Passo 2 · Contrato ───────────────────────────── -->
          <q-step
            :name="2"
            title="Contrato comercial"
            icon="description"
            :done="!!createdContract"
            :header-nav="!!createdClient"
          >
            <div v-if="createdClient" class="wizard-context">
              <q-icon name="check_circle" color="positive" />
              <span>Cliente: <strong>{{ createdClient.name }}</strong></span>
            </div>

            <q-form ref="contractFormRef" greedy class="flex flex-col gap-5" @submit.prevent="onCreateContract">
              <div v-if="contractGlobalErrors.length"
                class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <p v-for="(e, i) in contractGlobalErrors" :key="i" class="m-0">{{ e }}</p>
              </div>

              <p class="text-sm text-muted-foreground m-0">
                Crie já o primeiro contrato comercial. Pode saltar este passo se ainda não tiver o contrato fechado —
                cria-se depois em <em>Contratos de clientes</em>.
              </p>

              <div class="form-group-label">Identificação</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <q-input
                  v-model="contractForm.title" label="Título *" outlined dense
                  :rules="[req]"
                  class="md:col-span-2"
                  :disable="!!createdContract"
                  :error="!!contractFieldErrors.title"
                  :error-message="contractFieldErrors.title"
                  @update:model-value="() => contractErr.clearField('title')"
                />
                <q-select
                  v-model="contractForm.modality" :options="modalityOptions"
                  label="Modalidade *" outlined dense emit-value map-options :rules="[req]"
                  :disable="!!createdContract"
                  :error="!!contractFieldErrors.modality"
                  :error-message="contractFieldErrors.modality"
                  @update:model-value="() => contractErr.clearField('modality')"
                />
                <q-input
                  v-model="contractForm.monthly_value" label="Valor mensal (MZN) *"
                  type="number" outlined dense step="0.01"
                  :rules="[req, positiveNumber(), decimalAmount()]"
                  :disable="!!createdContract"
                  :error="!!contractFieldErrors.monthly_value"
                  :error-message="contractFieldErrors.monthly_value"
                  @update:model-value="() => contractErr.clearField('monthly_value')"
                />
              </div>

              <div class="form-group-label">Período</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <q-input
                  v-model="contractForm.start_date" label="Data de início *" type="date"
                  outlined dense stack-label :rules="[req]"
                  :disable="!!createdContract"
                  :error="!!contractFieldErrors.start_date"
                  :error-message="contractFieldErrors.start_date"
                  @update:model-value="() => contractErr.clearField('start_date')"
                />
                <q-input
                  v-model="contractForm.end_date" label="Data de fim" type="date"
                  outlined dense stack-label clearable
                  :rules="[dateAfter(contractForm.start_date)]"
                  :disable="!!createdContract"
                  :error="!!contractFieldErrors.end_date"
                  :error-message="contractFieldErrors.end_date"
                  @update:model-value="() => contractErr.clearField('end_date')"
                />
              </div>

              <div v-if="createdContract" class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <q-icon name="check_circle" class="q-mr-xs" />
                Contrato <strong>{{ createdContract.reference || createdContract.title }}</strong> criado.
              </div>

              <q-stepper-navigation>
                <div class="flex flex-wrap gap-2 justify-between">
                  <q-btn
                    flat no-caps icon="arrow_back" label="Voltar"
                    @click="step = 1"
                  />
                  <div class="flex flex-wrap gap-2">
                    <q-btn
                      v-if="!createdContract"
                      flat no-caps label="Saltar (criar só cliente)"
                      @click="step = 3"
                    />
                    <q-btn
                      v-if="!createdContract"
                      unelevated no-caps color="primary"
                      type="submit"
                      icon-right="arrow_forward"
                      label="Criar contrato e continuar"
                      :loading="submittingContract"
                      @click="onCreateContract"
                    />
                    <q-btn
                      v-else
                      unelevated no-caps color="primary"
                      icon-right="arrow_forward"
                      label="Continuar para postos"
                      @click="step = 3"
                    />
                  </div>
                </div>
              </q-stepper-navigation>
            </q-form>
          </q-step>

          <!-- ─────────────────────────────  Passo 3 · Postos ───────────────────────────── -->
          <q-step
            :name="3"
            title="Postos"
            icon="add_location_alt"
            :done="postsAllCreated"
            :header-nav="!!createdClient"
          >
            <div class="wizard-context">
              <q-icon name="check_circle" color="positive" />
              <span>
                Cliente: <strong>{{ createdClient?.name }}</strong>
                <template v-if="createdContract">
                  · Contrato: <strong>{{ createdContract.reference || createdContract.title }}</strong>
                </template>
              </span>
            </div>

            <p class="text-sm text-muted-foreground m-0">
              Pode registar os primeiros postos do cliente. Os já criados ficam marcados a verde e
              não são reenviados se houver falhas.
            </p>

            <div v-if="postsGlobalError"
              class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {{ postsGlobalError }}
            </div>

            <div class="flex flex-col gap-3 mt-3">
              <div
                v-for="(p, i) in postsForm" :key="i"
                class="post-row"
                :class="{ 'post-row--done': p._createdId }"
              >
                <div class="post-row-header">
                  <span class="post-row-title">
                    <q-icon v-if="p._createdId" name="check_circle" color="positive" class="q-mr-xs" />
                    Posto #{{ i + 1 }}
                    <span v-if="p._createdId" class="text-xs text-muted-foreground">
                      (criado · ID {{ p._createdId }})
                    </span>
                  </span>
                  <q-btn
                    flat dense round icon="close" size="sm"
                    :disable="!!p._createdId || creatingPosts"
                    @click="removePost(i)"
                  />
                </div>

                <div v-if="p._error" class="text-xs text-rose-700 q-mb-sm">
                  {{ p._error }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <q-input
                    v-model="p.name" label="Nome do posto *" outlined dense
                    :rules="[req]"
                    :disable="!!p._createdId || creatingPosts"
                  />
                  <q-select
                    v-model="p.service_type" :options="serviceTypeOptions"
                    label="Tipo de serviço *" outlined dense emit-value map-options
                    :disable="!!p._createdId || creatingPosts"
                  />
                  <q-input
                    v-model.number="p.max_guards" label="Capacidade (máx.)"
                    type="number" min="1" outlined dense
                    :disable="!!p._createdId || creatingPosts"
                  />
                </div>
              </div>

              <div>
                <q-btn
                  outline no-caps icon="add"
                  label="Adicionar posto"
                  :disable="creatingPosts"
                  @click="addPost"
                />
              </div>
            </div>

            <q-stepper-navigation>
              <div class="flex flex-wrap gap-2 justify-between">
                <q-btn
                  flat no-caps icon="arrow_back" label="Voltar"
                  :disable="creatingPosts"
                  @click="step = 2"
                />
                <div class="flex flex-wrap gap-2">
                  <q-btn
                    flat no-caps label="Saltar e finalizar"
                    :disable="creatingPosts"
                    @click="finish"
                  />
                  <q-btn
                    unelevated no-caps color="primary"
                    :icon-right="postsAllCreated ? 'check' : 'save'"
                    :label="postsAllCreated ? 'Tudo criado — finalizar' : 'Criar postos e finalizar'"
                    :loading="creatingPosts"
                    @click="onCreatePosts"
                  />
                </div>
              </div>
            </q-stepper-navigation>
          </q-step>

          <!-- ─────────────────────────────  Passo 4 · Sucesso ───────────────────────────── -->
          <q-step
            :name="4"
            title="Concluído"
            icon="check_circle"
            :header-nav="false"
          >
            <div class="wizard-success">
              <div class="wizard-success-icon">
                <q-icon name="check_circle" size="64px" color="positive" />
              </div>
              <h3 class="wizard-success-title">Cliente criado!</h3>
              <p class="wizard-success-summary">
                <strong>{{ createdClient?.name }}</strong>
                <template v-if="createdContract">
                  · 1 contrato ({{ createdContract.reference || createdContract.title }})
                </template>
                <template v-if="createdPostsCount > 0">
                  · {{ createdPostsCount }} posto{{ createdPostsCount === 1 ? '' : 's' }}
                </template>
              </p>

              <div class="flex flex-wrap gap-2 justify-center mt-6">
                <q-btn
                  outline no-caps icon="list" label="Voltar à lista de clientes"
                  :to="{ name: 'clients-list' }"
                />
                <q-btn
                  unelevated no-caps color="primary"
                  icon-right="arrow_forward" label="Ver detalhe do cliente"
                  :to="{ name: 'clients-detail', params: { id: createdClient?.id } }"
                />
              </div>
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { clientService } from 'src/services/client.service'
import { clientContractService } from 'src/services/client-contract.service'
import { postService } from 'src/services/post.service'
import { clientTypeOptions } from 'src/config/clients'
import { modalityOptions } from 'src/config/client-contracts'
import { serviceTypeOptions } from 'src/config/posts'
import {
  nuit, mozambicanPhone, email,
  dateAfter, positiveNumber, decimalAmount,
} from 'src/utils/validators'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import ClientDocumentSlots from 'src/components/clients/ClientDocumentSlots.vue'

const router = useRouter()
const toast = useToast()
const $q = useQuasar()

const step = ref(1)
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// ──────────── Passo 1 · Cliente ────────────
const clientFormRef = ref(null)
const submittingClient = ref(false)
const createdClient = ref(null)
const clientDocuments = ref([])

const clientErr = useFormErrors()
const clientFieldErrors = clientErr.fieldErrors
const clientGlobalErrors = clientErr.globalErrors

const clientForm = reactive({
  name: '',
  short_name: '',
  client_type: 'static',
  nuit: '',
  contact_email: '',
  contact_phone: '',
  address: '',
})

async function uploadClientDocuments(clientId) {
  const pending = clientDocuments.value.filter((doc) => doc.file instanceof File)
  for (const doc of pending) {
    await clientService.uploadDocument(clientId, {
      type: doc.type,
      title: doc.title,
      file: doc.file,
      issue_date: doc.issue_date || '',
      expiry_date: doc.expiry_date || '',
    })
  }
  return pending.length
}

async function onCreateClient() {
  if (submittingClient.value) return
  if (createdClient.value) {
    step.value = 2
    return
  }
  clientErr.clear()
  const ok = await clientFormRef.value?.validate()
  if (!ok) return
  submittingClient.value = true
  try {
    const payload = { ...clientForm }
    const saved = await clientService.create(payload)
    createdClient.value = saved
    const uploadedCount = await uploadClientDocuments(saved.id)
    toast.success(uploadedCount
      ? `Cliente registado com ${uploadedCount} documento(s).`
      : 'Cliente registado.')
    step.value = 2
  } catch (err) {
    clientErr.setFromResponse(err.response)
    toast.error('Verifique os campos assinalados.')
  } finally {
    submittingClient.value = false
  }
}

// ──────────── Passo 2 · Contrato ────────────
const contractFormRef = ref(null)
const submittingContract = ref(false)
const createdContract = ref(null)

const contractErr = useFormErrors()
const contractFieldErrors = contractErr.fieldErrors
const contractGlobalErrors = contractErr.globalErrors

const contractForm = reactive({
  title: '',
  modality: 'static_guards',
  start_date: todayISO(),
  end_date: '',
  monthly_value: '',
})

async function onCreateContract() {
  if (createdContract.value) {
    step.value = 3
    return
  }
  if (!createdClient.value) {
    toast.error('Crie primeiro o cliente.')
    step.value = 1
    return
  }
  contractErr.clear()
  const ok = await contractFormRef.value?.validate()
  if (!ok) return
  submittingContract.value = true
  try {
    const payload = {
      client: createdClient.value.id,
      title: contractForm.title,
      modality: contractForm.modality,
      start_date: contractForm.start_date,
      monthly_value: contractForm.monthly_value,
      currency: 'MZN',
    }
    if (contractForm.end_date) payload.end_date = contractForm.end_date
    const saved = await clientContractService.create(payload)
    createdContract.value = saved
    toast.success('Contrato criado.')
    step.value = 3
  } catch (err) {
    contractErr.setFromResponse(err.response)
    toast.error('Verifique os campos assinalados.')
  } finally {
    submittingContract.value = false
  }
}

// ──────────── Passo 3 · Postos ────────────
const creatingPosts = ref(false)
const postsGlobalError = ref('')

function makePostRow() {
  return {
    name: '',
    service_type: 'h24',
    max_guards: null,
    _createdId: null,
    _error: '',
  }
}

const postsForm = reactive([makePostRow()])

function addPost() {
  postsForm.push(makePostRow())
}
function removePost(idx) {
  postsForm.splice(idx, 1)
  if (postsForm.length === 0) postsForm.push(makePostRow())
}

const postsAllCreated = computed(() =>
  postsForm.length > 0 && postsForm.every((p) => !!p._createdId),
)
const createdPostsCount = computed(() => postsForm.filter((p) => p._createdId).length)

async function onCreatePosts() {
  if (!createdClient.value) {
    toast.error('Crie primeiro o cliente.')
    step.value = 1
    return
  }
  postsGlobalError.value = ''
  if (postsAllCreated.value) {
    await associatePostsAndFinish()
    return
  }
  const pending = postsForm
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !p._createdId)
  for (const { p, i } of pending) {
    if (!p.name || !String(p.name).trim()) {
      postsGlobalError.value = `Posto #${i + 1} precisa de um nome.`
      return
    }
  }

  creatingPosts.value = true
  let anyFailed = false
  try {
    for (const { p, i } of pending) {
      p._error = ''
      const payload = {
        name: p.name,
        client: createdClient.value.id,
        service_type: p.service_type,
      }
      if (p.max_guards) payload.max_guards = p.max_guards
      try {
        const saved = await postService.create(payload)
        p._createdId = saved.id
      } catch (err) {
        anyFailed = true
        const data = err?.response?.data
        let msg = 'Não foi possível criar este posto.'
        if (typeof data === 'string') msg = data
        else if (data?.detail) msg = data.detail
        else if (data && typeof data === 'object') {
          const first = Object.values(data)[0]
          if (Array.isArray(first)) msg = String(first[0])
          else if (first) msg = String(first)
        }
        p._error = msg
        toast.error(`Falha ao criar Posto #${i + 1}.`)
      }
    }
  } finally {
    creatingPosts.value = false
  }

  if (anyFailed) {
    postsGlobalError.value = 'Alguns postos não foram criados. Reveja e tente novamente — os já criados ficam preservados.'
    return
  }

  toast.success('Postos criados.')
  await associatePostsAndFinish()
}

async function associatePostsAndFinish() {
  const ids = postsForm.map((p) => p._createdId).filter(Boolean)
  if (createdContract.value && ids.length > 0) {
    try {
      await clientContractService.update(createdContract.value.id, { posts: ids })
    } catch {
      toast.warning('Postos criados, mas não foi possível associá-los ao contrato.')
    }
  }
  finish()
}

function finish() {
  step.value = 4
}

// ──────────── Sair / cancelar ────────────
function goToClientDetail() {
  if (!createdClient.value) return
  router.push({ name: 'clients-detail', params: { id: createdClient.value.id } })
}

function onLeave() {
  if (createdClient.value) {
    $q.dialog({
      title: 'Sair do assistente?',
      message: 'O cliente já foi criado. Quer abrir a página de detalhe do cliente para continuar a editar?',
      cancel: { label: 'Voltar à lista', flat: true, noCaps: true },
      ok: { label: 'Ver detalhe', unelevated: true, noCaps: true, color: 'primary' },
      persistent: true,
    }).onOk(() => goToClientDetail())
      .onCancel(() => router.push({ name: 'clients-list' }))
  } else {
    router.push({ name: 'clients-list' })
  }
}
</script>

<style scoped>
.pluse-card { background: var(--card); }

.form-group-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border);
}

.wizard-stepper :deep(.q-stepper__step-inner) {
  padding-top: 18px;
}

.wizard-context {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: color-mix(in oklab, var(--primary) 8%, transparent);
  border: 1px solid color-mix(in oklab, var(--primary) 18%, transparent);
  border-radius: 8px;
  font-size: 0.875rem;
}

.post-row {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  background: var(--card);
  transition: background 0.2s;
}
.post-row--done {
  background: color-mix(in oklab, #10b981 6%, var(--card));
  border-color: color-mix(in oklab, #10b981 28%, var(--border));
}

.post-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.post-row-title {
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.wizard-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
}
.wizard-success-icon {
  margin-bottom: 16px;
}
.wizard-success-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
}
.wizard-success-summary {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 1rem;
}
</style>
