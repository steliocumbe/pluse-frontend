<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Detalhe do posto"
    description="Informação essencial para o vigilante validar local, regras do cliente e tarefas do turno."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Detalhe do posto">
        <section class="field-map-preview">
          <div>
            <AppIcon name="ki-geolocation" :size="28" />
            <strong>{{ fieldPost.name }}</strong>
            <span>Raio permitido: {{ fieldPost.radius }}</span>
          </div>
        </section>

        <section class="field-card-list">
          <article>
            <span>Cliente</span>
            <strong>{{ fieldPost.client }}</strong>
            <p>{{ fieldPost.address }}</p>
          </article>
          <article>
            <span>QR Code</span>
            <strong>{{ fieldPost.qr }}</strong>
            <p>Obrigatório para confirmar presença neste posto.</p>
          </article>
        </section>

        <section class="field-instructions">
          <strong>Instruções do turno</strong>
          <p v-for="item in fieldPost.instructions" :key="item">{{ item }}</p>
        </section>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Confiança no terreno</span>
        <strong>O posto precisa ser inequívoco.</strong>
        <p>Endereço, raio GPS, QR Code e instruções ficam juntos para evitar check-ins no local errado.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { fieldPost } from 'src/data/fieldDemoData'
</script>
