<template>
  <div class="vig-page">
    <article class="vig-card vig-target" v-if="post">
      <div class="vig-target-icon">
        <AppIcon name="ki-warning-2" :size="22" />
      </div>
      <div class="vig-target-body">
        <p class="vig-eyebrow">Reportar ao supervisor</p>
        <h2>{{ post.name }}</h2>
        <p>{{ post.client_name }}</p>
      </div>
    </article>

    <form class="vig-card vig-form" @submit.prevent="onSubmit">
      <label class="vig-field">
        <span>Tipo de ocorrência *</span>
        <select v-model="form.incident_type" required>
          <option v-for="o in incidentTypeOptions" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
      </label>

      <label class="vig-field">
        <span>Gravidade *</span>
        <div class="vig-severity-grid">
          <button
            v-for="o in severityOptions"
            :key="o.value"
            type="button"
            :class="['vig-sev', `vig-sev--${o.value}`, { 'is-active': form.severity === o.value }]"
            @click="form.severity = o.value"
          >
            {{ o.label }}
          </button>
        </div>
      </label>

      <label class="vig-field">
        <span>Local específico</span>
        <input
          v-model="form.location_description"
          type="text"
          placeholder="Ex: portaria sul, sala técnica…"
        />
      </label>

      <label class="vig-field">
        <span>Descrição *</span>
        <textarea
          v-model="form.description"
          rows="5"
          required
          placeholder="O que aconteceu? Quem estava envolvido? O que fez?"
        />
      </label>

      <label class="vig-field vig-photo">
        <span>Foto (opcional)</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          @change="onFile"
        />
        <p v-if="form.file?.name" class="vig-photo-hint">📷 {{ form.file.name }}</p>
      </label>

      <button
        type="submit"
        class="vig-btn vig-btn--danger vig-btn--block"
        :disabled="submitting"
      >
        <span v-if="submitting" class="vig-spinner" />
        <AppIcon v-else name="ki-arrow-right" :size="18" />
        {{ submitting ? 'A enviar…' : 'Enviar ocorrência' }}
      </button>

      <p v-if="error" class="vig-error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { incidentTypeOptions, severityOptions } from 'src/config/operations'
import { vigilanteService } from 'src/services/vigilante.service'

const router = useRouter()
const $q = useQuasar()

const post = ref(null)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  incident_type: 'suspicious_activity',
  severity: 'medium',
  location_description: '',
  description: '',
  file: null,
})

onMounted(async () => {
  const data = await vigilanteService.today()
  post.value = data.post
})

function onFile(e) {
  form.file = e.target.files?.[0] || null
}

async function onSubmit() {
  submitting.value = true
  error.value = ''
  try {
    await vigilanteService.createIncident({ ...form })
    $q.notify({ type: 'positive', message: 'Ocorrência registada.', position: 'top' })
    router.push({ name: 'vigilante-schedule' })
  } catch (err) {
    error.value = err.response?.data?.detail || 'Falha ao enviar ocorrência.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import './vigilante-shared.css';

.vig-target {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vig-target-icon {
  width: 44px; height: 44px;
  flex: none;
  border-radius: 14px;
  background: #fee2e2;
  color: #b91c1c;
  display: inline-flex; align-items: center; justify-content: center;
}
.vig-target-body h2 { font-size: 1.05rem; font-weight: 850; color: #0f2544; margin: 2px 0; line-height: 1.16; }
.vig-target-body p { font-size: 0.84rem; color: #64748b; margin: 0; }

.vig-form { display: flex; flex-direction: column; gap: 16px; }

.vig-severity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.vig-sev {
  border: 1px solid #dce5f1;
  background: #fff;
  border-radius: 13px;
  padding: 10px 6px;
  font-size: 0.78rem;
  font-weight: 850;
  color: #475569;
  cursor: pointer;
  transition:
    transform 100ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}
.vig-sev:active { transform: scale(.96); }
.vig-sev--low.is-active { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; }
.vig-sev--medium.is-active { background: #e4ebff; color: #2f54d7; border-color: #3f6df6; }
.vig-sev--high.is-active { background: #fef3c7; color: #92400e; border-color: #fbbf24; }
.vig-sev--critical.is-active { background: #fee2e2; color: #991b1b; border-color: #f87171; }

.vig-photo input[type=file] {
  font-size: 0.86rem;
  padding: 10px;
}
.vig-photo-hint { font-size: 0.82rem; color: #64748b; margin: 0; }

.vig-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  margin: 0;
}
</style>
