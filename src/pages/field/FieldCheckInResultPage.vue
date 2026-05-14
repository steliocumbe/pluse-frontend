<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Sucesso/erro de check-in"
    description="Feedback imediato para o vigilante saber se pode iniciar o turno ou se precisa corrigir algo."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Check-in validado">
        <section class="field-result-card is-success">
          <span>
            <AppIcon name="ki-check-circle" :size="44" />
          </span>
          <strong>Presença confirmada</strong>
          <p>MozMall Entrada Norte, 06:02. GPS, QR Code e horário validados.</p>
        </section>

        <section class="field-card-list">
          <article>
            <span>Comprovativo</span>
            <strong>PL-CHK-2026-0018</strong>
            <p>O supervisor e o Centro de Controlo Operacional já foram atualizados.</p>
          </article>
          <article class="is-warning">
            <span>Exemplo de erro</span>
            <strong>Fora do raio permitido</strong>
            <p>Quando acontecer, o registo vai para validação do supervisor.</p>
          </article>
        </section>

        <router-link to="/field/incidents/new" class="field-secondary-action">Reportar ocorrência</router-link>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Feedback sem ambiguidade</span>
        <strong>O sucesso deve tranquilizar. O erro deve orientar.</strong>
        <p>A resposta mostra comprovativo, motivo e próxima ação sem obrigar o vigilante a interpretar códigos técnicos.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
</script>
