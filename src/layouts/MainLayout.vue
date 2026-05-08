<template>
  <!--
    Metronic demo1 shell. Body receives `demo1 kt-sidebar-fixed kt-header-fixed
    flex h-full` via useBodyClasses; that drives the CSS variables (--sidebar-width,
    --header-height) and offsets in styles.css (l. 15009+).
  -->

  <!-- Sidebar (fixed on desktop, drawer on mobile) -->
  <aside
    class="kt-sidebar bg-background border-e border-e-border fixed top-0 bottom-0 z-30 flex flex-col items-stretch shrink-0 transition-transform lg:translate-x-0"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <div
      class="kt-sidebar-header flex items-center relative justify-between px-6 shrink-0 border-b border-border"
    >
      <router-link to="/" class="kt-sidebar-logo flex items-center gap-2 min-w-0">
        <span class="text-lg font-bold text-mono leading-none">PLUSE</span>
      </router-link>
      <button
        type="button"
        class="kt-btn kt-btn-ghost kt-btn-icon size-8 lg:hidden"
        :aria-label="'Fechar menu'"
        @click="mobileOpen = false"
      >
        <AppIcon name="ki-cross" :size="18" />
      </button>
    </div>

    <div class="kt-sidebar-content flex grow shrink-0 py-5 pe-2 overflow-y-auto">
      <nav class="grow ps-5 pe-3">
        <div class="kt-menu flex flex-col grow gap-1">
          <div class="kt-menu-item pt-2.25 pb-1.5">
            <span
              class="kt-menu-heading uppercase text-xs font-medium text-muted-foreground ps-[10px] pe-[10px]"
            >
              Operações
            </span>
          </div>
          <router-link
            v-for="item in operations"
            :key="item.to"
            v-slot="{ isActive, navigate }"
            :to="item.to"
            custom
          >
            <div
              class="kt-menu-item"
              :class="{ active: isActive }"
              @click="onNavigate(navigate)"
            >
              <a
                class="kt-menu-link flex items-center grow cursor-pointer border border-transparent gap-2.5 ps-2.5 pe-2.5 py-1.5 rounded-md hover:bg-accent/60"
              >
                <span class="kt-menu-icon items-start text-muted-foreground w-5">
                  <AppIcon :name="item.icon" :size="18" />
                </span>
                <span
                  class="kt-menu-title text-sm font-medium text-foreground"
                  :class="isActive && 'text-primary font-semibold'"
                >
                  {{ item.label }}
                </span>
              </a>
            </div>
          </router-link>

          <div class="kt-menu-item pt-4 pb-1.5">
            <span
              class="kt-menu-heading uppercase text-xs font-medium text-muted-foreground ps-[10px] pe-[10px]"
            >
              Cadastros
            </span>
          </div>
          <router-link
            v-for="item in registry"
            :key="item.to"
            v-slot="{ isActive, navigate }"
            :to="item.to"
            custom
          >
            <div
              class="kt-menu-item"
              :class="{ active: isActive }"
              @click="onNavigate(navigate)"
            >
              <a
                class="kt-menu-link flex items-center grow cursor-pointer border border-transparent gap-2.5 ps-2.5 pe-2.5 py-1.5 rounded-md hover:bg-accent/60"
              >
                <span class="kt-menu-icon items-start text-muted-foreground w-5">
                  <AppIcon :name="item.icon" :size="18" />
                </span>
                <span
                  class="kt-menu-title text-sm font-medium text-foreground"
                  :class="isActive && 'text-primary font-semibold'"
                >
                  {{ item.label }}
                </span>
              </a>
            </div>
          </router-link>
        </div>
      </nav>
    </div>
  </aside>

  <!-- Mobile backdrop -->
  <div
    v-if="mobileOpen"
    class="lg:hidden fixed inset-0 bg-black/50 z-20"
    aria-hidden="true"
    @click="mobileOpen = false"
  />

  <!-- Wrapper: header + main -->
  <div class="kt-wrapper flex grow flex-col">
    <header
      class="kt-header fixed top-0 z-10 start-0 end-0 flex items-stretch shrink-0 bg-background border-b border-border"
    >
      <div class="kt-container-fixed flex justify-between items-stretch lg:gap-4">
        <!-- Mobile logo + menu toggle -->
        <div class="flex gap-2.5 lg:hidden items-center -ms-1">
          <button
            type="button"
            class="kt-btn kt-btn-icon kt-btn-ghost"
            aria-label="Abrir menu"
            @click="mobileOpen = true"
          >
            <AppIcon name="ki-menu" :size="20" />
          </button>
          <router-link to="/" class="text-lg font-bold text-mono leading-none">
            PLUSE
          </router-link>
        </div>

        <!-- Right cluster: user + actions -->
        <div class="flex items-center gap-3 ms-auto">
          <span
            class="hidden sm:flex flex-col items-end leading-tight text-right"
          >
            <span class="text-sm font-medium text-foreground">
              {{ auth.user?.full_name || auth.user?.email }}
            </span>
            <span
              v-if="auth.user?.groups?.length"
              class="text-xs text-muted-foreground"
            >
              {{ auth.user.groups.join(', ') }}
            </span>
          </span>
          <button
            type="button"
            class="kt-btn kt-btn-outline kt-btn-sm"
            @click="onLogout"
          >
            <AppIcon name="ki-arrow-right" :size="14" icon-class="me-1" />
            Sair
          </button>
        </div>
      </div>
    </header>

    <main class="grow pt-5" role="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useBodyClasses } from 'src/composables/useBodyClasses'
import AppIcon from 'src/components/ui/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mobileOpen = ref(false)

// Apply Metronic body classes for the duration of this layout.
useBodyClasses('demo1 kt-sidebar-fixed kt-header-fixed flex h-full')

// Close the mobile drawer whenever the route changes.
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

const operations = [
  { to: '/', label: 'Dashboard', icon: 'ki-element-11' },
  { to: '/escalas', label: 'Escalas', icon: 'ki-calendar' },
  { to: '/presencas', label: 'Presenças', icon: 'ki-check-circle' },
  { to: '/ocorrencias', label: 'Ocorrências', icon: 'ki-warning-2' },
]

const registry = [
  { to: '/colaboradores', label: 'Colaboradores', icon: 'ki-people' },
  { to: '/clientes', label: 'Clientes', icon: 'ki-shop' },
  { to: '/contratos', label: 'Contratos', icon: 'ki-document' },
  { to: '/postos', label: 'Postos', icon: 'ki-geolocation' },
]

function onNavigate(navigate) {
  navigate()
  mobileOpen.value = false
}

async function onLogout() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>

<style scoped>
.kt-sidebar {
  width: var(--sidebar-width, 280px);
}
</style>
