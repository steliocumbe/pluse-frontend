<template>
  <AdminPageTemplate
    eyebrow="Visão geral"
    title="Dashboard administrativo"
    :description="`Acompanhe a operação, prioridades e sinais críticos do PLUSE em ${today}.`"
  >
    <template #actions>
      <button type="button" class="kt-btn kt-btn-outline admin-hero-button">
        <AppIcon name="ki-cloud-download" :size="16" icon-class="me-1.5" />
        Exportar
      </button>
      <button type="button" class="kt-btn kt-btn-primary admin-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Nova escala
      </button>
    </template>

    <template #meta>
      <span class="admin-meta-chip">
        <AppIcon name="ki-time" :size="14" />
        Actualizado agora
      </span>
      <span class="admin-meta-chip">
        <AppIcon name="ki-shield-tick" :size="14" />
        Sessão segura
      </span>
    </template>

    <template #hero>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div v-for="item in heroStats" :key="item.label" class="hero-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <article
        v-for="card in cards"
        :key="card.label"
        class="admin-kpi-card"
        :style="{ '--card-accent': card.color }"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="admin-kpi-label">{{ card.label }}</p>
            <div class="admin-kpi-value">{{ card.value }}</div>
          </div>
          <span class="admin-kpi-icon">
            <AppIcon :name="card.icon" :size="20" />
          </span>
        </div>
        <div class="admin-kpi-footer">
          <span>{{ card.hint }}</span>
          <span class="admin-kpi-trend">{{ card.trend }}</span>
        </div>
      </article>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
      <section class="kt-card admin-panel">
        <div class="admin-panel-header">
          <div>
            <p class="admin-panel-kicker">Operação</p>
            <div class="admin-panel-title">Prioridades de hoje</div>
          </div>
          <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">
            Ver tudo
          </button>
        </div>
        <div class="admin-task-list">
          <div v-for="task in tasks" :key="task.title" class="admin-task-row">
            <span class="admin-task-icon" :style="{ '--task-color': task.color }">
              <AppIcon :name="task.icon" :size="17" />
            </span>
            <div class="min-w-0 grow">
              <div class="admin-task-title">{{ task.title }}</div>
              <p class="admin-task-copy">{{ task.copy }}</p>
            </div>
            <span class="admin-task-badge">{{ task.badge }}</span>
          </div>
        </div>
      </section>

      <section class="kt-card admin-panel">
        <div class="admin-panel-header">
          <div>
            <p class="admin-panel-kicker">Sistema</p>
            <div class="admin-panel-title">Modelo para novas páginas</div>
          </div>
        </div>
        <div class="admin-template-note">
          <p>
            Use <code class="kt-kbd">AdminPageTemplate</code> para criar novas páginas com hero,
            acções, metadados e conteúdo consistente.
          </p>
          <pre><code>&lt;AdminPageTemplate
  eyebrow="Operações"
  title="Postos"
  description="Gestão dos postos activos."
&gt;
  &lt;template #actions&gt;...&lt;/template&gt;
  Conteúdo da página
&lt;/AdminPageTemplate&gt;</code></pre>
        </div>
      </section>
    </div>

    <section class="kt-card admin-welcome">
      <span class="admin-welcome-icon">
        <AppIcon name="ki-profile-circle" :size="22" />
      </span>
      <div>
        <div class="admin-panel-title">Bem-vindo ao PLUSE</div>
        <p>
          Olá <span class="text-mono font-semibold">{{ auth.user?.full_name || auth.user?.email }}</span>.
          Os indicadores continuam como marcadores enquanto as APIs não estão ligadas, mas a
          estrutura visual já fica pronta para receber dados reais.
        </p>
      </div>
    </section>
  </AdminPageTemplate>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
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

const heroStats = [
  { label: 'Cobertura prevista', value: '98%' },
  { label: 'Escalas em revisão', value: '12' },
  { label: 'Alertas críticos', value: '3' },
]

