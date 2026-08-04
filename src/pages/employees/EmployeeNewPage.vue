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
    :breadcrumb="[
      { label: 'Colaboradores', to: { name: 'employees-list' } },
      { label: 'Novo' },
    ]"
    :back-to="{ name: 'employees-list' }"
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

    <q-card flat bordered class="pluse-card relative">
      <q-card-section>
        <EmployeeForm
          ref="formRef"
          mode="create"
          :initial="initialFromQuery"
          :submitting="store.submitting"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </q-card-section>

      <q-inner-loading :showing="store.submitting" label="A gravar colaborador...">
        <q-spinner size="42px" color="primary" />
      </q-inner-loading>
    </q-card>

    <ModernAlert
      v-model="feedback.open"
      :tone="feedback.tone"
      :title="feedback.title"
      :message="feedback.message"
      :confirm-label="feedback.confirmLabel"
      :confirm-icon="feedback.confirmIcon"
      :confirm-tone="feedback.confirmTone"
      :secondary-label="feedback.secondaryLabel"
      :secondary-icon="feedback.secondaryIcon"
      :secondary-tone="feedback.secondaryTone"
      :show-secondary="feedback.showSecondary"
      @confirm="onFeedbackConfirm"
      @secondary="goToList"
      @cancel="feedback.open = false"
    >
      <div v-if="feedback.password" class="w-full mt-4">
        <div class="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
          Palavra-passe temporária
        </div>
        <div class="temp-pwd-box">
          <code class="grow font-mono text-base tracking-wider">{{ feedback.password }}</code>
          <q-btn flat dense round icon="content_copy" size="sm" @click="copyPassword" />
        </div>
        <div class="text-xs text-muted-foreground mt-1.5">
          O colaborador só pode iniciar sessão depois de ser aprovado.
        </div>
      </div>
    </ModernAlert>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { copyToClipboard } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import ModernAlert from 'src/components/ui/ModernAlert.vue'
import EmployeeForm from 'src/components/employees/EmployeeForm.vue'

const route = useRoute()
const router = useRouter()
const store = useEmployeesStore()
const toast = useToast()

// Pré-popular o formulário quando vier `?client=<id>` (vindo do detalhe do cliente)
const initialFromQuery = computed(() => {
  const clientId = route.query.client ? Number(route.query.client) : null
  return clientId
    ? { department: 'operations', client: clientId }
    : {}
})

const formRef = ref(null)
const createdId = ref(null)
const feedback = ref({
  open: false,
  tone: 'primary',
  title: '',
  message: '',
  confirmLabel: 'Fechar',
  confirmIcon: 'check_circle',
  confirmTone: 'positive',
  secondaryLabel: 'Ir para a lista',
  secondaryIcon: 'arrow_right_alt',
  secondaryTone: 'primary',
  showSecondary: false,
  password: '',
})

async function onSubmit({ payload, initialDocuments = [], initialContract = null }) {
  formRef.value?.clearErrors?.()
  try {
    const created = await store.create(payload, initialDocuments, initialContract)
    createdId.value = created.id
    const docsHint = initialDocuments.length
      ? ` (${initialDocuments.length} documento${initialDocuments.length === 1 ? '' : 's'} anexado${initialDocuments.length === 1 ? '' : 's'})`
      : ''
    if (created?.user?.temporary_password) {
      feedback.value = {
        open: true,
        tone: 'positive',
        title: 'Colaborador criado',
        message: `A conta de acesso foi gerada${docsHint}.`,
        confirmLabel: 'Ver detalhe',
        confirmIcon: 'visibility',
        confirmTone: 'positive',
        secondaryLabel: 'Ir para a lista',
        secondaryIcon: 'list',
        secondaryTone: 'primary',
        showSecondary: true,
        password: created.user.temporary_password,
      }
    } else {
      feedback.value = {
        open: true,
        tone: 'positive',
        title: 'Colaborador criado',
        message: `${created.full_name} foi criado como pendente${docsHint}.`,
        confirmLabel: 'Ver detalhe',
        confirmIcon: 'visibility',
        confirmTone: 'positive',
        secondaryLabel: 'Ir para a lista',
        secondaryIcon: 'list',
        secondaryTone: 'primary',
        showSecondary: true,
        password: '',
      }
    }
  } catch (err) {
    formRef.value?.setFromResponse?.(err.response)
    const detail = extractFirstError(err?.response?.data)
    feedback.value = {
      open: true,
      tone: 'negative',
      title: 'Erro ao criar colaborador',
      message: detail || 'Verifique os campos assinalados.',
      confirmLabel: 'Fechar',
      confirmIcon: 'close',
      confirmTone: 'negative',
      secondaryLabel: '',
      secondaryIcon: '',
      secondaryTone: 'primary',
      showSecondary: false,
      password: '',
    }
  }
}

function extractFirstError(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    const first = data.find(Boolean)
    return typeof first === 'string' ? first : extractFirstError(first)
  }
  if (typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail
    for (const value of Object.values(data)) {
      const nested = extractFirstError(value)
      if (nested) return nested
    }
  }
  return ''
}

function onCancel() {
  router.push('/employees')
}

async function copyPassword() {
  try {
    await copyToClipboard(feedback.value.password)
    toast.success('Palavra-passe copiada.')
  } catch {
    toast.error('Não foi possível copiar. Selecione manualmente.')
  }
}

function goToList() {
  feedback.value.open = false
  router.push('/employees')
}

function goToDetail() {
  feedback.value.open = false
  router.push(`/employees/${createdId.value}`)
}

function onFeedbackConfirm() {
  if (feedback.value.tone === 'negative') {
    feedback.value.open = false
    return
  }
  goToDetail()
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
