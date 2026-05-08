<template>
  <!-- Toolbar: title + breadcrumb + actions -->
  <div class="kt-container-fixed">
    <div class="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
      <div class="flex flex-col justify-center gap-2">
        <h1 class="text-xl font-medium leading-none text-mono">Dashboard</h1>
        <div
          class="flex items-center gap-2 text-sm font-normal text-secondary-foreground"
        >
          Visão geral da operação — {{ today }}
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <button type="button" class="kt-btn kt-btn-outline">
          <AppIcon name="ki-cloud-download" :size="16" icon-class="me-1.5" />
          Exportar
        </button>
        <button type="button" class="kt-btn kt-btn-primary">
          <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
          Nova escala
        </button>
      </div>
    </div>
  </div>

  <!-- KPI cards -->
  <div class="kt-container-fixed">
    <div class="grid gap-5 lg:gap-7.5 mb-7.5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5">
        <div
          v-for="card in cards"
          :key="card.label"
          class="kt-card flex flex-col p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-secondary-foreground">{{ card.label }}</span>
            <span
              class="size-9 rounded-md flex items-center justify-center bg-primary/10"
            >
              <AppIcon :name="card.icon" :size="18" icon-class="text-primary" />
            </span>
          </div>
          <div class="text-2xl font-semibold text-mono">{{ card.value }}</div>
          <div class="text-xs text-muted-foreground mt-1">{{ card.hint }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Welcome / next steps card -->
  <div class="kt-container-fixed pb-7.5">
    <div class="kt-card">
      <div class="kt-card-header">
        <h3 class="kt-card-title">Bem-vindo ao PLUSE</h3>
      </div>
      <div class="kt-card-content p-6 text-sm text-secondary-foreground space-y-3">
        <p>
          Olá <span class="text-mono font-medium">{{ auth.user?.full_name || auth.user?.email }}</span>.
          Os indicadores acima são marcadores enquanto os módulos não estão ligados ao backend.
        </p>
        <p>
          À medida que as APIs em <code class="kt-kbd">/api/v1/</code> forem ficando disponíveis,
          esta página passará a mostrar dados reais sobre postos cobertos, presenças e ocorrências.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import AppIcon from 'src/components/ui/AppIcon.vue'

const auth = useAuthStore()

const today = computed(() =>
  new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }),
)

const cards = [
  { label: 'Postos cobertos', value: '—', hint: 'em tempo real', icon: 'ki-geolocation' },
  { label: 'Vigilantes em serviço', value: '—', hint: 'check-in confirmado', icon: 'ki-people' },
  { label: 'Atrasos', value: '—', hint: 'últimas 24h', icon: 'ki-time' },
  { label: 'Ocorrências abertas', value: '—', hint: 'pendentes', icon: 'ki-warning-2' },
]
</script>
