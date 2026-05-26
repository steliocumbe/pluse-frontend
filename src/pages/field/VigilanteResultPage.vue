<template>
  <div class="vig-page">
    <article class="vig-card vig-result vig-result--success">
      <div class="vig-result-icon">
        <AppIcon name="ki-check-circle" :size="48" />
      </div>
      <h2>{{ isCheckOut ? 'Saída registada!' : 'Presença confirmada!' }}</h2>
      <p v-if="shift">
        {{ shift.post_name }} · {{ formatDateTime(isCheckOut ? shift.checked_out_at : shift.checked_in_at) }}
      </p>
      <p v-else>O registo foi enviado ao sistema.</p>
    </article>

    <section class="vig-section" v-if="shift">
      <header class="vig-section-head"><h3>Resumo do turno</h3></header>
      <article class="vig-card vig-summary">
        <div class="vig-summary-row">
          <span>Turno</span>
          <strong>{{ shift.period_display }}</strong>
        </div>
        <div class="vig-summary-row">
          <span>Cliente</span>
          <strong>{{ shift.client_name }}</strong>
        </div>
        <div class="vig-summary-row">
          <span>Entrada</span>
          <strong>{{ formatDateTime(shift.checked_in_at) }}</strong>
        </div>
        <div class="vig-summary-row" v-if="shift.checked_out_at">
          <span>Saída</span>
          <strong>{{ formatDateTime(shift.checked_out_at) }}</strong>
        </div>
      </article>
    </section>

    <div class="vig-bottom-actions">
      <router-link to="/vigilante/escala" class="vig-btn vig-btn--primary vig-btn--block">
        <AppIcon name="ki-calendar" :size="18" /> Voltar à escala
      </router-link>
      <router-link to="/vigilante/ocorrencia" class="vig-btn vig-btn--ghost vig-btn--block">
        <AppIcon name="ki-warning-2" :size="18" /> Reportar ocorrência
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { vigilanteService } from 'src/services/vigilante.service'

const route = useRoute()
const shift = ref(null)

const isCheckOut = computed(() => route.query.mode === 'out')

onMounted(async () => {
  const data = await vigilanteService.today()
  shift.value = data.shift
})

function formatDateTime(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
@import './vigilante-shared.css';

.vig-result {
  text-align: center;
  padding: 32px 24px;
}
.vig-result--success {
  background: linear-gradient(135deg, #dcfce7, #ecfdf5);
  border-color: #86efac;
  color: #14532d;
}
.vig-result-icon {
  width: 80px; height: 80px;
  border-radius: 26px;
  background: #fff;
  margin: 0 auto 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px -2px rgba(22,101,52,.25);
}
.vig-result h2 { font-size: 20px; font-weight: 700; margin: 0 0 6px; }
.vig-result p { font-size: 13px; opacity: .85; margin: 0; }

.vig-summary { display: flex; flex-direction: column; gap: 10px; }
.vig-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
  font-size: 0.9rem;
}
.vig-summary-row:last-child { border-bottom: 0; }
.vig-summary-row span { color: #64748b; font-weight: 750; }
.vig-summary-row strong { color: #0f2544; font-weight: 850; text-align: right; }

.vig-bottom-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
</style>
