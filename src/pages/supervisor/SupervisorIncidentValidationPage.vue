<template>
  <SupervisorPanel
    title="Validação de ocorrência"
    description="Tela para o supervisor rever evidências, decidir prioridade e encaminhar casos relevantes ao Centro de Controlo Operacional."
  >
    <section class="pluse-demo-grid">
      <article class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Ocorrências</span>
            <strong>Fila de validação</strong>
          </div>
          <AppBadge variant="danger">2 críticas</AppBadge>
        </div>

        <div class="supervisor-list">
          <div v-for="item in supervisorIncidents" :key="item.code">
            <div>
              <strong>{{ item.code }} - {{ item.title }}</strong>
              <p>{{ item.post }} - {{ item.evidence }}</p>
            </div>
            <AppBadge :variant="item.variant">{{ item.status }}</AppBadge>
          </div>
        </div>
      </article>

      <article class="pluse-demo-panel supervisor-validation">
        <span>Decisão</span>
        <strong>Check-in fora do raio</strong>
        <p>GPS a 180 m do posto, sem fotografia final. O supervisor pode aprovar com ressalva, pedir evidência ou escalar.</p>
        <div class="supervisor-action-row">
          <button type="button" class="kt-btn kt-btn-outline">Pedir evidência</button>
          <button type="button" class="kt-btn kt-btn-primary">Escalar ao comando</button>
        </div>
      </article>
    </section>
  </SupervisorPanel>
</template>

<script setup>
import SupervisorPanel from 'src/components/operations/SupervisorPanel.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import { supervisorIncidents } from 'src/data/supervisorDemoData'
</script>
