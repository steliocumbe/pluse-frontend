<!--
  User dropdown — Metronic markup adapted for PLUSE.
  Original: keenthemes/demo/index.html lines 5000-5219.

  Adaptations:
    - <i class="ki-..."> → <AppIcon name="ki-..."> (keenicons font missing)
    - Static avatar/name/email → reactive from auth store
    - "Pro" badge → user's primary group name (e.g. CCO, Admin)
    - "Log out" link → real logout action
    - "Dark Mode" toggle → wired to useTheme() composable
    - Dev Forum / Language sections trimmed (irrelevant for PLUSE MVP)
-->
<template>
  <AppDropdown placement="bottom-end" width="260px">
    <template #toggle>
      <div class="shrink-0">
        <div
          class="size-9 rounded-full border-2 border-green-500 shrink-0 bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary"
          :title="auth.user?.full_name || auth.user?.email || 'Utilizador'"
        >
          {{ initials }}
        </div>
      </div>
    </template>

    <template #default="{ close }">
      <!-- Header: avatar + name + email + role badge -->
      <div class="flex items-center justify-between px-2.5 py-1.5 gap-1.5">
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="size-9 shrink-0 rounded-full border-2 border-green-500 bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary"
          >
            {{ initials }}
          </div>
          <div class="flex flex-col gap-1 min-w-0">
            <span class="text-sm text-foreground font-semibold leading-none truncate">
              {{ auth.user?.full_name || 'Sem nome' }}
            </span>
            <span class="text-xs text-secondary-foreground font-medium leading-none truncate">
              {{ auth.user?.email }}
            </span>
          </div>
        </div>
        <span
          v-if="primaryRole"
          class="rounded-full text-[10px] font-medium px-1.5 py-0.5 leading-none bg-primary/15 text-primary border border-primary/30"
        >
          {{ primaryRole }}
        </span>
      </div>

      <ul class="kt-dropdown-menu-sub flex flex-col">
        <li>
          <div class="border-t border-border my-1.5" />
        </li>
        <li>
          <router-link to="/perfil" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-profile-circle" :size="16" icon-class="text-muted-foreground" />
            Meu perfil
          </router-link>
        </li>
        <li>
          <router-link to="/perfil/password" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-key" :size="16" icon-class="text-muted-foreground" />
            Alterar senha
          </router-link>
        </li>
        <li>
          <router-link to="/perfil/sessoes" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-shield-tick" :size="16" icon-class="text-muted-foreground" />
            Sessões activas
          </router-link>
        </li>
        <li>
          <router-link to="/perfil/preferencias" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-setting-2" :size="16" icon-class="text-muted-foreground" />
            Preferências
          </router-link>
        </li>
        <li v-if="auth.user?.is_staff || auth.user?.is_superuser">
          <div class="border-t border-border my-1.5" />
        </li>
        <li v-if="auth.user?.is_staff || auth.user?.is_superuser">
          <a
            :href="adminUrl"
            target="_blank"
            rel="noopener"
            class="kt-dropdown-menu-link"
            @click="close"
          >
            <AppIcon name="ki-shield" :size="16" icon-class="text-muted-foreground" />
            Django admin
            <AppIcon name="ki-arrow-right" :size="12" icon-class="ms-auto text-muted-foreground" />
          </a>
        </li>
        <li>
          <router-link to="/ajuda/contacto" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-information-3" :size="16" icon-class="text-muted-foreground" />
            Suporte
          </router-link>
        </li>
        <li>
          <div class="border-t border-border my-1.5" />
        </li>
      </ul>

      <!-- Theme toggle + logout -->
      <div class="px-2.5 pt-1.5 pb-2.5 flex flex-col gap-3.5">
        <div class="flex items-center gap-2 justify-between px-1">
          <span class="flex items-center gap-2">
            <AppIcon
              :name="isDark ? 'ki-sun' : 'ki-moon'"
              :size="16"
              icon-class="text-muted-foreground"
            />
            <span class="font-medium text-sm">
              {{ isDark ? 'Tema claro' : 'Tema escuro' }}
            </span>
          </span>
          <AppSwitch
            :model-value="isDark"
            size="sm"
            aria-label="Alternar tema escuro"
            @update:model-value="toggleDark"
          />
        </div>
        <button
          type="button"
          class="kt-btn kt-btn-outline justify-center w-full"
          :disabled="auth.loading"
          @click="onLogout(close)"
        >
          <AppIcon name="ki-arrow-left" :size="14" icon-class="me-1.5" />
          Sair
        </button>
      </div>
    </template>
  </AppDropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useTheme } from 'src/composables/useTheme'
import AppDropdown from 'src/components/ui/AppDropdown.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppSwitch from 'src/components/ui/AppSwitch.vue'

const auth = useAuthStore()
const router = useRouter()
const { isDark, toggleDark } = useTheme()

const apiBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')
const adminUrl = `${apiBase}/admin/`

// 2-letter initials from full_name or fallback to first letter of email.
const initials = computed(() => {
  const name = auth.user?.full_name?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
  }
  return (auth.user?.email?.[0] || '?').toUpperCase()
})

// Show the most relevant group as a badge. Skip technical "Administrador" for
// non-admins (backend sends groups list); fall back to the first.
const primaryRole = computed(() => {
  const groups = auth.user?.groups || []
  if (groups.length === 0) return null
  // Prefer Admin if user is staff/superuser, else first group
  if (auth.user?.is_superuser) return 'Admin'
  return groups[0]
})

async function onLogout(close) {
  close()
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<style scoped>
/*
 * Local styles for the dropdown link rows. Mirrors Metronic's
 * `.kt-dropdown-menu-link` look without depending on the (sometimes finicky)
 * KTUI utilities being present.
 */
.kt-dropdown-menu-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.4rem 0.625rem;
  font-size: 0.8125rem;
  color: var(--foreground);
  text-decoration: none;
  border-radius: 0.375rem;
  margin: 0 0.375rem;
  transition: background-color 0.15s ease;
}
.kt-dropdown-menu-link:hover {
  background-color: var(--accent);
}

/* (Theme toggle styling moved to AppSwitch.vue — button-based, no
   browser checkbox quirks.) */
</style>
