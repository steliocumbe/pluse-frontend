<template>
  <span class="sidebar-badge" :class="variantClasses">
    {{ value }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [String, Number], required: true },
})

// Pick a colour by content. Numeric → primary chip. Known keywords get
// dedicated palettes. Fallback is a neutral grey chip.
const variantClasses = computed(() => {
  const v = String(props.value).toLowerCase()
  if (/^\d+$/.test(v)) {
    return 'sidebar-badge--primary'
  }
  if (v.includes('alerta') || v.includes('atraso') || v.includes('falha')) {
    return 'sidebar-badge--danger'
  }
  if (v.includes('breve') || v.includes('soon') || v.includes('beta')) {
    return 'sidebar-badge--muted'
  }
  if (v.includes('rh') || v.includes('admin') || v.includes('cco')) {
    return 'sidebar-badge--warning'
  }
  return 'sidebar-badge--muted'
})
</script>

<style scoped>
.sidebar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  max-width: 4.8rem;
  min-height: 1.25rem;
  border: 1px solid color-mix(in oklab, var(--pluse-sidebar-item-icon) 45%, transparent);
  border-radius: 999px;
  padding: 0 0.42rem;
  box-shadow: 0 8px 18px color-mix(in oklab, var(--pluse-sidebar-shadow) 100%, transparent);
  font-size: 0.68rem;
  font-weight: 850;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-badge--primary {
  background: color-mix(in oklab, var(--primary) 18%, var(--card));
  color: color-mix(in oklab, var(--primary) 84%, var(--foreground));
}

.sidebar-badge--danger {
  background: color-mix(in oklab, var(--destructive) 16%, var(--card));
  color: color-mix(in oklab, var(--destructive) 86%, var(--foreground));
}

.sidebar-badge--warning {
  background: color-mix(in oklab, var(--pluse-amber-500) 14%, var(--card));
  color: color-mix(in oklab, var(--pluse-amber-500) 84%, var(--foreground));
}

.sidebar-badge--muted {
  background: color-mix(in oklab, var(--muted) 88%, var(--card));
  color: var(--muted-foreground);
}
</style>
