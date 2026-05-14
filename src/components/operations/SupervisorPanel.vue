<template>
  <AdminPageTemplate :eyebrow="eyebrow" :title="title" :description="description">
    <template #actions>
      <router-link to="/cco" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-chart-line" :size="16" icon-class="me-1.5" />
        Centro de comando
      </router-link>
      <router-link to="/supervisor/team" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-route" :size="16" icon-class="me-1.5" />
        Equipa em campo
      </router-link>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-stats">
        <article v-for="item in supervisorStats" :key="item.label" class="pluse-demo-stat" :class="item.tone">
          <span class="pluse-demo-stat-icon">
            <AppIcon :name="item.icon" :size="19" />
          </span>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.copy }}</p>
        </article>
      </section>

      <slot />
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { supervisorStats } from 'src/data/supervisorDemoData'

defineProps({
  eyebrow: { type: String, default: 'Supervisor' },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>
