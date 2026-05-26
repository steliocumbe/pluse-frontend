<template>
  <div class="error-page">
    <div class="error-shell">
      <div class="error-visual" aria-hidden="true">
        <span class="error-code">404</span>
        <span class="error-radar">
          <AppIcon name="ki-geolocation" :size="34" />
        </span>
      </div>

      <div class="error-copy">
        <p class="error-eyebrow">Rota fora do posto</p>
        <div class="error-title">Esta página saiu para uma ronda e ainda não voltou.</div>
        <p class="error-sub">
          O endereço pode ter mudado, estar incompleto ou pertencer a uma funcionalidade que ainda não foi publicada.
          Vamos levar-te para um lugar seguro.
        </p>
      </div>

      <div class="error-actions">
        <q-btn
          unelevated
          no-caps
          icon="home"
          label="Ir para o início"
          class="error-primary"
          :to="homeRoute"
        />
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Voltar"
          class="error-secondary"
          @click="$router.back()"
        />
      </div>

      <p v-if="path" class="error-path">
        Tentativa registada em <code>{{ path }}</code>
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
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(15, 37, 68, 0.04), rgba(63, 109, 246, 0.08)),
    #f5f8fc;
}

.error-shell {
  position: relative;
  width: min(100%, 620px);
  overflow: hidden;
  border: 1px solid #d9e3f0;
  border-radius: 24px;
  background: #ffffff;
  padding: clamp(28px, 5vw, 48px);
  text-align: center;
  box-shadow: 0 26px 80px rgba(15, 37, 68, 0.14);
}

.error-shell::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    radial-gradient(circle at 20% 0%, rgba(63, 109, 246, 0.12), transparent 32%),
    radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.12), transparent 34%);
  pointer-events: none;
}

.error-visual,
.error-copy,
.error-actions,
.error-path {
  position: relative;
  z-index: 1;
}

.error-visual {
  display: inline-grid;
  margin-bottom: 22px;
  place-items: center;
}

.error-code {
  color: #0f2544;
  font-size: clamp(5rem, 18vw, 9rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.88;
}

.error-radar {
  display: grid;
  width: 64px;
  height: 64px;
  margin-top: -18px;
  border: 1px solid #cfe0f6;
  border-radius: 18px;
  background: #eef5ff;
  color: #3f6df6;
  place-items: center;
  box-shadow: 0 12px 28px rgba(63, 109, 246, 0.18);
}

.error-eyebrow {
  margin: 0 0 8px;
  color: #3f6df6;
  font-size: 0.82rem;
  font-weight: 850;
  text-transform: uppercase;
}

.error-title {
  margin: 0 auto;
  max-width: 520px;
  color: #07111f;
  font-size: clamp(1.55rem, 4vw, 2.15rem);
  font-weight: 850;
  line-height: 1.1;
}

.error-sub {
  max-width: 500px;
  margin: 14px auto 0;
  color: #58708e;
  font-size: 1rem;
  line-height: 1.65;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
}

.error-primary {
  background: #3f6df6;
  color: #ffffff;
}

.error-secondary {
  color: #3152b8;
}

.error-path {
  margin: 22px 0 0;
  border-top: 1px solid #edf2f8;
  padding-top: 16px;
  color: #7890aa;
  font-size: 0.82rem;
}

.error-path code {
  border-radius: 8px;
  background: #eef4ff;
  color: #3152b8;
  padding: 3px 7px;
}
</style>
