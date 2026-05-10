<template>
  <div class="kt-container-fixed">
    <div class="flex flex-col items-center justify-center text-center py-16 gap-4">
      <span class="size-16 rounded-2xl flex items-center justify-center bg-primary/10">
        <AppIcon name="ki-setting-2" :size="32" icon-class="text-primary" />
      </span>
      <h1 class="text-2xl font-semibold text-mono">{{ title }}</h1>
      <p class="text-sm text-muted-foreground max-w-md">
        Esta página ainda não está implementada. Aparece no menu lateral como antecipação
        do trabalho a fazer e para validares connosco se a localização e a estrutura
        fazem sentido para o teu fluxo.
      </p>
      <div class="text-xs text-muted-foreground">
        Caminho actual: <code class="kt-kbd">{{ route.path }}</code>
      </div>
      <router-link to="/" class="kt-btn kt-btn-outline mt-2">
        <AppIcon name="ki-arrow-left" :size="14" icon-class="me-1.5" />
        Voltar ao Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'

const route = useRoute()

// Derive a friendly title from the last URL segment.
const title = computed(() => {
  const last = (route.path.split('/').filter(Boolean).pop() || 'Página').replace(/-/g, ' ')
  return last.charAt(0).toUpperCase() + last.slice(1)
})
</script>
