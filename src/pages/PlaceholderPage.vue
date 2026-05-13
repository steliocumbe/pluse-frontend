<template>
  <AdminPageTemplate
    eyebrow="Em desenvolvimento"
    :title="title"
    description="Esta secção já está prevista na navegação e será implementada com a mesma estrutura visual das páginas administrativas."
  >
    <template #actions>
      <router-link to="/" class="kt-btn kt-btn-outline admin-placeholder-action">
        <AppIcon name="ki-arrow-left" :size="14" icon-class="me-1.5" />
        Voltar ao Dashboard
      </router-link>
    </template>

    <section class="kt-card admin-placeholder-card">
      <span class="admin-placeholder-icon">
        <AppIcon name="ki-setting-2" :size="28" />
      </span>
      <div>
        <div class="admin-placeholder-title">Template pronto para continuar</div>
        <p>
          Use o componente <code class="kt-kbd">AdminPageTemplate</code> para manter hero,
          acções, metadados e espaçamento consistentes enquanto esta página ganha
          formulário, tabela ou dashboard próprio.
        </p>
        <div class="admin-placeholder-path">
          Caminho actual: <code class="kt-kbd">{{ route.path }}</code>
        </div>
      </div>
    </section>
  </AdminPageTemplate>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const route = useRoute()

const title = computed(() => {
  const last = (route.path.split('/').filter(Boolean).pop() || 'Página').replace(/-/g, ' ')
  return last.charAt(0).toUpperCase() + last.slice(1)
})
</script>

<style scoped>
.admin-placeholder-action {
  border-color: rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.admin-placeholder-card {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  max-width: 780px;
  padding: 24px;
}

.admin-placeholder-icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  flex: none;
  border-radius: 16px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

.admin-placeholder-title {
  color: var(--mono);
  font-size: 1.1rem;
  font-weight: 720;
}

.admin-placeholder-card p {
  max-width: 600px;
  margin: 8px 0 0;
  color: var(--secondary-foreground);
  font-size: 0.9rem;
  line-height: 1.65;
}

.admin-placeholder-path {
  margin-top: 18px;
  color: var(--muted-foreground);
  font-size: 0.78rem;
}
</style>
