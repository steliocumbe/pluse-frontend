<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Check-in offline pendente"
    description="Fallback de confiança para zonas com internet instável, mantendo evidências e fila de sincronização visíveis."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Modo offline">
        <section class="field-result-card is-offline">
          <span>
            <AppIcon name="ki-cloud" :size="44" />
          </span>
          <strong>Check-in guardado</strong>
          <p>O registo será enviado automaticamente quando a ligação voltar.</p>
        </section>

        <section class="field-card-list">
          <article v-for="item in offlineQueue" :key="item.title" :class="item.tone">
            <span>{{ item.badge }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.copy }}</p>
          </article>
        </section>

        <button type="button" class="field-primary-action">Tentar sincronizar</button>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Sem internet, sem pânico</span>
        <strong>O vigilante vê exatamente o que ficou guardado.</strong>
        <p>O objetivo é transmitir segurança operacional mesmo em campo com conectividade fraca.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { offlineQueue } from 'src/data/fieldDemoData'
</script>
