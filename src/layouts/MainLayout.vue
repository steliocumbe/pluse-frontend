<template>
  <!--
    Metronic demo1 shell. Body receives `demo1 kt-sidebar-fixed kt-header-fixed`
    via useBodyClasses; that drives the CSS variables (--sidebar-width,
    --header-height) and offsets in styles.css (l. 15009+).
  -->

  <!-- Sidebar (verbatim transport from the Metronic template) -->
  <AppSidebar />

  <button
    v-if="sidebarHidden"
    type="button"
    class="sidebar-fab hidden lg:inline-flex"
    aria-label="Abrir menu lateral"
    title="Abrir menu lateral"
    @click="toggleSidebar"
  >
    <AppIcon name="ki-menu" :size="18" />
  </button>

  <!-- Wrapper: header + main.
       `min-h-screen` is needed because #q-app isn't a flex container, so
       `grow` alone doesn't stretch the wrapper to viewport height. Without
       this, pages with little content render with a short main area and
       the page-level background ends mid-screen. -->
  <div class="kt-wrapper flex flex-col min-h-screen">
    <AppHeader :sidebar-hidden="sidebarHidden" @toggle-sidebar="toggleSidebar">
      <template #left>
        <div class="flex items-center gap-3">
          <span class="admin-header-mark">
            <AppIcon name="ki-shield-tick" :size="18" />
          </span>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-mono leading-none">Administração PLUSE</span>
            <span class="text-xs text-muted-foreground mt-1">Operações, equipas e controlo</span>
          </div>
        </div>
      </template>
    </AppHeader>

    <LicenseBanner />

    <main class="flex-1 pt-5 flex flex-col" role="main">
      <router-view />
    </main>

    <LicenseExpiryModal />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useBodyClasses } from 'src/composables/useBodyClasses'
import AppSidebar from 'src/components/layout/AppSidebar.vue'
import AppHeader from 'src/components/layout/AppHeader.vue'
import LicenseBanner from 'src/components/layout/LicenseBanner.vue'
import LicenseExpiryModal from 'src/components/layout/LicenseExpiryModal.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const SIDEBAR_PREF_KEY = 'pluse.sidebar.hidden'
const sidebarHidden = ref(false)

const bodyClasses = computed(() => [
  'demo1',
  'kt-sidebar-fixed',
  'kt-header-fixed',
  ...(sidebarHidden.value ? ['pluse-sidebar-hidden'] : []),
])

// Apply Metronic body classes for the duration of this layout.
useBodyClasses(bodyClasses)

function persistSidebarState() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SIDEBAR_PREF_KEY, sidebarHidden.value ? '1' : '0')
}

function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value
  persistSidebarState()
}

// KTUI auto-init runs at <body> end, before Vue has rendered the sidebar/header.
// We must re-run KTComponents.init() once the DOM is in place so that
// data-kt-drawer / data-kt-menu / data-kt-scrollable / data-kt-sticky bind.
// Profile dropdown is Vue-native (AppDropdown) so it works without this.
onMounted(async () => {
  if (typeof window !== 'undefined') {
    sidebarHidden.value = window.localStorage.getItem(SIDEBAR_PREF_KEY) === '1'
  }

  await nextTick()
  if (typeof window !== 'undefined' && window.KTComponents?.init) {
    window.KTComponents.init()
  }
})
</script>

<style scoped>
.admin-header-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}

.sidebar-fab {
  position: fixed;
  top: calc(var(--header-height, 70px) + 16px);
  left: 16px;
  z-index: 35;
  width: 42px;
  height: 42px;
  border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  border-radius: 12px;
  display: inline-grid;
  place-items: center;
  background: color-mix(in oklab, var(--card) 88%, white 12%);
  color: var(--foreground);
  box-shadow: 0 12px 26px color-mix(in oklab, var(--primary) 20%, transparent);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.sidebar-fab:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px color-mix(in oklab, var(--primary) 30%, transparent);
  background: color-mix(in oklab, var(--primary) 8%, var(--card));
}
</style>
