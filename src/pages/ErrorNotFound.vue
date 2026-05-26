<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-illustration">
        <span class="error-code">404</span>
        <AppIcon name="ki-questionnaire-tablet" :size="64" class="error-icon" />
      </div>

      <h1 class="error-title">Página não encontrada</h1>
      <p class="error-sub">
        O endereço que tentou abrir não existe ou foi movido. Verifique o URL
        ou volte ao início.
      </p>

      <div class="error-actions">
        <q-btn
          unelevated
          color="primary"
          icon="home"
          label="Voltar ao início"
          no-caps
          :to="homeRoute"
        />
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Página anterior"
          no-caps
          @click="$router.back()"
        />
      </div>

      <p v-if="path" class="error-path">
        Tentou aceder a: <code>{{ path }}</code>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import AppIcon from 'src/components/ui/AppIcon.vue'

const route = useRoute()
const auth = useAuthStore()

const path = computed(() => route.fullPath)
const homeRoute = computed(() => (auth.isAuthenticated ? '/' : '/auth/login'))
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, .12), transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(14, 165, 233, .10), transparent 55%),
    #f8fafc;
}

.error-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 20px 50px -20px rgba(15, 23, 42, .15);
}

.error-illustration {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.error-code {
  font-size: 96px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -.04em;
}
.error-icon {
  position: absolute;
  right: -36px;
  bottom: 4px;
  color: #cbd5e1;
}

.error-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}
.error-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
@media (min-width: 480px) {
  .error-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.error-path {
  font-size: 12px;
  color: #94a3b8;
  margin: 16px 0 0;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.error-path code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #475569;
}
</style>
