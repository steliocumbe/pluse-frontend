<template>
  <AdminPageTemplate
    eyebrow="Operações"
    title="Mapa de postos"
    description="Visão geográfica dos postos ativos, estado de cobertura, validação GPS e pontos que exigem ação antes do próximo turno."
  >
    <template #actions>
      <router-link to="/posts" class="kt-btn kt-btn-outline pluse-demo-hero-action">
        <AppIcon name="ki-row-horizontal" :size="16" icon-class="me-1.5" />
        Lista de postos
      </router-link>
      <router-link :to="{ name: 'posts-new' }" class="kt-btn kt-btn-primary pluse-demo-hero-primary">
        <AppIcon name="ki-plus" :size="16" icon-class="me-1.5" />
        Novo posto
      </router-link>
    </template>

    <template #meta>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-geolocation" :size="14" />
        184 postos monitorados
      </span>
      <span class="pluse-demo-meta">
        <AppIcon name="ki-warning-2" :size="14" />
        3 pontos em risco
      </span>
    </template>

    <div class="pluse-demo-page">
      <section class="pluse-demo-post-layout">
        <OperationsMap :posts="posts" :zoom="11" />

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Cobertura geográfica</span>
              <strong>Estado por zona operacional</strong>
            </div>
            <AppBadge variant="primary">Ao vivo</AppBadge>
          </div>

          <div class="pluse-demo-alert-stack">
            <div v-for="post in posts" :key="post.code" class="pluse-demo-alert" :class="post.tone">
              <span class="pluse-demo-card-icon" :class="post.tone">
                <AppIcon name="ki-geolocation" :size="17" />
              </span>
              <div>
                <strong>{{ post.name }}</strong>
                <p>{{ post.client }} - {{ post.guards }} vigilantes - último registo: {{ post.lastCheckIn }}</p>
              </div>
              <AppBadge :variant="post.variant">{{ post.status }}</AppBadge>
            </div>
          </div>
        </article>
      </section>

      <section class="pluse-demo-grid">
        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Zonas</span>
              <strong>Leitura rápida da cobertura</strong>
            </div>
          </div>

          <div class="pluse-demo-tasks">
            <div v-for="zone in zones" :key="zone.title" class="pluse-demo-task">
              <span class="pluse-demo-card-icon" :class="zone.tone">
                <AppIcon :name="zone.icon" :size="17" />
              </span>
              <div>
                <strong>{{ zone.title }}</strong>
                <p>{{ zone.copy }}</p>
              </div>
              <span>{{ zone.badge }}</span>
            </div>
          </div>
        </article>

        <article class="pluse-demo-panel">
          <div class="pluse-demo-section-head">
            <div>
              <span>Validação</span>
              <strong>Regras aplicadas no terreno</strong>
            </div>
          </div>

          <div class="pluse-demo-required-list">
            <div v-for="item in rules" :key="item.title">
              <span class="pluse-demo-card-icon" :class="item.tone">
                <AppIcon :name="item.icon" :size="17" />
              </span>
              <div>
                <strong>{{ item.title }}</strong>
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
import OperationsMap from 'src/components/operations/OperationsMap.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { operationalPosts as posts } from 'src/data/operationsDemoData'

const zones = [
  { title: 'Centro urbano', copy: '62 postos, 118 vigilantes e cobertura completa no turno diurno.', badge: '100%', icon: 'ki-shield-tick', tone: 'is-green' },
  { title: 'Zona industrial', copy: '38 postos, 4 validações fora do raio e 1 posto em risco.', badge: '96%', icon: 'ki-warning-2', tone: 'is-amber' },
  { title: 'Postos críticos', copy: 'Banco, hospital e cofres com GPS, QR Code e foto obrigatórios.', badge: '24h', icon: 'ki-lock', tone: 'is-blue' },
]

const rules = [
  { title: 'Raio GPS configurável', copy: 'Cada posto define a tolerância permitida para check-ins em campo.', icon: 'ki-geolocation', tone: 'is-blue' },
  { title: 'QR Code por posto', copy: 'Ajuda a confirmar presença física no local correto.', icon: 'ki-qr-code', tone: 'is-green' },
  { title: 'Escala bloqueante', copy: 'Postos sem contrato ativo ou sem lotação não entram no planeamento.', icon: 'ki-lock', tone: 'is-red' },
]
</script>
