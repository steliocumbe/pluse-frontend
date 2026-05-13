<!--
  AppTable — minimal, server-driven table.

  Caller controls data via props (server already paginated/sorted/searched).
  This component focuses on visual consistency, sort UI, loading state and
  empty state.

  Columns: [{ key, label, sortable?, align?, width?, render? }]
  Rows: array of objects with `key` field (or use `rowKey` prop)

  Slots:
    - cell:{column-key}={ row, value } — custom render per column
    - empty                            — replaces the default empty state
    - actions={ row }                  — trailing actions column

  Usage:
    <AppTable
      :columns="cols"
      :rows="employees"
      :loading="loading"
      row-key="id"
      :sort="sort"
      @sort-change="onSort"
      @row-click="goToDetail"
    >
      <template #cell:status="{ row }">
        <AppBadge :variant="row.status === 'active' ? 'success' : 'warning'">
          {{ row.status_display }}
        </AppBadge>
      </template>
      <template #actions="{ row }">
        <AppButton size="sm" variant="outline" @click.stop="onEdit(row)">Editar</AppButton>
      </template>
    </AppTable>
-->
<template>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="['app-table__th', col.align && `text-${col.align}`, col.sortable && 'app-table__th--sortable']"
            :style="col.width ? { width: col.width } : null"
            @click="col.sortable ? toggleSort(col.key) : null"
          >
            <span class="app-table__th-inner">
              {{ col.label }}
              <span v-if="col.sortable" class="app-table__sort">
                <AppIcon
                  v-if="sort === col.key"
                  name="ki-arrow-up"
                  :size="12"
                  icon-class="text-primary"
                />
                <AppIcon
                  v-else-if="sort === '-' + col.key"
                  name="ki-arrow-down"
                  :size="12"
                  icon-class="text-primary"
                />
                <span v-else class="app-table__sort-idle">↕</span>
              </span>
            </span>
          </th>
          <th v-if="$slots.actions" class="app-table__th app-table__th--actions">
            <span class="sr-only">Acções</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="totalColumns" class="app-table__loading">
            <span class="app-table__spinner" aria-hidden="true" />
            A carregar…
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="totalColumns" class="app-table__empty">
            <slot name="empty">Sem registos a apresentar.</slot>
          </td>
        </tr>
        <tr
          v-else
          v-for="row in rows"
          :key="row[rowKey]"
          class="app-table__row"
          :class="{ 'app-table__row--clickable': clickable }"
          @click="onRowClick(row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="['app-table__td', col.align && `text-${col.align}`]"
          >
            <slot :name="`cell:${col.key}`" :row="row" :value="row[col.key]">
              {{ col.render ? col.render(row[col.key], row) : row[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="app-table__td app-table__td--actions" @click.stop>
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  // Format: "field" (asc) or "-field" (desc). Mirrors DRF ordering.
  sort: { type: String, default: '' },
  clickable: { type: Boolean, default: true },
})

const emit = defineEmits(['sort-change', 'row-click'])

const totalColumns = computed(() => props.columns.length + (props.$slots?.actions ? 1 : 0))

function toggleSort(key) {
  if (props.sort === key) {
    emit('sort-change', `-${key}`)
  } else if (props.sort === `-${key}`) {
    emit('sort-change', '')
  } else {
    emit('sort-change', key)
  }
}

function onRowClick(row) {
  if (props.clickable) emit('row-click', row)
}
</script>

<style scoped>
.app-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
}
.app-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  color: var(--foreground);
}
.app-table__th {
  padding: 0.75rem 1rem;
  text-align: start;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 40%, var(--background));
  white-space: nowrap;
}
.app-table__th--sortable {
  cursor: pointer;
  user-select: none;
}
.app-table__th--sortable:hover {
  color: var(--foreground);
}
.app-table__th--actions {
  width: 1px;
  text-align: end;
}
.app-table__th-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.app-table__sort {
  display: inline-flex;
  align-items: center;
}
.app-table__sort-idle {
  color: color-mix(in oklab, var(--muted-foreground) 60%, transparent);
  font-size: 0.75rem;
}
.app-table__td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.app-table__td--actions {
  text-align: end;
  white-space: nowrap;
}
.app-table__row:last-child .app-table__td {
  border-bottom: 0;
}
.app-table__row--clickable {
  cursor: pointer;
  transition: background-color 100ms ease;
}
.app-table__row--clickable:hover {
  background: color-mix(in oklab, var(--primary) 5%, transparent);
}
.app-table__loading,
.app-table__empty {
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}
.app-table__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}
.app-table__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--muted-foreground);
  border-right-color: transparent;
  animation: app-table-spin 0.6s linear infinite;
}
@keyframes app-table-spin {
  to { transform: rotate(360deg); }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
