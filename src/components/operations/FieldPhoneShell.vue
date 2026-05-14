<template>
  <div class="field-phone-shell">
    <div class="field-phone">
      <div class="field-phone-status">
        <span>09:42</span>
        <span>4G 86%</span>
      </div>

      <div class="field-phone-header">
        <div>
          <span>{{ eyebrow }}</span>
          <strong>{{ title }}</strong>
        </div>
        <span class="field-phone-avatar">JM</span>
      </div>

      <slot />

      <nav class="field-phone-nav">
        <router-link to="/field/schedule">
          <AppIcon name="ki-calendar" :size="17" />
          Escala
        </router-link>
        <router-link to="/field/post">
          <AppIcon name="ki-geolocation" :size="17" />
          Posto
        </router-link>
        <router-link to="/field/check-in">
          <AppIcon name="ki-qr-code" :size="17" />
          Check-in
        </router-link>
        <router-link to="/field/incidents/new">
          <AppIcon name="ki-warning-2" :size="17" />
          Ocorrência
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import AppIcon from 'src/components/ui/AppIcon.vue'

defineProps({
  eyebrow: { type: String, default: 'PLUSE Campo' },
  title: { type: String, required: true },
})
</script>
