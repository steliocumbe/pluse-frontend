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
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 0 0.42rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  font-size: 0.68rem;
  font-weight: 850;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-badge--primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.sidebar-badge--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.sidebar-badge--warning {
  background: #fef3c7;
  color: #92400e;
}

.sidebar-badge--muted {
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
}
</style>
