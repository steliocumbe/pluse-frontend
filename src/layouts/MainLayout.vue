<template>
  <!--
    Metronic demo1 shell. Body receives `demo1 kt-sidebar-fixed kt-header-fixed`
    via useBodyClasses; that drives the CSS variables (--sidebar-width,
    --header-height) and offsets in styles.css (l. 15009+).
  -->

  <!-- Sidebar (verbatim transport from the Metronic template) -->
  <AppSidebar />

  <!-- Wrapper: header + main.
       `min-h-screen` is needed because #q-app isn't a flex container, so
       `grow` alone doesn't stretch the wrapper to viewport height. Without
       this, pages with little content render with a short main area and
       the page-level background ends mid-screen. -->
  <div class="kt-wrapper flex flex-col min-h-screen">
    <AppHeader>
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
  </div>
</template>

<script setup>
import { nextTick, onMounted } from 'vue'
import { useBodyClasses } from 'src/composables/useBodyClasses'
import AppSidebar from 'src/components/layout/AppSidebar.vue'
import AppHeader from 'src/components/layout/AppHeader.vue'
import LicenseBanner from 'src/components/layout/LicenseBanner.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

// Apply Metronic body classes for the duration of this layout.
useBodyClasses('demo1 kt-sidebar-fixed kt-header-fixed')

// KTUI auto-init runs at <body> end, before Vue has rendered the sidebar/header.
// We must re-run KTComponents.init() once the DOM is in place so that
// data-kt-drawer / data-kt-menu / data-kt-scrollable / data-kt-sticky bind.
// Profile dropdown is Vue-native (AppDropdown) so it works without this.
onMounted(async () => {
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
</style>
