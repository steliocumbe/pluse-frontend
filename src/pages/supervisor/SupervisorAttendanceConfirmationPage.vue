<template>
  <SupervisorPanel
    title="Confirmação de presença ou ausência"
    description="Decisão do supervisor sobre presença duvidosa, ausência real ou registo offline sincronizado."
  >
    <section class="pluse-demo-grid">
      <article class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Confirmações</span>
            <strong>Presenças que precisam de decisão</strong>
          </div>
          <AppBadge variant="warning">9 pendentes</AppBadge>
        </div>

        <div class="supervisor-list">
          <div v-for="item in attendanceConfirmations" :key="item.name">
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.post }} - {{ item.reason }}</p>
            </div>
            <AppBadge :variant="item.variant">{{ item.action }}</AppBadge>
          </div>
        </div>
      </article>

      <article class="pluse-demo-panel supervisor-validation">
        <span>Ponte com o comando</span>
        <strong>Decisão auditável</strong>
        <p>Cada confirmação guarda motivo, evidência e responsável. A Base de Operações recebe apenas os casos escalados ou bloqueantes.</p>
        <div class="supervisor-action-row">
          <button type="button" class="kt-btn kt-btn-outline">Marcar ausência</button>
          <button type="button" class="kt-btn kt-btn-primary">Confirmar presença</button>
        </div>
      </article>
    </section>
  </SupervisorPanel>
</template>

<script setup>
import SupervisorPanel from 'src/components/operations/SupervisorPanel.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import { attendanceConfirmations } from 'src/data/supervisorDemoData'
</script>
