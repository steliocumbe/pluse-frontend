<!--
  /client-contracts/new  &  /client-contracts/:id/edit
  Formulário de contrato comercial (PLUSE × Cliente).
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    :title="isEdit ? 'Editar contrato' : 'Novo contrato de cliente'"
    :description="isEdit
      ? 'Actualize os dados deste contrato comercial.'
      : 'Registe um contrato comercial com um cliente. Pode criar em rascunho e activar mais tarde.'"
    :breadcrumb="isEdit
      ? [
          { label: 'Contratos de clientes', to: { name: 'client-contracts-list' } },
          { label: contractLabel || 'Contrato', to: route.params.id ? { name: 'client-contracts-detail', params: { id: route.params.id } } : null },
          { label: 'Editar' },
        ]
      : [
          { label: 'Contratos de clientes', to: { name: 'client-contracts-list' } },
          { label: 'Novo' },
        ]"
    :back-to="isEdit && route.params.id ? { name: 'client-contracts-detail', params: { id: route.params.id } } : { name: 'client-contracts-list' }"
  >
    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar"
        :to="{ name: 'client-contracts-list' }"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <q-form ref="formRef" greedy class="flex flex-col gap-5" @submit="onSubmit">
          <div v-if="globalErrors.length"
            class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p v-for="(e, i) in globalErrors" :key="i" class="m-0">{{ e }}</p>
          </div>

          <div class="form-group-label">Identificação</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select
              v-model="form.client" :options="clientOptions"
              label="Cliente *" outlined dense emit-value map-options use-input
              :loading="loadingClients"
              :disable="lockedClient"
              input-debounce="300"
              @filter="filterClients"
              :rules="[req]"
              class="md:col-span-2"
              :hint="lockedClient ? 'Pré-seleccionado a partir do cliente.' : ''"
              :error="!!fieldErrors.client" :error-message="fieldErrors.client"
              @update:model-value="onClientChange"
            />
            <q-input
              v-model="form.title" label="Título *" outlined dense :rules="[req]"
              class="md:col-span-2"
              :error="!!fieldErrors.title" :error-message="fieldErrors.title"
              @update:model-value="() => clearField('title')"
            />
            <q-select
              v-model="form.modality" :options="modalityOptions"
              label="Modalidade *" outlined dense emit-value map-options :rules="[req]"
              :error="!!fieldErrors.modality" :error-message="fieldErrors.modality"
              @update:model-value="() => clearField('modality')"
            />
          </div>

          <div class="form-group-label">Período</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input
              v-model="form.start_date" label="Data de início *" type="date"
              outlined dense stack-label :rules="[req]"
              :error="!!fieldErrors.start_date" :error-message="fieldErrors.start_date"
              @update:model-value="() => clearField('start_date')"
            />
            <q-input
              v-model="form.end_date" label="Data de fim" type="date"
              outlined dense stack-label clearable
              :rules="[dateAfter(form.start_date)]"
              :error="!!fieldErrors.end_date" :error-message="fieldErrors.end_date"
              @update:model-value="() => clearField('end_date')"
            />
            <q-input
              v-model="form.signed_date" label="Data de assinatura" type="date"
              outlined dense stack-label clearable
              :error="!!fieldErrors.signed_date" :error-message="fieldErrors.signed_date"
              @update:model-value="() => clearField('signed_date')"
            />
            <div class="renewal-row">
              <q-toggle
                v-model="form.auto_renew" label="Renovação automática"
                color="primary"
              />
              <q-input
                v-if="form.auto_renew"
                v-model.number="form.auto_renew_months" label="Meses de renovação"
                type="number" min="1" outlined dense
                :error="!!fieldErrors.auto_renew_months" :error-message="fieldErrors.auto_renew_months"
                @update:model-value="() => clearField('auto_renew_months')"
              />
            </div>
            <q-input
              v-model.number="form.notice_period_days" label="Aviso prévio (dias)"
              type="number" min="0" outlined dense
              :error="!!fieldErrors.notice_period_days" :error-message="fieldErrors.notice_period_days"
              @update:model-value="() => clearField('notice_period_days')"
            />
          </div>

          <div class="form-group-label">Valores</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <q-input
              v-model="form.monthly_value" label="Valor mensal *"
              type="number" outlined dense step="0.01"
              :rules="[req, positiveNumber(), decimalAmount()]"
              :error="!!fieldErrors.monthly_value" :error-message="fieldErrors.monthly_value"
              @update:model-value="() => clearField('monthly_value')"
            />
            <q-input
              v-model="form.currency" label="Moeda" outlined dense maxlength="3"
              :error="!!fieldErrors.currency" :error-message="fieldErrors.currency"
              @update:model-value="() => clearField('currency')"
            />
            <q-input
              v-model.number="form.payment_terms_days" label="Prazo pagamento (dias)"
              type="number" min="0" outlined dense
              :error="!!fieldErrors.payment_terms_days" :error-message="fieldErrors.payment_terms_days"
              @update:model-value="() => clearField('payment_terms_days')"
            />
          </div>

          <div class="form-group-label">Postos cobertos</div>
          <div class="grid grid-cols-1 gap-4">
            <q-select
              v-model="form.posts" :options="postOptions"
              label="Postos do cliente" outlined dense multiple use-chips
              emit-value map-options
              :loading="loadingPosts"
              :hint="!form.client
                ? 'Seleccione primeiro um cliente para ver os postos disponíveis.'
                : (postOptions.length ? '' : 'Este cliente ainda não tem postos.')"
              :disable="!form.client"
              :error="!!fieldErrors.posts" :error-message="fieldErrors.posts"
              @update:model-value="() => clearField('posts')"
            />
          </div>

          <div class="form-group-label">Anexos</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-file
              v-model="form.signed_file" label="Contrato assinado"
              outlined dense clearable
              max-file-size="10485760" accept=".pdf,.jpg,.jpeg,.png"
              :error="!!fieldErrors.signed_file" :error-message="fieldErrors.signed_file"
              @update:model-value="() => clearField('signed_file')"
            >
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-file
              v-model="form.proposal_file" label="Proposta comercial"
              outlined dense clearable
              max-file-size="10485760" accept=".pdf,.jpg,.jpeg,.png"
              :error="!!fieldErrors.proposal_file" :error-message="fieldErrors.proposal_file"
              @update:model-value="() => clearField('proposal_file')"
            >
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
          </div>

          <div class="form-group-label">Notas</div>
          <q-input
            v-model="form.notes" label="Notas internas" type="textarea"
            outlined dense autogrow
            :error="!!fieldErrors.notes" :error-message="fieldErrors.notes"
            @update:model-value="() => clearField('notes')"
          />

          <div class="flex justify-end gap-2 pt-2">
            <q-btn
              flat no-caps label="Cancelar" :disable="submitting"
              :to="{ name: 'client-contracts-list' }"
            />
            <q-btn
              unelevated no-caps color="primary" type="submit"
              :label="isEdit ? 'Guardar alterações' : 'Criar contrato'"
              :loading="submitting"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientContractService } from 'src/services/client-contract.service'
