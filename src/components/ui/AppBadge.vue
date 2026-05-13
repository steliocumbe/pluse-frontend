<!--
  AppBadge — small chip for status, counters or labels.

  Variants map cleanly to status colours used across the app:
    - default / neutral
    - primary
    - success  (active, approved, paid…)
    - warning  (pending, late…)
    - danger   (rejected, overdue, expired…)
    - info

  Sizes:    sm | md

  Usage:
    <AppBadge variant="success">Activo</AppBadge>
    <AppBadge variant="warning" size="sm">Pendente</AppBadge>
    <AppBadge variant="danger">{{ count }}</AppBadge>
-->
<template>
  <span :class="['app-badge', `app-badge--${variant}`, `app-badge--${size}`]" role="status">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'primary', 'success', 'warning', 'danger', 'info'].includes(v),
  },
  size: { type: String, default: 'sm', validator: (v) => ['sm', 'md'].includes(v) },
})
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
}
.app-badge--sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
}
.app-badge--md {
  padding: 0.3125rem 0.625rem;
  font-size: 0.75rem;
}

.app-badge--neutral {
  background: var(--muted);
  color: var(--muted-foreground);
  border-color: var(--border);
}
.app-badge--primary {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  border-color: color-mix(in oklab, var(--primary) 28%, transparent);
}
.app-badge--success {
  background: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 14%, transparent);
  color: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 86%, var(--foreground));
  border-color: color-mix(in oklab, var(--pluse-emerald-500, #10b981) 30%, transparent);
}
.app-badge--warning {
  background: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 16%, transparent);
  color: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 80%, var(--foreground));
  border-color: color-mix(in oklab, var(--pluse-amber-500, #f59e0b) 32%, transparent);
}
.app-badge--danger {
  background: color-mix(in oklab, var(--destructive) 12%, transparent);
  color: var(--destructive);
  border-color: color-mix(in oklab, var(--destructive) 28%, transparent);
}
.app-badge--info {
  background: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 14%, transparent);
  color: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 80%, var(--foreground));
  border-color: color-mix(in oklab, var(--pluse-cyan-500, #06b6d4) 30%, transparent);
}
</style>
