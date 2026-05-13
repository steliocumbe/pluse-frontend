<!--
  Data-driven Metronic sidebar. The visual shell (kt-sidebar / kt-sidebar-header /
  kt-sidebar-content / kt-menu classes) is preserved from the template so the
  styles.css rules in public/keenthemes/dist/assets/css/styles.css apply.
  Menu items come from src/config/sidebar-menu.js and are rendered by the
  recursive SidebarMenuItem component.
-->
<template>
  <aside
    class="kt-sidebar pluse-sidebar fixed top-0 bottom-0 z-20 hidden lg:flex flex-col items-stretch shrink-0 [--kt-drawer-enable:true] lg:[--kt-drawer-enable:false]"
    data-kt-drawer="true"
    data-kt-drawer-class="kt-drawer kt-drawer-start top-0 bottom-0"
    id="sidebar"
  >
    <!-- Sidebar header: logo -->
    <div
      class="kt-sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
      id="sidebar_header"
    >
      <router-link to="/" class="kt-sidebar-logo min-w-0 flex items-center">
        <span class="default-logo min-w-0 flex items-center gap-3">
          <span class="sidebar-logo-mark">P</span>
          <span class="min-w-0 flex flex-col leading-none">
            <span class="text-base font-bold text-white whitespace-nowrap">PLUSE</span>
            <span class="mt-1 text-[12px] font-medium text-white/58 whitespace-nowrap">Admin Console</span>
          </span>
        </span>
      </router-link>
    </div>

    <!--
      Sidebar content: scrollable menu. Height is set explicitly via the
      scoped style instead of relying on flex grow + min-h-0, because fixed
      top/bottom sidebars can produce indefinite flex sizes in some browsers.
    -->
    <div
      class="kt-sidebar-content kt-scroll overflow-y-auto py-5 ps-2 lg:ps-5 pe-1 lg:pe-3"
      id="sidebar_content"
    >
      <nav class="kt-menu flex flex-col gap-1" id="sidebar_menu">
        <SidebarMenuItem v-for="(item, idx) in visibleMenu" :key="item.to ?? item.label ?? idx" :item="item" />
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { sidebarMenu, filterMenuByGroups } from 'src/config/sidebar-menu'
import SidebarMenuItem from 'src/components/layout/SidebarMenuItem.vue'

const auth = useAuthStore()

const visibleMenu = computed(() => {
  if (auth.user?.is_superuser) return sidebarMenu
  return filterMenuByGroups(sidebarMenu, auth.user?.groups || [])
})

function clearCollapseState() {
  document.body.classList.remove('kt-sidebar-collapse')
  document.body.classList.remove('pluse-sidebar-collapsed')
}

onMounted(clearCollapseState)
onBeforeUnmount(clearCollapseState)
</script>

<style scoped>
.kt-sidebar-content {
  height: calc(100vh - var(--header-height, 70px));
}

.pluse-sidebar {
  border-inline-end: 1px solid var(--pluse-sidebar-border);
  background: var(--pluse-sidebar-bg);
  box-shadow: 18px 0 48px color-mix(in oklab, var(--pluse-navy-950) 18%, transparent);
}

.pluse-sidebar::before {
  position: absolute;
  inset: 0 0 auto;
  height: 180px;
  pointer-events: none;
  content: '';
  background: radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 70%);
}

.sidebar-logo-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  flex: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--pluse-cyan-500));
  color: white;
  font-size: 1rem;
  font-weight: 800;
  box-shadow: 0 12px 30px color-mix(in oklab, var(--primary) 32%, transparent);
}

@media (max-width: 1023.98px) {
  :global(.kt-drawer-open) .pluse-sidebar,
  .pluse-sidebar:global(.kt-drawer-open),
  .pluse-sidebar:global(.kt-drawer-shown) {
    display: flex !important;
  }
}

.kt-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.22) transparent;
}

.kt-scroll::-webkit-scrollbar {
  width: 6px;
}

.kt-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.22);
  border-radius: 999px;
}

.kt-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
