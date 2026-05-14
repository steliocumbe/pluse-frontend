<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Postos"
    description="Locais de serviço ligados a clientes e contratos, com GPS, QR Code, lotação por turno e estado de cobertura."
  >
    <template #actions>
      <router-link to="/posts/map" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-geolocation" :size="16" icon-class="me-1.5" />
        Mapa operacional
      </router-link>
      <router-link :to="{ name: 'posts-new' }" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Novo posto
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-geolocation" :size="14" />
        184 postos
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-shield-tick" :size="14" />
        181 cobertos
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

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Lista operacional</span>
              <strong>Postos por cliente e contrato</strong>
            </div>
            <router-link to="/posts/map" class="kt-btn kt-btn-outline kt-btn-sm">Ver mapa</router-link>
          </div>

          <div class="pluse-demo-table">
            <div class="pluse-demo-table-head posts">
              <span>Posto</span>
              <span>Cliente</span>
              <span>Turno</span>
              <span>Vigilantes</span>
              <span>Estado</span>
            </div>
            <div v-for="post in posts" :key="post.code" class="pluse-demo-table-row posts">
              <div class="pluse-demo-identity">
                <span>{{ post.code }}</span>
                <div>
                  <strong>{{ post.name }}</strong>
                  <p>{{ post.address }}</p>
                </div>
              </div>
              <span>{{ post.client }}</span>
              <span>{{ post.shift }}</span>
              <span>{{ post.guards }}</span>
              <AppBadge :variant="post.variant">{{ post.status }}</AppBadge>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Configuração operacional</span>
              <strong>Posto pronto para escala</strong>
            </div>
            <AppBadge variant="primary">GPS + QR</AppBadge>
          </div>

          <div class="pluse-demo-checklist">
            <div v-for="item in readiness" :key="item.label">
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

      <section class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Próximas ações</span>
            <strong>Antes do turno iniciar</strong>
          </div>
        </div>

        <div class="pluse-demo-tasks is-three">
          <div v-for="task in tasks" :key="task.title" class="pluse-demo-task">
            <span class="pluse-demo-card-icon" :class="task.tone">
              <AppIcon :name="task.icon" :size="17" />
            </span>
            <div>
              <strong>{{ task.title }}</strong>
              <p>{{ task.copy }}</p>
            </div>
            <span>{{ task.badge }}</span>
          </div>
        </div>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { operationalPosts as posts } from 'src/data/operationsDemoData'

const stats = [
  { label: 'Postos ativos', value: '184', copy: 'ligados a contratos aprovados', icon: 'ki-geolocation', tone: 'is-blue' },
  { label: 'Cobertos hoje', value: '181', copy: 'com escala e vigilante confirmado', icon: 'ki-shield-tick', tone: 'is-green' },
  { label: 'Sem cobertura', value: '3', copy: 'precisam de substituição', icon: 'ki-warning-2', tone: 'is-red' },
  { label: 'QR pendente', value: '6', copy: 'a aguardar impressão/validação', icon: 'ki-qr-code', tone: 'is-amber' },
]

const readiness = [
  { label: 'Contrato ativo associado', copy: 'O posto só entra na escala quando o contrato está aprovado.', icon: 'ki-document', tone: 'is-green' },
  { label: 'Coordenadas GPS definidas', copy: 'Permite validar check-ins dentro do raio permitido.', icon: 'ki-geolocation', tone: 'is-blue' },
  { label: 'QR Code único do posto', copy: 'Garante prova de presença no local correto.', icon: 'ki-qr-code', tone: 'is-amber' },
  { label: 'Lotação por turno', copy: 'Define quantos vigilantes devem estar em cada período.', icon: 'ki-people', tone: 'is-red' },
]

const tasks = [
  { title: 'Confirmar substituto', copy: 'Porto Gate 4 está com uma vaga no turno noturno.', badge: '1', icon: 'ki-user-tick', tone: 'is-red' },
  { title: 'Emitir QR Code', copy: '6 postos novos precisam de etiqueta física.', badge: '6', icon: 'ki-qr-code', tone: 'is-amber' },
  { title: 'Rever raio GPS', copy: '3 postos remotos precisam de tolerância ajustada.', badge: '3', icon: 'ki-geolocation', tone: 'is-blue' },
]
</script>
