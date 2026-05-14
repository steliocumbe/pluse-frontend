<template>
  <!-- Section heading (e.g. "OPERACOES") -->
  <div v-if="item.type === 'heading'" class="kt-menu-item pt-4 pb-1">
    <span class="kt-menu-heading uppercase text-xs font-semibold text-white/42 ps-[10px] pe-[10px]">
      {{ item.label }}
    </span>
  </div>

  <!-- Visual divider -->
  <div v-else-if="item.type === 'divider'" class="my-2 mx-2.5 border-t border-white/10" />

  <!-- Group with children (collapsible accordion) -->
  <div v-else-if="hasChildren" class="kt-menu-item" :class="{ active: hasActiveDescendant, 'kt-menu-item-show': expanded }">
    <button
      type="button"
      class="kt-menu-link sidebar-menu-link flex flex-nowrap items-center grow cursor-pointer border border-transparent gap-2.5 ps-2.5 pe-2.5 py-1.5 rounded-md w-full text-left"
      :aria-expanded="expanded"
      @click="toggleGroup"
    >
      <span v-if="item.icon" class="kt-menu-icon items-start text-white/52 w-5 shrink-0">
        <AppIcon :name="item.icon" :size="18" />
      </span>
      <!--
        `min-w-0 truncate` is what keeps the arrow on the side: flex items
        default to `min-width: auto` (≈ content size), so a long label would
        push the arrow off the row. min-w-0 lets the title shrink; truncate
        keeps it on a single line with an ellipsis.
        The `title` attribute exposes the full text on hover.
      -->
      <span
        class="kt-menu-title text-sm font-medium grow min-w-0 truncate"
        :class="hasActiveDescendant ? 'text-white font-semibold' : 'text-white/74'"
        :title="item.label"
      >
        {{ item.label }}
      </span>
      <span v-if="item.badge" class="shrink-0">
        <SidebarBadge :value="item.badge" />
      </span>
      <span class="kt-menu-arrow text-white/42 w-5 shrink-0 flex justify-end">
        <AppIcon :name="expanded ? 'ki-minus' : 'ki-plus'" :size="11" />
      </span>
    </button>

    <transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      enter-from-class="grid-rows-[0fr] opacity-0"
      enter-to-class="grid-rows-[1fr] opacity-100"
      leave-from-class="grid-rows-[1fr] opacity-100"
      leave-to-class="grid-rows-[0fr] opacity-0"
    >
      <div
        v-show="expanded"
        class="kt-menu-accordion grid ps-[10px] relative before:absolute before:start-[20px] before:top-0 before:bottom-0 before:border-s before:border-white/12"
      >
        <div class="overflow-hidden">
          <div class="flex flex-col gap-0.5 pt-1">
        <SidebarMenuItem
          v-for="(child, idx) in item.children"
          :key="child.to ?? child.label ?? idx"
          :item="child"
          :nested="true"
        />
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- External/new-tab leaf link -->
  <div v-else-if="item.external" class="kt-menu-item">
    <a
      :href="item.to ?? '#'"
      target="_blank"
      rel="noopener noreferrer"
      class="kt-menu-link sidebar-menu-link border border-transparent items-center grow flex flex-nowrap gap-[14px] ps-[10px] pe-[10px] py-[8px]"
      @click="closeMobileDrawer"
    >
      <template v-if="!nested">
        <span v-if="item.icon" class="kt-menu-icon items-start text-white/52 w-5 shrink-0">
          <AppIcon :name="item.icon" :size="18" />
        </span>
      </template>
      <template v-else>
        <span class="kt-menu-bullet flex w-[6px] -start-[3px] rtl:start-0 relative shrink-0">
          <span class="absolute top-1/2 size-[6px] rounded-full -translate-y-1/2 bg-transparent" />
        </span>
      </template>
      <span class="kt-menu-title text-sm font-normal grow min-w-0 truncate text-white/74" :title="item.label">
        {{ item.label }}
      </span>
      <AppIcon name="ki-exit-right" :size="13" icon-class="text-white/42 shrink-0" />
      <SidebarBadge v-if="item.badge" :value="item.badge" class="shrink-0" />
    </a>
  </div>

  <!-- Leaf link -->
  <router-link v-else :to="item.to ?? '#'" custom v-slot="{ navigate, href, isActive, isExactActive }">
    <div class="kt-menu-item" :class="{ active: isLeafActive(isActive, isExactActive) }">
      <a
        :href="href"
        class="kt-menu-link sidebar-menu-link border border-transparent items-center grow flex flex-nowrap gap-[14px] ps-[10px] pe-[10px] py-[8px]"
        :class="isLeafActive(isActive, isExactActive) ? 'sidebar-menu-link-active rounded-lg' : ''"
        @click="onLeafClick(navigate)"
      >
        <!-- Top-level link gets icon, nested links get a bullet -->
        <template v-if="!nested">
          <span v-if="item.icon" class="kt-menu-icon items-start text-white/52 w-5 shrink-0">
            <AppIcon :name="item.icon" :size="18" :icon-class="isLeafActive(isActive, isExactActive) ? 'text-white' : ''" />
          </span>
        </template>
        <template v-else>
          <span class="kt-menu-bullet flex w-[6px] -start-[3px] rtl:start-0 relative shrink-0">
            <span
              class="absolute top-1/2 size-[6px] rounded-full -translate-y-1/2"
              :class="isLeafActive(isActive, isExactActive) ? 'bg-white' : 'bg-transparent'"
            />
          </span>
        </template>
        <span
          class="kt-menu-title text-sm font-normal grow min-w-0 truncate"
          :class="isLeafActive(isActive, isExactActive) ? 'text-white font-semibold' : 'text-white/74'"
          :title="item.label"
        >
          {{ item.label }}
        </span>
        <SidebarBadge v-if="item.badge" :value="item.badge" class="shrink-0" />
      </a>
    </div>
  </router-link>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import SidebarBadge from 'src/components/layout/SidebarBadge.vue'

