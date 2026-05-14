<template>
  <section class="cco-filter-bar">
    <label v-for="filter in filterItems" :key="filter.label">
      <span>{{ filter.label }}</span>
      <select>
        <option v-for="option in filter.options" :key="option">{{ option }}</option>
      </select>
    </label>
  </section>
</template>

<script setup>
import { ccoFilters } from 'src/data/ccoDemoData'

const filterItems = [
  { label: 'Cliente', options: ccoFilters.clients },
  { label: 'Posto', options: ccoFilters.posts },
  { label: 'Turno', options: ccoFilters.shifts },
  { label: 'Zona', options: ccoFilters.zones },
]
</script>