import { clientService } from 'src/services/client.service'
import { postService } from 'src/services/post.service'
import { modalityOptions } from 'src/config/client-contracts'
import { useToast } from 'src/composables/useToast'
import { useFormErrors } from 'src/composables/useFormErrors'
import { dateAfter, positiveNumber, decimalAmount } from 'src/utils/validators'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const lockedClient = computed(() => !isEdit.value && !!route.query.client)
const formRef = ref(null)
const submitting = ref(false)
const contractLabel = ref('')
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const { fieldErrors, globalErrors, setFromResponse, clear: clearErrors, clearField } = useFormErrors()

const form = reactive({
  client: null,
  title: '',
  modality: 'static_guards',
  start_date: '',
  end_date: '',
  signed_date: '',
  auto_renew: false,
  auto_renew_months: 12,
  notice_period_days: 30,
  monthly_value: '',
  currency: 'MZN',
  payment_terms_days: 30,
  posts: [],
  signed_file: null,
  proposal_file: null,
  notes: '',
})

// ── Clientes ─────────────────────────────────────────────────────────────
const allClients = ref([])
const clientOptions = ref([])
const loadingClients = ref(false)

function mapClient(c) {
  return { label: c.name, value: c.id }
}
function filterClients(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    clientOptions.value = n
      ? allClients.value.filter((o) => o.label.toLowerCase().includes(n))
      : allClients.value
  })
}

