<!--
  /employees/new — wraps EmployeeForm inside AdminPageTemplate.

  When create_account is true and the API returns a temporary_password,
  shows a modal with the credentials (copy-to-clipboard) — only shown once.
-->
<template>
  <AdminPageTemplate
    eyebrow="Colaboradores · Novo registo"
    title="Novo colaborador"
    description="Vigilantes, supervisores ou funcionários internos. O registo entra como pendente — um administrador aprova depois."
  >
    <template #actions>
      <q-btn
        outline
        no-caps
        class="admin-hero-button"
        icon="arrow_back"
        :to="{ name: 'employees-list' }"
        label="Voltar à lista"
      />
    </template>

    <q-card flat bordered class="pluse-card">
      <q-card-section>
        <EmployeeForm
          mode="create"
          :submitting="store.submitting"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </q-card-section>
    </q-card>

    <!-- Temporary password modal (shown once after create with create_account) -->
    <AppModal v-model="showTempPassword" size="md" :persistent="true">
      <div class="p-6 flex flex-col items-center text-center">
        <span class="size-12 rounded-full bg-positive/10 flex items-center justify-center mb-4">
          <AppIcon name="ki-key" :size="24" icon-class="text-positive" />
        </span>
        <AppHeading :level="2" class="text-lg font-semibold text-mono leading-tight mb-1.5">
          Colaborador criado
        </AppHeading>
        <p class="text-sm text-muted-foreground leading-relaxed max-w-[360px] mb-4">
          A conta de acesso foi gerada com a palavra-passe abaixo.
          <strong class="text-foreground">Copie-a agora</strong> — não é possível recuperá-la depois.
        </p>
        <div class="w-full">
          <div class="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
            Palavra-passe temporária
          </div>
          <div class="temp-pwd-box">
            <code class="grow font-mono text-base tracking-wider">{{ tempPassword }}</code>
            <q-btn flat dense round icon="content_copy" size="sm" @click="copyPassword" />
          </div>
          <div class="text-xs text-muted-foreground mt-1.5">
            O colaborador só pode iniciar sessão depois de ser aprovado.
          </div>
        </div>
      </div>
      <div class="px-6 pb-6 flex gap-2.5">
        <q-btn
          flat
          no-caps
          label="Ir para a lista"
          class="flex-1"
          @click="goToList"
        />
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Ver detalhe"
          class="flex-1"
          @click="goToDetail"
        />
      </div>
    </AppModal>
  </AdminPageTemplate>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { copyToClipboard } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import EmployeeForm from 'src/components/employees/EmployeeForm.vue'

const router = useRouter()
const store = useEmployeesStore()
const toast = useToast()

const showTempPassword = ref(false)
const tempPassword = ref('')
const createdId = ref(null)

async function onSubmit({ payload, initialDocuments = [] }) {
  try {
    const created = await store.create(payload, initialDocuments)
    createdId.value = created.id
    const docsHint = initialDocuments.length
      ? ` (${initialDocuments.length} documento${initialDocuments.length === 1 ? '' : 's'} anexado${initialDocuments.length === 1 ? '' : 's'})`
      : ''
    if (created?.user?.temporary_password) {
      tempPassword.value = created.user.temporary_password
      showTempPassword.value = true
      toast.success(`Colaborador criado e conta gerada${docsHint}.`)
    } else {
      toast.success(`${created.full_name} foi criado como pendente${docsHint}.`)
      router.push(`/employees/${created.id}`)
    }
  } catch (err) {
    const data = err?.response?.data
    if (data && typeof data === 'object') {
      const firstErr = Object.entries(data)[0]
      const message = Array.isArray(firstErr?.[1]) ? firstErr[1][0] : firstErr?.[1]
      toast.error('Não foi possível criar.', { caption: `${firstErr?.[0]}: ${message}` })
    } else {
      toast.error('Não foi possível criar.')
    }
  }
}

function onCancel() {
  router.push('/employees')
}

async function copyPassword() {
  try {
    await copyToClipboard(tempPassword.value)
    toast.success('Palavra-passe copiada.')
  } catch {
    toast.error('Não foi possível copiar. Selecione manualmente.')
  }
}

function goToList() {
  showTempPassword.value = false
  router.push('/employees')
}

function goToDetail() {
  showTempPassword.value = false
  router.push(`/employees/${createdId.value}`)
}
</script>

<style scoped>
.pluse-card {
  background: var(--card);
}
.temp-pwd-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px dashed var(--input);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: var(--muted);
}
</style>
