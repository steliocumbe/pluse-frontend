<template>
  <span class="rounded-full text-[10px] font-medium px-1.5 py-0.5 leading-none" :class="variantClasses">
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
    return 'bg-primary/15 text-primary'
  }
  if (v.includes('alerta') || v.includes('atraso') || v.includes('falha')) {
    return 'bg-destructive/15 text-destructive'
  }
  if (v.includes('breve') || v.includes('soon') || v.includes('beta')) {
    return 'bg-muted text-muted-foreground'
  }
  if (v.includes('rh') || v.includes('admin') || v.includes('cco')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
  }
  return 'bg-muted text-muted-foreground'
})
</script>