// ── Postos do cliente seleccionado ───────────────────────────────────────
const postOptions = ref([])
const loadingPosts = ref(false)

async function loadPostsForClient(clientId) {
  if (!clientId) {
    postOptions.value = []
    return
  }
  loadingPosts.value = true
  try {
    const data = await postService.list({ client: clientId, page_size: 200 })
    const list = data?.results ?? data ?? []
    postOptions.value = list.map((p) => ({ label: p.name, value: p.id }))
  } catch {
    postOptions.value = []
  } finally {
    loadingPosts.value = false
  }
}

function onClientChange() {
  clearField('client')
  // Limpa postos quando muda de cliente, excepto durante edição inicial
  if (!isEdit.value || form._initialLoaded) {
    form.posts = []
  }
  loadPostsForClient(form.client)
}

watch(() => form.client, (newVal, oldVal) => {
  if (newVal !== oldVal && form._initialLoaded) {
    loadPostsForClient(newVal)
  }
})

onMounted(async () => {
  loadingClients.value = true
  try {
    const data = await clientService.list({ page_size: 300 })
    const rows = data?.results ?? data ?? []
    allClients.value = rows.map(mapClient)
    clientOptions.value = allClients.value
  } catch { /* interceptor toasts */ } finally {
    loadingClients.value = false
  }

  // Pré-selecção via query string (?client=ID)
  if (lockedClient.value) {
    form.client = Number(route.query.client)
    await loadPostsForClient(form.client)
  }

  if (isEdit.value) {
    try {
      const c = await clientContractService.get(route.params.id)
      contractLabel.value = c.reference || c.title || ''
      Object.assign(form, {
        client: c.client,
        title: c.title || '',
        modality: c.modality,
        start_date: c.start_date || '',
        end_date: c.end_date || '',
        signed_date: c.signed_date || '',
        auto_renew: !!c.auto_renew,
        auto_renew_months: c.auto_renew_months ?? 12,
        notice_period_days: c.notice_period_days ?? 30,
        monthly_value: c.monthly_value ?? '',
        currency: c.currency || 'MZN',
        payment_terms_days: c.payment_terms_days ?? 30,
        posts: Array.isArray(c.posts) ? c.posts : [],
        notes: c.notes || '',
      })
      await loadPostsForClient(c.client)
    } catch {
      toast.error('Contrato não encontrado.')
      router.push({ name: 'client-contracts-list' })
      return
    }
  }
  // Marca que a carga inicial terminou — agora mudanças de cliente limpam os postos.
  form._initialLoaded = true
})

async function onSubmit() {
  clearErrors()
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { ...form }
    delete payload._initialLoaded
    // Não envia ficheiros vazios em PATCH para não limpar os existentes
    if (!(payload.signed_file instanceof File)) delete payload.signed_file
    if (!(payload.proposal_file instanceof File)) delete payload.proposal_file
    // Auto-renew off → não envia meses
    if (!payload.auto_renew) delete payload.auto_renew_months

    let saved
    if (isEdit.value) {
      saved = await clientContractService.update(route.params.id, payload)
      toast.success('Contrato actualizado.')
    } else {
      saved = await clientContractService.create(payload)
      toast.success('Contrato criado.')
    }
    router.push({ name: 'client-contracts-detail', params: { id: saved.id } })
  } catch (err) {
    setFromResponse(err.response)
    toast.error('Verifique os campos assinalados.')
  } finally {
    submitting.value = false
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
.renewal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
