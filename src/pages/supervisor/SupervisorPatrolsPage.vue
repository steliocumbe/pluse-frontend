<template>
  <SupervisorPanel
    title="Rondas"
    description="Acompanhamento de rondas, pontos verificados, evidências recolhidas e atrasos que exigem intervenção do supervisor."
  >
    <section class="pluse-demo-grid">
      <article class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Rondas</span>
            <strong>Progresso por posto</strong>
          </div>
          <button type="button" class="kt-btn kt-btn-outline kt-btn-sm">Nova ronda</button>
        </div>

        <div class="supervisor-patrol-grid">
          <article v-for="patrol in patrols" :key="patrol.title" :class="patrol.tone">
            <strong>{{ patrol.title }}</strong>
            <p>{{ patrol.owner }}</p>
            <div class="pluse-demo-progress">
              <span :style="{ '--value': patrol.progress.includes('6/6') ? '100%' : patrol.progress.includes('4/5') ? '80%' : '25%' }" />
            </div>
            <div>
              <span>{{ patrol.progress }}</span>
              <AppBadge :variant="patrol.variant">{{ patrol.status }}</AppBadge>
            </div>
          </article>
        </div>
      </article>

      <article class="pluse-demo-panel">
        <div class="pluse-demo-section-head">
          <div>
            <span>Evidências</span>
            <strong>O que falta validar</strong>
          </div>
        </div>
        <div class="pluse-demo-required-list">
          <div>
            <span class="pluse-demo-card-icon is-amber"><AppIcon name="ki-picture" :size="17" /></span>
            <div>
              <strong>Foto do ponto 3</strong>
              <p>Banco Central Cofre precisa de fotografia complementar.</p>
            </div>
          </div>
          <div>
            <span class="pluse-demo-card-icon is-red"><AppIcon name="ki-time" :size="17" /></span>
            <div>
              <strong>Ronda atrasada</strong>
              <p>Porto Gate 4 está com apenas 1 de 4 pontos verificados.</p>
            </div>
          </div>
        </div>
      </article>
    </section>
  </SupervisorPanel>
</template>

<script setup>
import SupervisorPanel from 'src/components/operations/SupervisorPanel.vue'
import AppBadge from 'src/components/ui/AppBadge.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { patrols } from 'src/data/supervisorDemoData'
</script>
