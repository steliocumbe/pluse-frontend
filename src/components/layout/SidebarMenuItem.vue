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
      class="kt-menu-link sidebar-menu-link flex items-center grow cursor-pointer border border-transparent gap-2.5 ps-2.5 pe-2.5 py-1.5 rounded-md w-full text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span v-if="item.icon" class="kt-menu-icon items-start text-white/52 w-5 shrink-0">
        <AppIcon :name="item.icon" :size="18" />
      </span>
      <span
        class="kt-menu-title text-sm font-medium grow"
        :class="hasActiveDescendant ? 'text-white font-semibold' : 'text-white/74'"
      >
        {{ item.label }}
      </span>
      <span v-if="item.badge" class="me-1">
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
            <SidebarMenuItem v-for="(child, idx) in item.children" :key="child.to ?? child.label ?? idx" :item="child" :nested="true" />
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Leaf link -->
  <router-link v-else :to="item.to ?? '#'" custom v-slot="{ navigate, href, isActive, isExactActive }">
    <div class="kt-menu-item" :class="{ active: isActive || isExactActive }">
      <a
        :href="href"
        class="kt-menu-link sidebar-menu-link border border-transparent items-center grow flex gap-[14px] ps-[10px] pe-[10px] py-[8px]"
        :class="(isActive || isExactActive) ? 'sidebar-menu-link-active rounded-lg' : ''"
        @click="onLeafClick(navigate)"
      >
        <!-- Top-level link gets icon, nested links get a bullet -->
        <template v-if="!nested">
          <span v-if="item.icon" class="kt-menu-icon items-start text-white/52 w-5 shrink-0">
            <AppIcon :name="item.icon" :size="18" :icon-class="(isActive || isExactActive) ? 'text-white' : ''" />
          </span>
        </template>
        <template v-else>
          <span class="kt-menu-bullet flex w-[6px] -start-[3px] rtl:start-0 relative shrink-0">
            <span
              class="absolute top-1/2 size-[6px] rounded-full -translate-y-1/2"
              :class="(isActive || isExactActive) ? 'bg-white' : 'bg-transparent'"
            />
          </span>
        </template>
        <span
          class="kt-menu-title text-sm font-normal grow"
          :class="(isActive || isExactActive) ? 'text-white font-semibold' : 'text-white/74'"
        >
          {{ item.label }}
        </span>
        <SidebarBadge v-if="item.badge" :value="item.badge" />
      </a>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import SidebarBadge from 'src/components/layout/SidebarBadge.vue'

const props = defineProps({
  item: { type: Object, required: true },
  nested: { type: Boolean, default: false },
})

const route = useRoute()

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
</script>

<style scoped>
.sidebar-menu-link {
  position: relative;
  overflow: hidden;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.sidebar-menu-link :deep(.kt-menu-title) {
  font-size: 1.0rem;
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
