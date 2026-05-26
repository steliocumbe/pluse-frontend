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
        {{ activeContracts }} activos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-time" :size="14" />
        {{ pendingContracts }} por parametrizar
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { postService } from 'src/services/post.service'

const route = useRoute()

const posts = ref([])
const loading = ref(false)

function money(value) {
  return `${new Intl.NumberFormat('pt-PT').format(Math.round(Number(value || 0)))} MT`
}

async function fetchContracts() {
  loading.value = true
  try {
    const data = await postService.list({ page_size: 500 })
    posts.value = data?.results ?? data ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchContracts)

const contracts = computed(() => {
  const map = new Map()
  for (const post of posts.value) {
    const client = post.client_name || 'Sem cliente'
    const item = map.get(client) || {
      code: `COM-${String(map.size + 1).padStart(3, '0')}`,
      name: 'Contrato operacional',
      client,
      posts: 0,
      amountValue: 0,
      status: 'Ativo',
      variant: 'success',
      view: 'active',
    }
    item.posts += 1
    item.amountValue += Number(post.billing_amount || 0)
    if (!post.billing_amount) {
      item.status = 'Pendente'
      item.variant = 'info'
      item.view = 'pending'
    }
    map.set(client, item)
  }
  return [...map.values()].map((item) => ({
    ...item,
    period: `${item.posts} posto(s) parametrizado(s)`,
    amount: money(item.amountValue),
  }))
})

const activeContracts = computed(() => contracts.value.filter((contract) => contract.view === 'active').length)
const pendingContracts = computed(() => contracts.value.filter((contract) => contract.view === 'pending').length)
const expiringContracts = computed(() => 0)
const monthlyAmount = computed(() => contracts.value.reduce((sum, item) => sum + item.amountValue, 0))

const stats = computed(() => [
  { label: 'Ativos', value: activeContracts.value, copy: 'clientes com postos faturáveis', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Pendentes', value: pendingContracts.value, copy: 'faltam valores de faturação', icon: 'ki-time', tone: 'is-amber' },
  { label: 'A expirar', value: expiringContracts.value, copy: 'requer entidade comercial dedicada', icon: 'ki-calendar', tone: 'is-red' },
  { label: 'Valor mensal', value: money(monthlyAmount.value), copy: 'base dos postos ativos', icon: 'ki-dollar', tone: 'is-blue' },
])
const activeViewLabel = computed(() => {
  const map = { active: 'Ativos', pending: 'Pendentes', expiring: 'A expirar' }
  return map[route.params.view] || 'Todos'
})

const filteredContracts = computed(() => {
  const view = route.params.view
  if (!view) return contracts.value
  return contracts.value.filter((contract) => contract.view === view)
})

const approvalColumns = computed(() => [
  {
    title: 'Pendentes de parametrização',
    variant: 'info',
    tone: 'is-blue',
    icon: 'ki-document',
    items: contracts.value.filter((item) => item.view === 'pending').slice(0, 4).map((item) => ({
      name: item.client,
      copy: 'Complete o valor mensal dos postos para fechar a base comercial.',
      amount: `${item.posts} posto(s)`,
    })),
  },
  {
    title: 'Activos',
    variant: 'success',
    tone: 'is-green',
    icon: 'ki-check-circle',
    items: contracts.value.filter((item) => item.view === 'active').slice(0, 4).map((item) => ({
      name: item.client,
      copy: 'Contrato operacional derivado dos postos activos.',
      amount: item.amount,
    })),
  },
])
const validations = computed(() => [
  { label: 'Cliente aprovado', copy: 'A base comercial parte do cliente cadastrado e dos seus postos.', icon: 'ki-check-circle', tone: 'is-green' },
  { label: 'Valor mensal definido', copy: `${pendingContracts.value} cliente(s) ainda têm posto sem valor de facturação.`, icon: 'ki-dollar', tone: pendingContracts.value ? 'is-amber' : 'is-green' },
  { label: 'Postos ligados', copy: `${posts.value.length} posto(s) alimentam a base comercial actual.`, icon: 'ki-geolocation', tone: 'is-blue' },
  { label: 'Próximo passo', copy: 'Criar entidade própria de contrato comercial para anexos, vigência e aprovações.', icon: 'ki-shield-tick', tone: 'is-red' },
])</script>
