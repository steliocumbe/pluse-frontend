<template>
  <VueApexCharts
    class="app-apex-chart"
    :type="type"
    :height="height"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  type: { type: String, required: true },
  series: { type: Array, required: true },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 280 },
})

const chartOptions = computed(() => ({
    chart: {
      type: props.type,
      height: props.height,
      toolbar: { show: false },
      animations: { enabled: true, speed: 450 },
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      foreColor: '#64748b',
      ...props.options.chart,
    },
    ...props.options,
}))
</script>

<style scoped>
.app-apex-chart {
  width: 100%;
}
</style>
