<template>
  <component
    :is="component"
    v-if="component"
    :size="size"
    :stroke-width="strokeWidth"
    :class="iconClass"
    :aria-hidden="ariaLabel ? undefined : 'true'"
    :aria-label="ariaLabel"
  />
</template>

<script setup>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import { resolveIconName } from 'src/utils/icon-map'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
  strokeWidth: { type: [Number, String], default: 1.75 },
  iconClass: { type: [String, Array, Object], default: '' },
  ariaLabel: { type: String, default: undefined },
})

const component = computed(() => {
  const resolved = resolveIconName(props.name)
  if (!resolved) return null
  const found = LucideIcons[resolved]
  if (!found && import.meta.env.DEV) {
    console.warn(
      `[AppIcon] Lucide icon "${resolved}" (from "${props.name}") not found. ` +
        `Add the mapping in src/utils/icon-map.js or check the Lucide name.`,
    )
  }
  return found || null
})
</script>
