<template>
  <!-- Section heading (e.g. "OPERAÇÕES") -->
  <div v-if="item.type === 'heading'" class="kt-menu-item pt-4 pb-1">
    <span
      class="kt-menu-heading uppercase text-xs font-medium text-muted-foreground ps-[10px] pe-[10px]"
    >
      {{ item.label }}
    </span>
  </div>

  <!-- Visual divider -->
  <div v-else-if="item.type === 'divider'" class="my-2 mx-2.5 border-t border-border" />

  <!-- Group with children (collapsible accordion) -->
  <div v-else-if="hasChildren" class="kt-menu-item" :class="{ active: hasActiveDescendant, 'kt-menu-item-show': expanded }">
    <button
      type="button"
      class="kt-menu-link flex items-center grow cursor-pointer border border-transparent gap-2.5 ps-2.5 pe-2.5 py-1.5 rounded-md hover:bg-accent/60 w-full text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span v-if="item.icon" class="kt-menu-icon items-start text-muted-foreground w-5 shrink-0">
        <AppIcon :name="item.icon" :size="18" />
      </span>
      <span
        class="kt-menu-title text-sm font-medium grow"
        :class="hasActiveDescendant ? 'text-primary font-semibold' : 'text-foreground'"
      >
        {{ item.label }}
      </span>
      <span v-if="item.badge" class="me-1">
        <SidebarBadge :value="item.badge" />
      </span>
      <span class="kt-menu-arrow text-muted-foreground w-5 shrink-0 flex justify-end">
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
        class="kt-menu-accordion grid ps-[10px] relative before:absolute before:start-[20px] before:top-0 before:bottom-0 before:border-s before:border-border"
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
  <router-link
    v-else
    :to="item.to ?? '#'"
    custom
    v-slot="{ navigate, href, isActive, isExactActive }"
  >
    <div class="kt-menu-item" :class="{ active: isActive || isExactActive }">
      <a
        :href="href"
        class="kt-menu-link border border-transparent items-center grow flex hover:bg-accent/60 hover:rounded-lg gap-[14px] ps-[10px] pe-[10px] py-[8px]"
        :class="(isActive || isExactActive) ? 'bg-accent/60 rounded-lg' : ''"
        @click="navigate"
      >
        <!-- Top-level link gets icon, nested links get a bullet -->
        <template v-if="!nested">
          <span v-if="item.icon" class="kt-menu-icon items-start text-muted-foreground w-5 shrink-0">
            <AppIcon :name="item.icon" :size="18" :icon-class="(isActive || isExactActive) ? 'text-primary' : ''" />
          </span>
        </template>
        <template v-else>
          <span class="kt-menu-bullet flex w-[6px] -start-[3px] rtl:start-0 relative shrink-0">
            <span
              class="absolute top-1/2 size-[6px] rounded-full -translate-y-1/2"
              :class="(isActive || isExactActive) ? 'bg-primary' : 'bg-transparent'"
            />
          </span>
        </template>
        <span
          class="kt-menu-title text-sm font-normal grow"
          :class="(isActive || isExactActive) ? 'text-primary font-semibold' : 'text-foreground'"
        >
          {{ item.label }}
        </span>
        <SidebarBadge v-if="item.badge" :value="item.badge" />
      </a>
    </div>
  </router-link>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import SidebarBadge from 'src/components/layout/SidebarBadge.vue'

const props = defineProps({
  item: { type: Object, required: true },
  nested: { type: Boolean, default: false },
})

const route = useRoute()

// Provided by AppSidebar — true when the whole sidebar is in collapsed mode.
// We use this to force-close every accordion so they don't overflow the
// shrunken 80px sidebar.
const sidebarCollapsed = inject('sidebarCollapsed', ref(false))

// Tick that increments whenever the user's mouse leaves a hover-expanded
// collapsed sidebar. Each increment fires the watch below and forces every
// accordion to shut, preventing overflow when the sidebar shrinks back.
const forceCloseTick = inject('sidebarForceCloseTick', ref(0))

const hasChildren = computed(
  () => Array.isArray(props.item.children) && props.item.children.length > 0,
)

// Recursively check whether any leaf descendant matches the current route.
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

// Auto-expand the accordion if a child becomes active via navigation.
watch(hasActiveDescendant, (active) => {
  if (active) expanded.value = true
})

// When the sidebar collapses, slam every accordion shut. Reopening only
// happens after the user clicks the item again (or navigates to a child).
watch(sidebarCollapsed, (isCollapsed) => {
  if (isCollapsed) expanded.value = false
})

// Same when the user hover-opens an accordion on a collapsed sidebar and
// then moves the mouse away — AppSidebar bumps the counter and we close.
watch(forceCloseTick, () => {
  expanded.value = false
})
</script>
