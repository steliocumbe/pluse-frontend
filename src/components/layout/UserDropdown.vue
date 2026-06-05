<!--
  User dropdown — Metronic markup adapted for PLUSE.
  Original: keenthemes/demo/index.html lines 5000-5219.

  Adaptations:
    - <i class="ki-..."> → <AppIcon name="ki-..."> (keenicons font missing)
    - Static avatar/name/email → reactive from auth store
    - "Pro" badge → user's primary group name (e.g. Centro de Controlo Operacional, Admin)
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
          <router-link :to="{ name: 'profile' }" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-profile-circle" :size="16" icon-class="text-muted-foreground" />
            Meu perfil
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'profile', query: { tab: 'security' } }" class="kt-dropdown-menu-link" @click="close">
            <AppIcon name="ki-key" :size="16" icon-class="text-muted-foreground" />
            Alterar senha
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'profile', query: { tab: 'sessions' } }" class="kt-dropdown-menu-link" @click="close">
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
          class="logout-btn justify-center w-full inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
          :disabled="auth.loading"
          @click="askLogout(close)"
        >
          <AppIcon name="ki-arrow-left" :size="14" />
          Terminar sessão
        </button>
      </div>
    </template>
  </AppDropdown>

  <!-- Logout confirmation modal -->
  <AppModal v-model="showLogoutConfirm" size="md">
    <div class="p-6 flex flex-col items-center text-center">
      <span class="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AppIcon name="ki-warning-2" :size="24" icon-class="text-destructive" />
      </span>
      <AppHeading :level="3" class="text-base font-semibold text-mono leading-tight mb-1.5">
        Terminar sessão?
      </AppHeading>
      <p class="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
        Vais ter de iniciar sessão outra vez para voltar a usar o PLUSE.
        Quaisquer alterações não guardadas serão perdidas.
      </p>
    </div>
    <div class="px-6 pb-6 flex gap-2.5">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        :disabled="loggingOut"
        @click="showLogoutConfirm = false"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-destructive text-destructive-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        :disabled="loggingOut"
        @click="confirmLogout"
      >
        <AppIcon
          v-if="loggingOut"
          name="loader-circle"
          :size="14"
          icon-class="animate-spin"
        />
        <AppIcon v-else name="ki-arrow-left" :size="14" />
        {{ loggingOut ? 'A sair…' : 'Sim, terminar sessão' }}
      </button>
    </div>
  </AppModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useTheme } from 'src/composables/useTheme'
import AppDropdown from 'src/components/ui/AppDropdown.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppSwitch from 'src/components/ui/AppSwitch.vue'
import AppModal from 'src/components/ui/AppModal.vue'
import AppHeading from 'src/components/ui/AppHeading.vue'

const auth = useAuthStore()
const router = useRouter()
const { isDark, toggleDark } = useTheme()

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

// Logout flow: dropdown click only OPENS the confirmation modal. The actual
// logout happens after the user confirms — a small friction step that
// prevents accidental sign-outs (especially on touch devices) and gives a
// chance to save in-progress work.
const showLogoutConfirm = ref(false)
const loggingOut = ref(false)

function askLogout(closeDropdown) {
  closeDropdown?.()
  showLogoutConfirm.value = true
}

async function confirmLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await auth.logout()
  } finally {
    loggingOut.value = false
    showLogoutConfirm.value = false
    await router.replace({ name: 'login' })
  }
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

/* (Theme toggle styling moved to AppSwitch.vue.) */

/*
 * Logout button — destructive emphasis. Default state is a calm tinted
 * variant (so the dropdown doesn't feel alarmist) that flips to full
 * destructive on hover, signalling "you're about to leave the system."
 */
.logout-btn {
  border-color: color-mix(in oklab, var(--destructive) 30%, transparent);
  background-color: color-mix(in oklab, var(--destructive) 8%, transparent);
  color: var(--destructive);
}
.logout-btn:hover:not(:disabled) {
  background-color: var(--destructive);
  color: var(--destructive-foreground);
  border-color: var(--destructive);
}
.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
