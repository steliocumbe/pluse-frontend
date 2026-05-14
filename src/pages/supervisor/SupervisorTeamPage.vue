<template>
  <SupervisorPanel
    title="Equipa em campo"
    description="Visão do supervisor sobre vigilantes em serviço, atrasos, ausências e situações que precisam ser comunicadas ao Centro de Controlo Operacional."
  >
    <section class="pluse-demo-grid">
      <article class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Equipa</span>
            <strong>Estado por vigilante</strong>
          </div>
          <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Contactar todos</button>
        </div>

        <div class="supervisor-list">
          <div v-for="member in fieldTeam" :key="member.name">
            <div>
              <strong>{{ member.name }}</strong>
              <p>{{ member.post }} - {{ member.last }}</p>
            </div>
            <AppBadge :variant="member.variant">{{ member.status }}</AppBadge>
          </div>
        </div>
      </article>

      <article class="pluse-demo-panel supervisor-decision-card">
        <span>Prioridade do supervisor</span>
        <strong>Resolver ausências antes de escalar</strong>
        <p>O supervisor confirma presença, aciona substituto ou envia o caso ao Centro de Controlo Operacional quando precisa de decisão central.</p>
        <router-link to="/supervisor/attendance-confirmation" class="kt-btn kt-btn-primary">Confirmar presença</router-link>
      </article>
    </section>
  </SupervisorPanel>
</template>

<script setup>
import SupervisorPanel from 'src/components/operations/SupervisorPanel.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import { fieldTeam } from 'src/data/supervisorDemoData'
</script>
