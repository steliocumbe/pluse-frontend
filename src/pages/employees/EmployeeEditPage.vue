<!--
  /employees/:id/edit — loads the employee then renders EmployeeForm in edit mode.
  Hero shows the colaborador's name as title and employee_number on the eyebrow.
-->
<template>
  <AdminPageTemplate
    :eyebrow="`Colaboradores · ${store.current?.employee_number || '…'}`"
    :title="pageTitle"
    description="Actualizar dados pessoais, função, contactos ou acesso à plataforma."
    :breadcrumb="[
      { label: 'Colaboradores', to: { name: 'employees-list' } },
      { label: store.current?.full_name || 'Colaborador', to: store.current ? { name: 'employees-detail', params: { id: store.current.id } } : null },
      { label: 'Editar' },
    ]"
    :back-to="store.current ? { name: 'employees-detail', params: { id: store.current.id } } : { name: 'employees-list' }"
  >
    <template #actions>
      <q-btn
        outline
        no-caps
        class="admin-hero-button"
        icon="arrow_back"
        :to="`/employees/${employeeId}`"
        label="Voltar ao detalhe"
      />
    </template>

    <div v-if="store.loading && !store.current" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <q-card v-else flat bordered class="pluse-card">
      <q-card-section>
        <EmployeeForm
          mode="edit"
          :initial="store.current || {}"
          :submitting="store.submitting"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </q-card-section>
    </q-card>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import EmployeeForm from 'src/components/employees/EmployeeForm.vue'

const route = useRoute()
const router = useRouter()
const store = useEmployeesStore()
const toast = useToast()

const employeeId = computed(() => route.params.id)
const pageTitle = computed(() => store.current?.full_name || 'Editar colaborador')

async function onSubmit({ payload }) {
  // initialDocuments is ignored in edit mode (form hides that section anyway).
  try {
    await store.update(employeeId.value, payload)
    toast.success('Dados actualizados.')
    router.push(`/employees/${employeeId.value}`)
  } catch (err) {
    const data = err?.response?.data
    if (data && typeof data === 'object') {
      const first = Object.entries(data)[0]
      const message = Array.isArray(first?.[1]) ? first[1][0] : first?.[1]
      toast.error('Não foi possível guardar.', { caption: `${first?.[0]}: ${message}` })
    } else {
      toast.error('Não foi possível guardar.')
    }
  }
}

function onCancel() {
  router.push(`/employees/${employeeId.value}`)
}

onMounted(() => {
  store.fetchOne(employeeId.value).catch(() => {
    toast.error('Colaborador não encontrado.')
    router.push('/employees')
  })
})
</script>

<style scoped>
.pluse-card {
  background: var(--card);
}
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--muted-foreground);
}
</style>
