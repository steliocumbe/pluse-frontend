<!--
  PLUSE app header. Adapted from keenthemes/demo/index.html (lines 1641+).

  Decisions vs the verbatim template:
    1. The megamenu (Home / Profiles / My Account / Network / Store / Auth /
       Help) was DROPPED — our sidebar already covers navigation. Replicating
       4000 lines of dropdowns would bloat the bundle and conflict with the
       sidebar IA.
    2. Topbar right-side icons kept: Search (placeholder), Notifications
       (placeholder), User dropdown (functional via UserDropdown.vue).
    3. Mobile-only logo + hamburger preserved — the hamburger toggles the
       sidebar drawer at <lg via the kt-drawer attribute.
    4. <i class="ki-..."> → <AppIcon> everywhere.
-->
<template>
  <header
    class="kt-header fixed top-0 z-10 start-0 end-0 flex items-stretch shrink-0 bg-background border-b border-border"
    id="header"
  >
    <!--
      `kt-container-fluid` (instead of `kt-container-fixed`) gives the header
      full viewport width — no max-width and no auto-centring at xl+.
      Source: keenthemes/dist/assets/css/styles.css l. 12302.
    -->
    <div class="kt-container-fluid flex justify-between items-stretch lg:gap-4">
      <!--
        Mobile logo + sidebar toggle. Hidden at >=768px (`md:hidden`) instead
        of >=1024px so users on smaller laptops or with browser zoom still
        get the desktop layout without the redundant hamburger. Quasar's
        `.hidden { display: none !important }` doesn't apply here because we
        use `md:hidden` (different class), but we add !important on our own
        rule below for safety.
      -->
      <div class="header-mobile-cluster flex gap-2.5 md:hidden items-center -ms-1">
        <router-link to="/" class="shrink-0 flex items-center gap-2">
          <span class="text-lg font-bold text-mono leading-none">PLUSE</span>
        </router-link>
        <button
          type="button"
          class="kt-btn kt-btn-icon kt-btn-ghost"
          aria-label="Abrir menu"
          data-kt-drawer-toggle="#sidebar"
        >
          <AppIcon name="ki-menu" :size="20" />
        </button>
      </div>

      <!-- Page title slot for breadcrumbs etc. (left/centre on lg+) -->
      <div class="hidden lg:flex items-center grow">
        <slot name="left" />
      </div>

      <!-- Right cluster: search, notifications, user -->
      <div class="flex items-center gap-2 ms-auto">
        <button
          type="button"
          class="group kt-btn kt-btn-ghost kt-btn-icon size-9 rounded-full hover:bg-primary/10"
          aria-label="Pesquisar"
          title="Pesquisar (em breve)"
          @click="onSearch"
        >
          <AppIcon name="ki-magnifier" :size="18" icon-class="group-hover:text-primary" />
        </button>

        <button
          type="button"
          class="group kt-btn kt-btn-ghost kt-btn-icon size-9 rounded-full hover:bg-primary/10 relative"
          aria-label="Notificações"
          title="Notificações (em breve)"
          @click="onNotifications"
        >
          <AppIcon name="ki-notification" :size="18" icon-class="group-hover:text-primary" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-0.5 -end-0.5 min-w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium leading-none flex items-center justify-center px-1"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <UserDropdown />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import UserDropdown from 'src/components/layout/UserDropdown.vue'

// Placeholder counter — replace with real notifications store when the
// backend endpoint exists.
const unreadCount = ref(0)

function onSearch() {
  // TODO: open search modal (kt-modal-toggle="#search_modal" in the original)
}
function onNotifications() {
  // TODO: open notifications drawer (kt-drawer-toggle="#notifications_drawer")
}
</script>

<style scoped>
/*
 * Defensive override — guarantees the mobile cluster (logo + hamburger)
 * is gone from any viewport that's at least tablet-wide, even if some
 * other rule with !important tries to force it back to display: flex.
 */
@media (min-width: 768px) {
  .header-mobile-cluster {
    display: none !important;
  }
}
</style>
