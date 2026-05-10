<!--
  Data-driven Metronic sidebar. The visual shell (kt-sidebar / kt-sidebar-header /
  kt-sidebar-content / kt-menu classes) is preserved from the template so the
  styles.css rules in public/keenthemes/dist/assets/css/styles.css apply.
  Menu items come from src/config/sidebar-menu.js and are rendered by the
  recursive SidebarMenuItem component.
-->
<template>
  <aside
    class="kt-sidebar bg-background border-e border-e-border fixed top-0 bottom-0 z-20 hidden lg:flex flex-col items-stretch shrink-0 [--kt-drawer-enable:true] lg:[--kt-drawer-enable:false]"
    data-kt-drawer="true"
    data-kt-drawer-class="kt-drawer kt-drawer-start top-0 bottom-0"
    id="sidebar"
    @mouseleave="onSidebarMouseLeave"
  >
    <!-- Sidebar header: logo + collapse toggle -->
    <div
      class="kt-sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
      id="sidebar_header"
    >
      <router-link to="/" class="kt-sidebar-logo min-w-0 flex items-center gap-2">
        <span class="default-logo text-lg font-bold text-mono leading-none whitespace-nowrap">
          PLUSE
        </span>
        <span class="small-logo text-sm font-bold text-mono leading-none">
          P
        </span>
      </router-link>
      <button
        class="kt-btn kt-btn-outline kt-btn-icon size-[30px] absolute start-full top-2/4 z-40 -translate-x-2/4 -translate-y-2/4 rtl:translate-x-2/4"
        type="button"
        id="sidebar_toggle"
        :aria-label="collapsed ? 'Expandir menu' : 'Colapsar menu'"
        @click="toggleSidebarCollapse"
      >
        <AppIcon
          name="ki-black-left-line"
          :size="14"
          :icon-class="`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`"
        />
      </button>
    </div>

    <!--
      Sidebar content: scrollable menu. Height is set explicitly via the
      scoped `<style>` (calc(100vh - var(--header-height))) instead of
      relying on flex `grow` + `min-h-0`. Flex-based height propagation
      was unreliable here — likely because the aside's height comes from
      `top-0 + bottom-0` (auto-resolved) rather than an explicit `height`,
      so the flex container's main-axis size was treated as indefinite by
      the layout engine and children couldn't shrink with `overflow`.
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
import { computed, onBeforeUnmount, provide, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { sidebarMenu, filterMenuByGroups } from 'src/config/sidebar-menu'
import AppIcon from 'src/components/ui/AppIcon.vue'
import SidebarMenuItem from 'src/components/layout/SidebarMenuItem.vue'

const auth = useAuthStore()

// Filter the menu by the authenticated user's groups so people only see
// what's relevant to their role. Superusers and unmatched entries (no
// `roles` set) are visible to everyone.
const visibleMenu = computed(() => {
  if (auth.user?.is_superuser) return sidebarMenu
  return filterMenuByGroups(sidebarMenu, auth.user?.groups || [])
})

// Sidebar collapse toggle — adds/removes `kt-sidebar-collapse` on <body>,
// which the Metronic CSS reads (styles.css l. 15061+) to switch the sidebar
// between 280px (expanded) and 80px (collapsed) widths.
const COLLAPSE_CLASS = 'kt-sidebar-collapse'
const collapsed = ref(false)

// Share the collapsed state with descendant SidebarMenuItem components so
// they can auto-close their accordions when the sidebar shrinks.
provide('sidebarCollapsed', collapsed)

// Separate signal that fires when the user's mouse leaves a hover-expanded
// (but JS-collapsed) sidebar. The `collapsed` ref doesn't change in that
// scenario — only the CSS-driven width does — so we need a distinct
// channel to tell descendants "close accordions now". A counter that
// monotonically increments triggers the watch in each SidebarMenuItem.
const forceCloseTick = ref(0)
provide('sidebarForceCloseTick', forceCloseTick)

function toggleSidebarCollapse() {
  collapsed.value = !collapsed.value
  document.body.classList.toggle(COLLAPSE_CLASS, collapsed.value)
}

function onSidebarMouseLeave() {
  // Only act when JS-collapsed: at that moment CSS shrinks the sidebar
  // back from its hover-expanded 280px to the 80px collapsed width, and
  // any accordion the user opened during hover would otherwise overflow.
  if (collapsed.value) {
    forceCloseTick.value += 1
  }
}

onBeforeUnmount(() => {
  document.body.classList.remove(COLLAPSE_CLASS)
})
</script>

<style scoped>
/*
 * Explicit height for the scrollable region. `--header-height` is set by
 * the Metronic CSS (.demo1 { --header-height: 70px; }, 60px on mobile).
 * Falling back to 70px keeps it sane if those vars are ever missing.
 */
.kt-sidebar-content {
  height: calc(100vh - var(--header-height, 70px));
}

/* Slim, themed scrollbar for the menu (matches Metronic's kt-scrollable look). */
.kt-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--color-zinc-300) transparent;
}
.kt-scroll::-webkit-scrollbar {
  width: 6px;
}
.kt-scroll::-webkit-scrollbar-thumb {
  background: var(--color-zinc-300);
  border-radius: 999px;
}
.kt-scroll::-webkit-scrollbar-track {
  background: transparent;
}
:global(.dark) .kt-scroll {
  scrollbar-color: var(--color-zinc-700) transparent;
}
:global(.dark) .kt-scroll::-webkit-scrollbar-thumb {
  background: var(--color-zinc-700);
}
</style>
