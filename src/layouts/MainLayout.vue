<template>
  <!--
    Metronic demo1 shell. Body receives `demo1 kt-sidebar-fixed kt-header-fixed
    flex h-full` via useBodyClasses; that drives the CSS variables (--sidebar-width,
    --header-height) and offsets in styles.css (l. 15009+).
  -->

  <!-- Sidebar (verbatim transport from the Metronic template) -->
  <AppSidebar />

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
            data-kt-drawer-toggle="#sidebar"
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
import { nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useBodyClasses } from 'src/composables/useBodyClasses'
import AppIcon from 'src/components/ui/AppIcon.vue'
import AppSidebar from 'src/components/layout/AppSidebar.vue'

const router = useRouter()
const auth = useAuthStore()

// Apply Metronic body classes for the duration of this layout.
useBodyClasses('demo1 kt-sidebar-fixed kt-header-fixed flex h-full')

// KTUI auto-init runs at <body> end, before Vue has rendered the sidebar/header.
// We must re-run KTComponents.init() once the DOM is in place so that
// data-kt-drawer, data-kt-menu, data-kt-scrollable, data-kt-sticky etc. bind.
onMounted(async () => {
  await nextTick()
  if (typeof window !== 'undefined' && window.KTComponents?.init) {
    window.KTComponents.init()
  }
})

async function onLogout() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>
