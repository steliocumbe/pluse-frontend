<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Escala do dia"
    description="Primeira tela do vigilante em campo: clara, rápida e focada no próximo passo do turno."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Escala do dia">
        <section class="field-hero-card">
          <span>{{ fieldShift.date }}</span>
          <strong>{{ fieldShift.currentPost }}</strong>
          <p>{{ fieldShift.shift }} com supervisor {{ fieldShift.supervisor }}</p>
          <router-link to="/field/check-in" class="field-primary-action">Iniciar check-in</router-link>
        </section>

        <div class="field-timeline">
          <article v-for="item in fieldSchedule" :key="item.title" :class="item.tone">
            <time>{{ item.time }}</time>
            <span class="field-dot">
              <AppIcon :name="item.icon" :size="16" />
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.copy }}</p>
              <small>{{ item.status }}</small>
            </div>
          </article>
        </div>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Experiência esperada</span>
        <strong>O vigilante deve perceber imediatamente onde ir e qual ação fazer.</strong>
        <p>Esta tela reduz dúvidas no terreno: mostra turno, posto, supervisor, progresso do dia e o botão principal para check-in.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { fieldSchedule, fieldShift } from 'src/data/fieldDemoData'
</script>
