<template>
  <nav class="admin-breadcrumb" :aria-label="ariaLabel">
    <ol>
      <li v-for="(item, idx) in items" :key="idx">
        <router-link
          v-if="item.to && idx < items.length - 1"
          :to="item.to"
          class="admin-breadcrumb-link"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="admin-breadcrumb-current" :aria-current="idx === items.length - 1 ? 'page' : undefined">
          {{ item.label }}
        </span>
        <span v-if="idx < items.length - 1" class="admin-breadcrumb-sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
/**
 * Breadcrumb leve para páginas administrativas.
 *
 * Recebe um array de items: `[{ label, to }]`. O último item é renderizado
 * como texto (página actual). Os anteriores são links — se `to` for omitido,
 * fica como texto também.
 *
 *   <AdminBreadcrumb :items="[
 *     { label: 'Colaboradores', to: { name: 'employees-list' } },
 *     { label: 'João Tembe', to: { name: 'employees-detail', params: { id } } },
 *     { label: 'Editar' },
 *   ]" />
 */
defineProps({
  items: {
    type: Array,
    required: true,
    validator: (v) => v.every((i) => typeof i.label === 'string'),
  },
  ariaLabel: { type: String, default: 'Caminho de navegação' },
})
</script>

<style scoped>
.admin-breadcrumb {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 6px;
}
.admin-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.admin-breadcrumb li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.admin-breadcrumb-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  transition: color .15s ease;
}
.admin-breadcrumb-link:hover {
  color: #ffffff;
  text-decoration: underline;
}
.admin-breadcrumb-current {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}
.admin-breadcrumb-sep {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}
</style>
