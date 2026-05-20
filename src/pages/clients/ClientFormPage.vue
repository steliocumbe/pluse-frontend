<!--
  /clients/new  &  /clients/:id/edit — formulário de cliente.
  A análise de risco regista-se aqui; a submissão/aprovação faz-se no detalhe.
-->
<template>
  <AdminPageTemplate eyebrow="Cadastros" :title="isEdit ? 'Editar cliente' : 'Novo cliente'" :description="isEdit
    ? 'Actualize os dados do cliente e a análise de risco.'
    : 'Registe um cliente. Entra em Prospeção — depois submete-se a análise de risco para aprovação.'">
    <template #actions>
      <q-btn outline no-caps class="admin-hero-button" icon="arrow_back" label="Voltar"
        :to="{ name: 'clients-list' }" />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <q-form ref="formRef" greedy class="flex flex-col gap-5" @submit="onSubmit">
          <div class="form-group-label">Identificação</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input v-model="form.name" label="Nome *" outlined dense :rules="[req]" class="md:col-span-2" />
            <q-input v-model="form.short_name" label="Nome curto" outlined dense />
            <q-select v-model="form.client_type" :options="clientTypeOptions" label="Tipo de cliente *" outlined dense
              emit-value map-options :rules="[req]" />
            <q-input v-model="form.nuit" label="NUIT" outlined dense hint="9 dígitos (opcional)"
              :rules="[(v) => !v || /^\d{9}$/.test(v) || 'NUIT deve ter 9 dígitos']" />
            <q-input v-model="form.address" label="Morada" type="textarea" outlined dense autogrow
              class="md:col-span-2" />
          </div>

          <div class="form-group-label">Contacto</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-input v-model="form.contact_name" label="Nome do contacto" outlined dense />
            <q-input v-model="form.contact_phone" label="Telefone do contacto" outlined dense inputmode="tel"
              hint="9 dígitos, com ou sem +258" />
            <q-input v-model="form.contact_email" label="Email do contacto" type="email" outlined dense
              class="md:col-span-2" />
          </div>

          <div class="form-group-label">Análise de risco</div>
          <p class="text-sm text-muted-foreground">
            Preencha a análise de risco. A submissão para aprovação faz-se na página
            de detalhe do cliente, e exige o nível e o relatório anexado.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <q-select v-model="form.risk_level" :options="riskLevelOptions" label="Nível de risco" outlined dense
              emit-value map-options clearable />
            <q-file v-model="form.risk_analysis_file" label="Relatório de análise de risco" outlined dense clearable
              max-file-size="10485760" accept=".pdf,.jpg,.jpeg,.png">
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
            <q-input v-model="form.risk_notes" label="Notas da análise" type="textarea" outlined dense autogrow
              class="md:col-span-2" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <q-btn flat no-caps label="Cancelar" :disable="submitting" :to="{ name: 'clients-list' }" />
            <q-btn unelevated no-caps color="primary" type="submit"
              :label="isEdit ? 'Guardar alterações' : 'Registar cliente'" :loading="submitting" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientService } from 'src/services/client.service'
import { clientTypeOptions, riskLevelOptions } from 'src/config/clients'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const formRef = ref(null)
const submitting = ref(false)
const req = (v) => (v !== '' && v !== null && v !== undefined) || 'Obrigatório'

const form = reactive({
  name: '',
  short_name: '',
  client_type: 'static',
  nuit: '',
  address: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  risk_level: '',
  risk_analysis_file: null,
  risk_notes: '',
})

onMounted(async () => {
  if (isEdit.value) {
    try {
      const c = await clientService.get(route.params.id)
      Object.assign(form, {
        name: c.name,
        short_name: c.short_name || '',
        client_type: c.client_type,
        nuit: c.nuit || '',
        address: c.address || '',
        contact_name: c.contact_name || '',
        contact_phone: c.contact_phone || '',
        contact_email: c.contact_email || '',
        risk_level: c.risk_level || '',
        risk_notes: c.risk_notes || '',
      })
    } catch {
      toast.error('Cliente não encontrado.')
      router.push({ name: 'clients-list' })
    }
  }
})

async function onSubmit() {
  const ok = await formRef.value?.validate()
  if (!ok) return
  submitting.value = true
  try {
    const payload = { ...form }
    if (!(payload.risk_analysis_file instanceof File)) delete payload.risk_analysis_file
    const saved = isEdit.value
      ? await clientService.update(route.params.id, payload)
      : await clientService.create(payload)
    toast.success(isEdit.value ? 'Cliente actualizado.' : 'Cliente registado.')
    router.push({ name: 'clients-detail', params: { id: saved.id } })
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
.pluse-card {
  background: var(--card);
}

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
