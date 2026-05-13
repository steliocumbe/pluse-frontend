<!--
  AppHeading — renders a heading via <div role="heading" aria-level=N> so we
  bypass Quasar's typography reset (which sets h1..h6 sizes to weird defaults
  that Tailwind utilities don't reliably override).

  Screen readers announce this exactly like a <hN> element.

  Usage:
    <AppHeading :level="1" class="text-2xl font-semibold text-mono">
      Dashboard
    </AppHeading>
-->
<template>
  <div role="heading" :aria-level="level">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  level: {
    type: [Number, String],
    default: 2,
    validator: (v) => Number(v) >= 1 && Number(v) <= 6,
  },
})
</script>
