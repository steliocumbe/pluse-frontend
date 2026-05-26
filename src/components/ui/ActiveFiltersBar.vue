<template>
  <Transition name="active-filters">
    <div v-if="visibleFilters.length" class="active-filters">
      <span class="active-filters__label">
        <AppIcon name="ki-filter" :size="14" />
        Filtros activos
      </span>

      <div class="active-filters__chips">
        <button
          v-for="f in visibleFilters"
          :key="f.key"
          type="button"
          class="active-filters__chip"
          :title="`Remover filtro: ${f.label}`"
          @click="onClear(f.key)"
        >
          <span class="active-filters__chip-label">{{ f.label }}:</span>
          <strong class="active-filters__chip-value">{{ f.display }}</strong>
          <AppIcon name="ki-cross" :size="11" class="active-filters__chip-x" />
        </button>
      </div>

      <button type="button" class="active-filters__clear-all" @click="onClearAll">
        Limpar todos
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

/**
 * Barra de filtros activos com chips removíveis.
 *
 * Recebe um objecto `filters` (do `reactive({}) ` na página) e uma config
 * dos filtros que descreve como renderizar/limpar cada um.
 *
 * Exemplo de uso na página:
 *
 *   const filters = reactive({ search: '', status: '', client: null })
 *
 *   const filterConfig = [
 *     { key: 'search', label: 'Pesquisa', emptyValue: '' },
 *     { key: 'status', label: 'Estado', emptyValue: '',
 *       options: statusOptions },  // para resolver value -> label
 *     { key: 'client', label: 'Cliente', emptyValue: null,
 *       resolve: (v) => clients.find((c) => c.id === v)?.name },
 *   ]
 *
 *   <ActiveFiltersBar :filters="filters" :config="filterConfig" @clear-all="resetFilters" />
 */

const props = defineProps({
  filters: { type: Object, required: true },
  config: { type: Array, required: true },
})

const emit = defineEmits(['clear', 'clear-all'])

const visibleFilters = computed(() => {
  return props.config
    .map((c) => {
      const raw = props.filters[c.key]
      const empty = c.emptyValue ?? ''
      if (raw === empty || raw === null || raw === undefined || raw === '') return null
      // Arrays vazios também
      if (Array.isArray(raw) && raw.length === 0) return null

      let display
      if (typeof c.resolve === 'function') {
        display = c.resolve(raw)
      } else if (Array.isArray(c.options)) {
        const found = c.options.find((o) => o.value === raw)
        display = found?.label ?? String(raw)
      } else if (Array.isArray(raw)) {
        display = raw.join(', ')
      } else if (typeof raw === 'boolean') {
        display = raw ? 'Sim' : 'Não'
      } else {
        display = String(raw)
      }
      return { key: c.key, label: c.label, display }
    })
    .filter(Boolean)
})

function onClear(key) {
  const conf = props.config.find((c) => c.key === key)
  const empty = conf?.emptyValue ?? ''
  emit('clear', key, empty)
}

function onClearAll() {
  emit('clear-all')
}
</script>

<style scoped>
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: color-mix(in oklab, var(--primary) 7%, transparent);
  border: 1px solid color-mix(in oklab, var(--primary) 18%, transparent);
  border-radius: 10px;
  margin-bottom: 14px;
}

.active-filters__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: color-mix(in oklab, var(--primary) 80%, black 20%);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.active-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.active-filters__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--card, #fff);
  border: 1px solid color-mix(in oklab, var(--primary) 30%, transparent);
  border-radius: 999px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease;
}
.active-filters__chip:hover {
  background: color-mix(in oklab, var(--destructive) 8%, white);
  border-color: var(--destructive);
}
.active-filters__chip:hover .active-filters__chip-x {
  color: var(--destructive);
}

.active-filters__chip-label {
  color: var(--muted-foreground);
  font-weight: 500;
}
.active-filters__chip-value {
  color: var(--foreground);
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.active-filters__chip-x {
  color: var(--muted-foreground);
  transition: color .15s ease;
}

.active-filters__clear-all {
  margin-left: auto;
  padding: 4px 10px;
  background: transparent;
  border: none;
  color: var(--destructive);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color .15s ease;
}
.active-filters__clear-all:hover {
  background: color-mix(in oklab, var(--destructive) 10%, transparent);
}

.active-filters-enter-active,
.active-filters-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}
.active-filters-enter-from,
.active-filters-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