const cards = [
  {
    label: 'Postos cobertos',
    value: '—',
    hint: 'em tempo real',
    trend: 'Live',
    icon: 'ki-geolocation',
    color: 'var(--pluse-blue-600)',
  },
  {
    label: 'Vigilantes em serviço',
    value: '—',
    hint: 'check-in confirmado',
    trend: 'Turnos',
    icon: 'ki-people',
    color: 'var(--pluse-emerald-500)',
  },
  {
    label: 'Atrasos',
    value: '—',
    hint: 'últimas 24h',
    trend: 'Atenção',
    icon: 'ki-time',
    color: 'var(--pluse-amber-500)',
  },
  {
    label: 'Ocorrências abertas',
    value: '—',
    hint: 'pendentes',
    trend: 'Risco',
    icon: 'ki-warning-2',
    color: 'var(--pluse-red-600)',
  },
]

const tasks = [
  {
    title: 'Validar check-ins pendentes',
    copy: 'Confirme localizações fora do posto antes do fecho do turno.',
    badge: 'CCO',
    icon: 'ki-qr-code',
    color: 'var(--pluse-blue-600)',
  },
  {
    title: 'Rever escalas incompletas',
    copy: 'Há postos sem cobertura confirmada para as próximas 24 horas.',
    badge: '12',
    icon: 'ki-calendar',
    color: 'var(--pluse-amber-500)',
  },
  {
    title: 'Acompanhar ocorrências abertas',
    copy: 'Priorize ocorrências com impacto directo no cliente.',
    badge: '3',
    icon: 'ki-warning-2',
    color: 'var(--pluse-red-600)',
  },
]
</script>

<style scoped>
.admin-hero-button {
  border-color: rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.admin-hero-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.admin-hero-primary {
  border-color: white;
  background: white;
  color: var(--pluse-navy-950);
}

.admin-meta-chip,
.hero-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
  padding: 7px 10px;
  font-size: 0.84rem;
  font-weight: 600;
}

.hero-stat {
  justify-content: space-between;
  border-radius: 14px;
  padding: 16px 18px;
}

.hero-stat strong {
  color: white;
  font-size: 1.5rem;
  font-weight: 720;
}

.admin-kpi-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  padding: 22px;
  box-shadow: 0 12px 34px color-mix(in oklab, var(--pluse-navy-950) 6%, transparent);
}

.admin-kpi-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  content: '';
  background: var(--card-accent);
}

.admin-kpi-card::after {
  position: absolute;
  right: -34px;
  top: -34px;
  width: 108px;
  height: 108px;
  content: '';
  border-radius: 999px;
  background: color-mix(in oklab, var(--card-accent) 14%, transparent);
}

.admin-kpi-label,
.admin-panel-kicker {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.88rem;
  font-weight: 650;
}

.admin-kpi-value {
  margin-top: 10px;
  color: var(--mono);
  font-size: 2.12rem;
  font-weight: 720;
  line-height: 1;
}

.admin-kpi-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: color-mix(in oklab, var(--card-accent) 12%, transparent);
  color: var(--card-accent);
}

.admin-kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
  color: var(--muted-foreground);
  font-size: 0.86rem;
}

.admin-kpi-trend {
  color: var(--card-accent);
  font-weight: 700;
}

.admin-panel {
  padding: 24px;
}

.admin-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.admin-panel-title {
  color: var(--mono);
  font-size: 1.16rem;
  font-weight: 700;
  line-height: 1.25;
}

.admin-task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-task-row {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in oklab, var(--background) 82%, var(--muted));
  padding: 14px;
}

.admin-task-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--task-color) 12%, transparent);
  color: var(--task-color);
}

.admin-task-title {
  color: var(--mono);
  font-size: 0.98rem;
  font-weight: 700;
}

.admin-task-copy {
  margin: 3px 0 0;
  color: var(--muted-foreground);
  font-size: 0.88rem;
  line-height: 1.45;
}

.admin-task-badge {
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-foreground);
  padding: 5px 8px;
  font-size: 0.78rem;
  font-weight: 700;
}

.admin-template-note {
  color: var(--secondary-foreground);
  font-size: 0.96rem;
  line-height: 1.65;
}

.admin-template-note pre {
  overflow-x: auto;
  margin: 16px 0 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(in oklab, var(--pluse-navy-950) 96%, var(--primary));
  color: #dbeafe;
  padding: 16px;
  font-size: 0.84rem;
}

.admin-welcome {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  color: var(--secondary-foreground);
  font-size: 0.98rem;
  line-height: 1.65;
}

.admin-welcome p {
  margin: 6px 0 0;
}

.admin-welcome-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  flex: none;
  border-radius: 12px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
</style>
