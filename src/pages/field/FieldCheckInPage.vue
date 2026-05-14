<template>
  <AdminPageTemplate
    eyebrow="Fluxo mobile"
    title="Check-in com GPS/QR"
    description="Momento crítico do campo: validar presença com poucos toques, feedback claro e fallback para offline."
  >
    <div class="field-showcase">
      <FieldPhoneShell title="Check-in">
        <section class="field-scan-card">
          <div class="field-qr-box">
            <span />
            <span />
            <span />
            <span />
            <AppIcon name="ki-qr-code" :size="58" />
          </div>
          <strong>Leia o QR Code do posto</strong>
          <p>GPS ativo. Está dentro do raio permitido de 90 m.</p>
        </section>

        <section class="field-check-grid">
          <div>
            <AppIcon name="ki-geolocation" :size="18" />
            <strong>GPS OK</strong>
            <span>28 m do posto</span>
          </div>
          <div>
            <AppIcon name="ki-wifi" :size="18" />
            <strong>Online</strong>
            <span>Sincronização imediata</span>
          </div>
        </section>

        <router-link to="/field/check-in/result" class="field-primary-action">Confirmar check-in</router-link>
        <router-link to="/field/offline" class="field-secondary-action">Guardar offline</router-link>
      </FieldPhoneShell>

      <aside class="field-context-panel">
        <span>Rápido e confiável</span>
        <strong>O utilizador precisa saber que o sistema está a validar tudo.</strong>
        <p>A tela mostra QR, GPS, distância e estado de internet antes da confirmação.</p>
      </aside>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'
import FieldPhoneShell from 'src/components/operations/FieldPhoneShell.vue'
import AppIcon from 'src/components/ui/AppIcon.vue'
</script>
