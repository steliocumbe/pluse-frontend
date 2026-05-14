<template>
  <div class="pluse-map-card" :class="{ 'is-compact': compact }">
    <LMap
      v-model:zoom="zoomModel"
      :center="center"
      :use-global-leaflet="false"
      class="pluse-leaflet-map"
    >
      <LTileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <template v-for="post in posts" :key="post.code">
        <LCircle
          :lat-lng="post.latLng"
          :radius="post.radius || 90"
          :color="toneColor(post.tone)"
          :fill-color="toneColor(post.tone)"
          :fill-opacity="0.12"
          :weight="2"
        />
        <LCircleMarker
          :lat-lng="post.latLng"
          :radius="9"
          :color="'#ffffff'"
          :fill-color="toneColor(post.tone)"
          :fill-opacity="1"
          :weight="3"
        >
          <LPopup>
            <div class="pluse-map-popup">
              <strong>{{ post.name }}</strong>
              <span>{{ post.client }}</span>
              <p>{{ post.address }}</p>
              <small>{{ post.guards }} vigilantes - {{ post.status }}</small>
            </div>
          </LPopup>
        </LCircleMarker>
      </template>
    </LMap>

    <div v-if="showLegend" class="pluse-map-legend">
      <span><i class="is-green" /> Coberto</span>
      <span><i class="is-amber" /> Atenção</span>
      <span><i class="is-red" /> Risco</span>
    </div>
  </div>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'
import { computed } from 'vue'
import { LCircle, LCircleMarker, LMap, LPopup, LTileLayer } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  posts: { type: Array, required: true },
  center: { type: Array, default: () => [-25.9653, 32.5892] },
  zoom: { type: Number, default: 12 },
  compact: { type: Boolean, default: false },
  showLegend: { type: Boolean, default: true },
})

const zoomModel = computed({
  get: () => props.zoom,
  set: () => {},
})

function toneColor(tone) {
  const colors = {
    'is-green': '#10b981',
    'is-amber': '#f59e0b',
    'is-red': '#ef4444',
    'is-blue': '#3f6df6',
  }
  return colors[tone] || colors['is-blue']
}
</script>
