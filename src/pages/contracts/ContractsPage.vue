<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Contratos"
    description="Contratos transformam clientes em operação: definem valor, período, postos, turnos e regras de faturação."
  >
    <template #actions>
      <button type="button" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-filter" :size="16" icon-class="me-1.5" />
        {{ activeViewLabel }}
      </button>
      <router-link :to="{ name: 'contracts-new' }" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Novo contrato
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-document" :size="14" />
        36 activos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-time" :size="14" />
        4 aguardam aprovação
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-stats">
        <article v-for="item in stats" :key="item.label" class="pluse-demo-stat" :class="item.tone">
          <span class="pluse-demo-stat-icon">
            <AppIcon :name="item.icon" :size="19" />
          </span>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.copy }}</p>
        </article>
      </section>

      <section class="pluse-demo-kanban">
        <article v-for="column in approvalColumns" :key="column.title" class="pluse-demo-kanban-column">
          <div class="pluse-demo-kanban-title">
            <span>{{ column.title }}</span>
            <AppBadge :variant="column.variant">{{ column.items.length }}</AppBadge>
          </div>
          <div class="pluse-demo-contract-list">
            <div v-for="item in column.items" :key="item.name" class="pluse-demo-contract">
              <span class="pluse-demo-card-icon" :class="column.tone">
                <AppIcon :name="column.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.copy }}</p>
              </div>
              <span>{{ item.amount }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Lista operacional</span>
              <strong>Contratos que alimentam postos</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Ver aprovação</button>
          </div>

          <div class="pluse-demo-table">
            <div class="pluse-demo-table-head contracts">
              <span>Contrato</span>
              <span>Cliente</span>
              <span>Postos</span>
              <span>Valor mensal</span>
              <span>Estado</span>
            </div>
            <div v-for="contract in filteredContracts" :key="contract.code" class="pluse-demo-table-row contracts">
              <div class="pluse-demo-identity">
                <span>{{ contract.code }}</span>
                <div>
                  <strong>{{ contract.name }}</strong>
                  <p>{{ contract.period }}</p>
                </div>
              </div>
              <span>{{ contract.client }}</span>
              <span>{{ contract.posts }}</span>
              <span>{{ contract.amount }}</span>
              <AppBadge :variant="contract.variant">{{ contract.status }}</AppBadge>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Regras do contrato</span>
              <strong>Validacoes antes de activar</strong>
            </div>
          </div>

          <div class="pluse-demo-checklist">
            <div v-for="item in validations" :key="item.label">
              <span :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.label }}</strong>
                <p>{{ item.copy }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const route = useRoute()

const stats = [
  { label: 'Ativos', value: '36', copy: 'contratos em operação', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Pendentes', value: '4', copy: 'aguardam aprovação', icon: 'ki-time', tone: 'is-amber' },
  { label: 'A expirar', value: '7', copy: 'nos próximos 30 dias', icon: 'ki-calendar', tone: 'is-red' },
  { label: 'Valor mensal', value: '8.400.000 MT', copy: 'base contratada', icon: 'ki-dollar', tone: 'is-blue' },
]

const contracts = [
  { code: 'C-104', name: 'Segurança perimetral', client: 'MozMall Retail', period: '01/05/2026 - 30/04/2027', posts: 18, amount: '1.280.000 MT', status: 'Ativo', variant: 'success', view: 'active' },
  { code: 'C-097', name: 'Proteccao industrial', client: 'Porto Logística', period: '15/03/2026 - 14/03/2027', posts: 12, amount: '940.000 MT', status: 'Ativo', variant: 'success', view: 'active' },
  { code: 'C-088', name: 'Agencias e cofre', client: 'Banco Central', period: 'Expira em 22 dias', posts: 9, amount: '810.000 MT', status: 'A expirar', variant: 'warning', view: 'expiring' },
  { code: 'C-121', name: 'Servico hospitalar', client: 'Hospital Maputo', period: 'Aguardando Direção', posts: 7, amount: '520.000 MT', status: 'Pendente', variant: 'info', view: 'pending' },
  { code: 'C-122', name: 'Armazens Norte', client: 'Nacala Storage', period: 'Aguardando Financeiro', posts: 5, amount: '410.000 MT', status: 'Pendente', variant: 'info', view: 'pending' },
]

const activeViewLabel = computed(() => {
  const map = { active: 'Ativos', pending: 'Pendentes', expiring: 'A expirar' }
  return map[route.params.view] || 'Todos'
})

const filteredContracts = computed(() => {
  const view = route.params.view
  if (!view) return contracts
  return contracts.filter((contract) => contract.view === view)
})

const approvalColumns = [
  {
    title: 'Em preparacao',
    variant: 'info',
    tone: 'is-blue',
    icon: 'ki-document',
    items: [
      { name: 'Hospital Maputo', copy: 'Falta confirmar turnos noturnos.', amount: '520.000 MT' },
      { name: 'Nacala Storage', copy: 'Aguardando proposta assinada.', amount: '410.000 MT' },
    ],
  },
  {
    title: 'Aguardando aprovação',
    variant: 'warning',
    tone: 'is-amber',
    icon: 'ki-time',
    items: [
      { name: 'Banco Central', copy: 'Renovacao com ajuste de 2 postos.', amount: '810.000 MT' },
      { name: 'MozMall Retail', copy: 'Aditivo para estacionamento.', amount: '180.000 MT' },
    ],
  },
  {
    title: 'Prontos para postos',
    variant: 'success',
    tone: 'is-green',
    icon: 'ki-check-circle',
    items: [
      { name: 'Porto Logística', copy: 'Contrato activo e parametrizado.', amount: '12 postos' },
      { name: 'MozMall Retail', copy: 'Escalas liberadas para operações.', amount: '18 postos' },
    ],
  },
]

const validations = [
  { label: 'Cliente aprovado', copy: 'Dados fiscais e contacto operacional confirmados.', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Valor e período definidos', copy: 'Base necessária para relatório de faturação.', icon: 'ki-dollar', tone: 'is-blue' },
  { label: 'Regras de posto pendentes', copy: 'Alguns contratos ainda nao definiram turnos e lotacao.', icon: 'ki-warning-2', tone: 'is-amber' },
  { label: 'Aprovacao obrigatoria', copy: 'Contratos sensiveis precisam de Direção antes de activar.', icon: 'ki-shield-tick', tone: 'is-red' },
]
</script>
