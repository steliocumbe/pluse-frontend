<!--
  /posts/new  &  /posts/:id/edit — formulário de posto.
-->
<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    :title="isEdit ? 'Editar posto' : 'Novo posto'"
    :description="isEdit
      ? 'Actualize os dados do posto.'
      : 'Registe um posto. Entra em configuração — é activado depois de anexar o formulário de abertura.'"
  >
    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="arrow_back" label="Voltar" :to="{ name: 'posts-list' }"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <q-form ref="formRef" greedy class="flex flex-col gap-5" @submit="onSubmit">
          <div class="form-group-label">Identificação</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input v-model="form.name" label="Nome do posto *" outlined dense :rules="[req]" />
            <q-select
              v-model="form.client" :options="clientOptions"
              label="Cliente *" outlined dense emit-value map-options use-input
              :loading="loadingClients" :disable="lockedClient"
              input-debounce="300"
              @filter="filterClients" :rules="[req]"
              :hint="lockedClient ? 'Pré-seleccionado a partir do cliente.' : ''"
            />
            <q-input v-model="form.location" label="Localização" outlined dense
                     class="md:col-span-2" />
          </div>

          <div class="form-group-label">Serviço</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select v-model="form.service_type" :options="serviceTypeOptions"
                      label="Tipo de serviço *" outlined dense emit-value map-options
                      :rules="[req]" />
            <q-select v-model="form.shift_hours" :options="shiftHoursOptions"
                      label="Duração do turno" outlined dense emit-value map-options clearable />
            <q-input v-model.number="form.max_guards" label="Capacidade (máx. vigilantes)"
                     type="number" outlined dense min="1"
                     hint="Vazio = sem limite definido" />
            <q-checkbox v-model="form.is_armed" label="Posto armado" />
          </div>

          <div class="form-group-label">Custos e facturação</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input v-model="form.monthly_cost" label="Custo mensal (MZN)"
                     type="number" outlined dense step="0.01" />
            <q-input v-model="form.billing_amount" label="Valor de facturação (MZN)"
                     type="number" outlined dense step="0.01"
                     hint="Valor mensal cobrado ao cliente" />
          </div>

          <div class="form-group-label">Documentos do posto</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-file v-model="form.procedures_file" label="Procedimentos do posto"
                    outlined dense clearable max-file-size="10485760"
                    accept=".pdf,.jpg,.jpeg,.png">
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-file v-model="form.opening_form_file" label="Formulário de abertura de posto"
                    outlined dense clearable max-file-size="10485760"
                    accept=".pdf,.jpg,.jpeg,.png">
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-input v-model="form.notes" label="Notas" type="textarea" outlined dense
                     autogrow class="md:col-span-2" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting"
                   :to="{ name: 'posts-list' }" />
            <q-btn unelevated no-caps color="primary" type="submit"
                   :label="isEdit ? 'Guardar alterações' : 'Registar posto'"
                   :loading="submitting" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postService } from 'src/services/post.service'
import { clientService } from 'src/services/client.service'
import { serviceTypeOptions, shiftHoursOptions } from 'src/config/posts'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
// When opened from a client's page (?client=ID) the cliente vem fixo.
const lockedClient = computed(() => !isEdit.value && !!route.query.client)
const formRef = ref(null)
const submitting = ref(false)
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const form = reactive({
  name: '',
  client: route.query.client ? Number(route.query.client) : null,
  location: '',
  service_type: 'h24',
  shift_hours: null,
  max_guards: null,
  is_armed: false,
  monthly_cost: '',
  billing_amount: '',
  procedures_file: null,
  opening_form_file: null,
  notes: '',
})

// ── Client selector ─────────────────────────────────────────────────────
const allClients = ref([])
const clientOptions = ref([])
const loadingClients = ref(false)

function filterClients(needle, update) {
  update(() => {
    const n = (needle || '').toLowerCase()
    clientOptions.value = n
      ? allClients.value.filter((o) => o.label.toLowerCase().includes(n))
      : allClients.value
  })
}

onMounted(async () => {
  loadingClients.value = true
  try {
    // Um posto pode ser criado para qualquer cliente; a activação é que
    // exige o onboarding concluído.
    const data = await clientService.list({ page_size: 300 })
    const rows = data?.results ?? data ?? []
    allClients.value = rows.map((c) => ({ label: c.name, value: c.id }))
    clientOptions.value = allClients.value
  } catch { /* interceptor toasts */ } finally {
    loadingClients.value = false
  }

  if (isEdit.value) {
    try {
      const p = await postService.get(route.params.id)
      Object.assign(form, {
        name: p.name,
        client: p.client,
        location: p.location || '',
        service_type: p.service_type,
        shift_hours: p.shift_hours,
        max_guards: p.max_guards,
        is_armed: p.is_armed,
        monthly_cost: p.monthly_cost ?? '',
        billing_amount: p.billing_amount ?? '',
        notes: p.notes || '',
      })
    } catch {
      toast.error('Posto não encontrado.')
      router.push({ name: 'posts-list' })
    }
  }
})

async function onSubmit() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { ...form }
    if (!(payload.procedures_file instanceof File)) delete payload.procedures_file
    if (!(payload.opening_form_file instanceof File)) delete payload.opening_form_file
    const saved = isEdit.value
      ? await postService.update(route.params.id, payload)
      : await postService.create(payload)
    toast.success(isEdit.value ? 'Posto actualizado.' : 'Posto registado.')
    router.push({ name: 'posts-detail', params: { id: saved.id } })
  } catch (err) {
    toast.error('Não foi possível guardar.', {
      caption: err?.response?.data?.detail
        || Object.values(err?.response?.data || {})?.[0],
    })
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
</style>
