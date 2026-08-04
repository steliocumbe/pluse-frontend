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
          <img src="/icons/android-chrome-192x192.png" alt="" class="sidebar-logo-mark" />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { sidebarMenu, filterMenuByGroups } from 'src/config/sidebar-menu'
import { usePendingCounts } from 'src/composables/usePendingCounts'
import { financeSystemSettingService } from 'src/services/finance.service'
import SidebarMenuItem from 'src/components/layout/SidebarMenuItem.vue'

const auth = useAuthStore()
const { counts } = usePendingCounts()
const accessMap = ref(new Map())

/**
 * Mapa: rota → chave em `counts`.
 * Quando há um valor > 0, o item da sidebar mostra o badge.
 */
const ROUTE_BADGES = {
  '/employees/approvals': 'rh_approvals_total',
  '/leaves': 'leaves_pending',
  '/sick-leaves': 'sick_leaves_pending',
  '/incidents': 'incidents_open',
  '/participations': 'participations_open',
  '/cco': 'incidents_critical',
  '/supervisor/patrols': 'patrols_planned',
  '/assets/equipment': 'equipment_overdue',
}

/**
 * Aplica badges dinâmicos numa árvore de menu sem mutar o original.
 * Itera recursivamente em `children` para suportar subníveis.
 */
function injectBadges(items) {
  return items.map((item) => {
    const next = { ...item }
    if (item.to && ROUTE_BADGES[item.to]) {
      const countKey = ROUTE_BADGES[item.to]
      const value = counts.value[countKey] ?? 0
      if (value > 0) next.badge = value
    }
    if (Array.isArray(item.children)) {
      next.children = injectBadges(item.children)
    }
    return next
  })
}

function deriveSecurityLevel(groups = []) {
  const normalized = (groups || []).map((g) => String(g || '').trim().toLowerCase())

  if (normalized.some((g) => ['estrategico', 'estratégico', 'direcao', 'admin', 'administrador'].includes(g))) {
    return 'strategic'
  }
  if (normalized.some((g) => ['tatico', 'tático', 'supervisor', 'financeiro', 'rh', 'cco'].includes(g))) {
    return 'tactical'
  }
  return 'operational'
}

function isRouteAllowed(route, level) {
  if (!route) return true
  const rule = accessMap.value.get(route)
  if (!rule) return true
  if (level === 'strategic') return !!rule.strategic_enabled
  if (level === 'tactical') return !!rule.tactical_enabled
  return !!rule.operational_enabled
}

function filterBySecurityLevel(menu, level) {
  const result = []

  for (let i = 0; i < menu.length; i += 1) {
    const item = menu[i]
    if (item?.type === 'heading') {
      const sectionItems = []
      for (let j = i + 1; j < menu.length; j += 1) {
        if (menu[j]?.type === 'heading') break
        sectionItems.push(menu[j])
      }

      const visibleAny = sectionItems.some((next) => {
        if (!next) return false
        return isRouteAllowed(next.to, level)
      })
      if (visibleAny) result.push(item)
      continue
    }

    if (isRouteAllowed(item?.to, level)) {
      result.push(item)
    }
  }

  return result
}

async function loadSecurityMatrix() {
  if (!auth.isAuthenticated) return
  try {
    const data = await financeSystemSettingService.get()
    const tabs = Array.isArray(data?.security_tabs) ? data.security_tabs : []
    accessMap.value = new Map(
      tabs
        .filter((row) => row?.tab_route)
        .map((row) => [row.tab_route, row]),
    )
  } catch {
    accessMap.value = new Map()
  }
}

const visibleMenu = computed(() => {
  const base = auth.user?.is_superuser
    ? sidebarMenu
    : filterMenuByGroups(sidebarMenu, auth.user?.groups || [])
  const level = deriveSecurityLevel(auth.user?.groups || [])
  const filtered = filterBySecurityLevel(base, level)
  return injectBadges(filtered)
})

onMounted(loadSecurityMatrix)

watch(
  () => auth.user?.id,
  () => {
    loadSecurityMatrix()
  },
)
</script>

<style scoped>
.kt-sidebar-content {
  height: calc(100vh - var(--header-height, 70px));
  overflow-x: hidden;
}

.pluse-sidebar {
  border-inline-end: 1px solid var(--pluse-sidebar-border);
  background: var(--pluse-sidebar-bg);
  box-shadow: 18px 0 48px color-mix(in oklab, var(--pluse-navy-950) 18%, transparent);
  transition:
    transform 180ms ease,
    opacity 140ms ease;
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
  width: 40px;
  height: 40px;
  flex: none;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  background: white;
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
  overflow-x: hidden;
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
