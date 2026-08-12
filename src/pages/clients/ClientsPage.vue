<template>
  <AdminPageTemplate
    eyebrow="Cadastros"
    title="Clientes"
    description="Carteira de clientes, contratos activos e cobertura operacional preparada para postos e escalas."
  >
    <template #actions>
      <button type="button" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-cloud-download" :size="16" icon-class="me-1.5" />
        Exportar
      </button>
      <router-link :to="{ name: 'clients-new' }" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Novo cliente
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-profile-user" :size="14" />
        24 clientes registados
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-document" :size="14" />
        36 contratos activos
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

      <section class="pluse-demo-flow">
        <div class="pluse-demo-section-head">
          <div>
            <span>Fluxo comercial</span>
            <strong>Do cliente ao posto operacional</strong>
          </div>
          <AppBadge variant="primary">Fluxo MVP</AppBadge>
        </div>

        <div class="pluse-demo-flow-steps">
          <div v-for="(step, index) in flowSteps" :key="step.title" class="pluse-demo-flow-step">
            <span class="is-blue">{{ index + 1 }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.copy }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Carteira activa</span>
              <strong>Clientes prioritarios</strong>
            </div>
            <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Filtrar</button>
          </div>

          <div class="pluse-demo-table">
            <div class="pluse-demo-table-head clients">
              <span>Cliente</span>
              <span>Sector</span>
              <span>Contratos</span>
              <span>Postos</span>
              <span>Estado</span>
            </div>
            <div v-for="client in clients" :key="client.name" class="pluse-demo-table-row clients">
              <div class="pluse-demo-identity">
                <span>{{ client.initials }}</span>
                <div>
                  <strong>{{ client.name }}</strong>
                  <p>{{ client.contact }}</p>
                </div>
              </div>
              <span>{{ client.sector }}</span>
              <span>{{ client.contracts }}</span>
              <span>{{ client.posts }}</span>
              <AppBadge :variant="client.statusVariant">{{ client.status }}</AppBadge>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Qualidade do cadastro</span>
              <strong>Pronto para contrato</strong>
            </div>
          </div>

          <div class="pluse-demo-checklist">
            <div v-for="item in readiness" :key="item.label">
              <span :class="item.done ? 'is-green' : 'is-amber'">
                <AppIcon :name="item.done ? 'ki-check-circle' : 'ki-time'" :size="17" />
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
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'

const stats = [
  { label: 'Clientes ativos', value: '24', copy: '18 com operação diária', icon: 'ki-profile-user', tone: 'is-blue' },
  { label: 'Contratos ligados', value: '36', copy: '4 aguardam aprovação', icon: 'ki-document', tone: 'is-green' },
  { label: 'Postos gerados', value: '184', copy: '181 com cobertura prevista', icon: 'ki-geolocation', tone: 'is-amber' },
  { label: 'Receita mensal', value: '8.400.000 MT', copy: 'base operacional estimada', icon: 'ki-dollar', tone: 'is-red' },
]

const flowSteps = [
  { title: 'Cadastrar cliente', copy: 'Dados fiscais, responsável, contactos e zona operacional.' },
  { title: 'Criar contrato', copy: 'Período, serviço, valor e regras de faturação.' },
  { title: 'Gerar postos', copy: 'Cada posto recebe GPS, QR Code e necessidade por turno.' },
  { title: 'Planear escalas', copy: 'Operações aloca vigilantes e resolve conflitos antes do turno.' },
]

const clients = [
  { initials: 'MR', name: 'MozMall Retail', contact: 'Ana Muchanga - Operações', sector: 'Retalho', contracts: 3, posts: 18, status: 'Ativo', statusVariant: 'success' },
  { initials: 'PL', name: 'Porto Logística', contact: 'Carlos Nhampossa - Segurança', sector: 'Logística', contracts: 2, posts: 12, status: 'Ativo', statusVariant: 'success' },
  { initials: 'BC', name: 'Banco Central', contact: 'Marta Uamusse - Administração', sector: 'Financeiro', contracts: 2, posts: 9, status: 'Renovação', statusVariant: 'warning' },
  { initials: 'HM', name: 'Hospital Maputo', contact: 'Helena Macamo - Serviços gerais', sector: 'Saúde', contracts: 1, posts: 7, status: 'Pendente', statusVariant: 'info' },
]

const readiness = [
  { label: 'Dados fiscais validados', copy: 'NUIT, contacto principal e morada completos.', done: true },
  { label: 'Responsável operacional definido', copy: 'Contacto que recebe alertas e relatórios.', done: true },
  { label: 'Contratos em revisão', copy: '4 contratos ainda precisam de aprovação.', done: false },
  { label: 'Postos por configurar', copy: '3 postos faltam coordenadas GPS.', done: false },
]
</script>