const props = defineProps({
  item: { type: Object, required: true },
  nested: { type: Boolean, default: false },
})

const route = useRoute()
const accordionId = `sidebar-item-${Math.random().toString(36).slice(2)}`

const hasChildren = computed(
  () => Array.isArray(props.item.children) && props.item.children.length > 0,
)

function hasActive(items) {
  return items.some((it) => {
    if (it.children) return hasActive(it.children)
    if (!it.to) return false
    return route.path === it.to || route.path.startsWith(it.to + '/')
  })
}

const hasActiveDescendant = computed(() => {
  if (!hasChildren.value) return false
  return hasActive(props.item.children)
})

const expanded = ref(hasActiveDescendant.value)

watch(hasActiveDescendant, (active) => {
  if (active) expanded.value = true
})

function toggleGroup() {
  const nextValue = !expanded.value
  expanded.value = nextValue

  if (nextValue && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pluse-sidebar-group-opened', {
        detail: { id: accordionId },
      }),
    )
  }
}

function handleGroupOpened(event) {
  if (event.detail?.id !== accordionId) {
    expanded.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pluse-sidebar-group-opened', handleGroupOpened)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pluse-sidebar-group-opened', handleGroupOpened)
  }
})

function closeMobileDrawer() {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return

  const sidebar = document.querySelector('#sidebar')
  const drawer = sidebar && window.KTDrawer?.getInstance?.(sidebar)

  if (drawer?.hide) {
    drawer.hide()
    return
  }

  if (drawer?.close) {
    drawer.close()
    return
  }

  sidebar?.classList.remove('open', 'kt-drawer-open', 'kt-drawer-shown')
  document.body.classList.remove('kt-drawer-open')
  document.querySelectorAll('.kt-drawer-backdrop, [data-kt-drawer-backdrop]').forEach((el) => el.remove())
}

function onLeafClick(navigate) {
  navigate()
  closeMobileDrawer()
}

function isLeafActive(isActive, isExactActive) {
  if (props.item.to === '/') return isExactActive
  return isActive || isExactActive
}
</script>

<style scoped>
.sidebar-menu-link {
  position: relative;
  display: flex !important;
  align-items: center !important;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  flex-wrap: nowrap !important;
  line-height: 1.2;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.sidebar-menu-link .kt-menu-title {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  font-size: 1.0rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.kt-menu-item,
.kt-menu-accordion,
.kt-menu-accordion > div {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.sidebar-menu-link .kt-menu-icon,
.sidebar-menu-link .kt-menu-arrow,
.sidebar-menu-link .kt-menu-bullet {
  align-self: center;
  flex: none;
}

.kt-menu-heading {
  font-size: 0.78rem;
}

.sidebar-menu-link:hover {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.07);
  transform: translateX(2px);
}

.sidebar-menu-link-active {
  border-color: rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--primary) 34%, transparent), rgba(255, 255, 255, 0.08));
  box-shadow: inset 3px 0 0 var(--pluse-cyan-500);
}
</style>
