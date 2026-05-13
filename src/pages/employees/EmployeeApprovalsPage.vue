<!--
  /employees/approvals — focused triage view for Admin/RH.
  Same hero pattern as the rest, cards for each pending colaborador.
-->
<template>
  <AdminPageTemplate
    eyebrow="Colaboradores"
    title="Aprovações pendentes"
    description="Triagem dos registos submetidos por RH. Cada aprovação activa imediatamente o acesso à plataforma (se houver conta de utilizador)."
  >
    <template #meta>
      <span class="admin-meta-chip admin-meta-chip--accent">
        <AppIcon name="ki-warning-2" :size="14" />
        {{ store.items.length }} a aguardar
      </span>
    </template>

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

    <div v-if="store.loading && store.items.length === 0" class="loading-state">
      <q-spinner color="primary" size="2em" />
      <span>A carregar…</span>
    </div>

    <AppEmptyState
      v-else-if="store.items.length === 0"
      title="Nada pendente"
      description="Todos os colaboradores submetidos foram já tratados. Voltaremos aqui quando houver novos pedidos."
      icon="ki-check-circle"
      cta-label="Voltar à lista"
      :cta-to="{ name: 'employees-list' }"
    />

    <div v-else class="grid gap-3">
      <q-card
        v-for="emp in store.items"
        :key="emp.id"
        flat
        bordered
        class="approval-card"
      >
        <div class="flex flex-wrap items-center gap-4 p-4">
          <span class="approval-avatar">{{ initialsOf(emp.full_name) }}</span>
          <div class="grow min-w-0">
            <router-link
              :to="`/employees/${emp.id}`"
              class="text-base font-semibold text-mono hover:text-primary"
            >
              {{ emp.full_name }}
            </router-link>
            <div class="text-sm text-muted-foreground">
              {{ emp.employee_number }}
              <template v-if="emp.role_title"> · {{ emp.role_title }}</template>
            </div>
            <div class="flex flex-wrap gap-1 mt-1.5">
              <AppBadge v-for="t in emp.types" :key="t.id" size="sm" variant="info">
                {{ t.name }}
              </AppBadge>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 ms-auto">
            <q-btn
              outline
              no-caps
              icon="visibility"
              label="Ver"
              :to="`/employees/${emp.id}`"
            />
            <q-btn
              color="positive"
              unelevated
              no-caps
              icon="check_circle"
              label="Aprovar"
              @click="approve(emp)"
            />
          </div>
        </div>
      </q-card>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useEmployeesStore } from 'src/stores/employees'
import { useToast } from 'src/composables/useToast'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'

const store = useEmployeesStore()
const toast = useToast()
const $q = useQuasar()

function initialsOf(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

async function approve(employee) {
  $q.dialog({
    title: 'Aprovar colaborador',
    message: `Aprovar <b>${employee.full_name}</b>? Esta acção activa o acesso à plataforma (se houver conta).`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Aprovar', color: 'positive', unelevated: true, noCaps: true },
  }).onOk(async () => {
    try {
      await store.approve(employee.id)
      toast.success(`${employee.full_name} foi aprovado.`)
      await store.fetchList({ status: 'pending', page_size: 50 })
    } catch (err) {
      toast.error('Não foi possível aprovar.', { caption: err?.response?.data?.detail })
    }
  })
}

onMounted(() => {
  store.fetchList({ status: 'pending', page_size: 50 })
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
.approval-card {
  background: var(--card);
  transition: border-color 160ms ease, transform 160ms ease;
}
.approval-card:hover {
  border-color: color-mix(in oklab, var(--primary) 24%, var(--border));
}
.approval-avatar {
  display: inline-flex;
  width: 48px;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  font-weight: 700;
}
</style>
