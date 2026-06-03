<!--
  /profile — Meu perfil.

  Shell com tabs Conta · Segurança · Sessões. As tabs futuras (Trabalho,
  Notificações) entram nas Fases 2 e 3.
-->
<template>
  <AdminPageTemplate
    eyebrow="Conta"
    title="Meu perfil"
    description="Gere os teus dados pessoais, segurança e sessões activas."
  >
    <template #meta>
      <span v-if="auth.user" class="admin-meta-chip">
        <AppIcon name="ki-profile-circle" :size="14" />
        {{ auth.user.full_name || auth.user.email }}
      </span>
      <span v-for="g in groups" :key="g" class="admin-meta-chip">
        {{ g }}
      </span>
    </template>

    <!-- Tabs -->
    <nav class="profile-tabs-bar" role="tablist" aria-label="Secções do perfil">
      <button
        v-for="tab in tabsDef"
        :key="tab.name"
        type="button" role="tab"
        :aria-selected="activeTab === tab.name"
        class="profile-tab"
        :class="{ 'is-active': activeTab === tab.name }"
        @click="activeTab = tab.name"
      >
        <q-icon :name="tab.icon" size="17px" class="profile-tab__icon" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <div class="profile-panels">
      <ProfileAccountTab v-if="activeTab === 'account'" />
      <ProfileSecurityTab v-else-if="activeTab === 'security'" />
      <ProfileSessionsTab v-else-if="activeTab === 'sessions'" />
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import ProfileAccountTab from 'src/pages/profile/ProfileAccountTab.vue'
import ProfileSecurityTab from 'src/pages/profile/ProfileSecurityTab.vue'
import ProfileSessionsTab from 'src/pages/profile/ProfileSessionsTab.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const groups = computed(() => auth.user?.groups || [])

const VALID_TABS = ['account', 'security', 'sessions']
const activeTab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'account')

const tabsDef = [
  { name: 'account', icon: 'badge', label: 'Conta' },
  { name: 'security', icon: 'lock', label: 'Segurança' },
  { name: 'sessions', icon: 'devices', label: 'Sessões' },
]

watch(activeTab, (next) => {
  if (next === (route.query.tab || 'account')) return
  router.replace({ query: { ...route.query, tab: next === 'account' ? undefined : next } })
})
</script>

<style scoped>
/* ── Tabs (mesmo padrão minimalista do ClientDetailPage) ────────────── */
.profile-tabs-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 22px;
  padding: 0 4px;
  border-bottom: 1px solid var(--border);
}
.profile-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 12px;
  margin-bottom: -1px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted-foreground);
  cursor: pointer;
  white-space: nowrap;
  border-radius: 6px 6px 0 0;
  transition: color 180ms ease, border-color 200ms ease, background-color 160ms ease;
}
.profile-tab:hover:not(.is-active) {
  color: var(--foreground);
  background: color-mix(in oklab, var(--muted) 40%, transparent);
}
.profile-tab.is-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.profile-tab__icon {
  color: color-mix(in oklab, var(--muted-foreground) 80%, transparent);
  transition: color 180ms ease;
  flex: none;
}
.profile-tab.is-active .profile-tab__icon { color: var(--primary); }

.profile-panels {
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .profile-tabs-bar {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .profile-tabs-bar::-webkit-scrollbar { display: none; }
  .profile-tab { padding: 12px 14px 10px; font-size: 0.82rem; }
}
</style>
