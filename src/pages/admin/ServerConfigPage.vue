<!--
  Configurações → Servidor.

  Permite ao admin alterar a app-config.json em runtime (modo local vs
  remoto, URL do servidor). Reinicia a app após guardar para aplicar.

  Acessível por superuser/staff a partir da sidebar (em layouts/MainLayout
  ou similar). Em browsers/dev fora do Electron, mostra um aviso.
-->
<template>
  <q-page padding>
    <div class="server-cfg">
      <header class="server-cfg__head">
        <q-icon name="dns" size="28px" color="primary" />
        <div>
          <h1>Servidor</h1>
          <p>
            Define onde o backend PLUSE está a correr — nesta máquina ou
            num servidor da rede.
          </p>
        </div>
      </header>

      <div v-if="!desktop" class="cfg-warning">
        <q-icon name="info" size="16px" />
        <span>Esta página só está disponível dentro da app PLUSE Desktop.</span>
      </div>

      <div v-else class="cfg-card">
        <q-radio v-model="mode" val="local">
          <div class="radio-label">
            <strong>Local — backend nesta máquina</strong>
            <span>O backend Python corre aqui, com MySQL local.</span>
          </div>
        </q-radio>

        <q-radio v-model="mode" val="remote">
          <div class="radio-label">
            <strong>Remoto — ligar a outro servidor</strong>
            <!-- <span>A app liga-se a um backend PLUSE noutra máquina.</span> -->
          </div>
        </q-radio>

        <transition name="fade">
          <div v-if="mode === 'remote'" class="remote-form">
            <q-input
              v-model="remoteUrl"
              outlined dense
              label="URL do servidor"
              placeholder="http://192.168.1.10:8765"
              :error="!!urlError"
              :error-message="urlError"
            />
            <div class="test-row">
              <q-btn
                outline no-caps icon="wifi_tethering"
                label="Testar ligação"
                :loading="testing"
                :disable="!remoteUrl"
                @click="testConnection"
              />
              <span v-if="testResult" :class="`test-result test-result--${testResult.tone}`">
                <q-icon :name="testResult.icon" size="16px" />
                {{ testResult.message }}
              </span>
            </div>
          </div>
        </transition>

        <div class="current">
          <p class="current__label">Estado actual:</p>
          <p class="current__value">
            <q-icon name="link" size="14px" />
            {{ currentDisplay }}
          </p>
        </div>

        <div v-if="saveError" class="save-error">
          <q-icon name="error" size="16px" />
          <span>{{ saveError }}</span>
        </div>

        <div class="actions">
          <q-btn
            unelevated no-caps color="primary" icon="save"
            label="Guardar e reiniciar"
            :loading="saving"
            :disable="!canSave"
            @click="onSave"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const desktop = typeof window !== 'undefined' ? window.pluseDesktop : null

const mode = ref('local')
const remoteUrl = ref('')
const urlError = ref('')
const saving = ref(false)
const saveError = ref('')
const testing = ref(false)
const testResult = ref(null)
const currentBackendUrl = ref(desktop?.backendUrl || '')

const canSave = computed(() => {
  if (mode.value === 'local') return true
  return /^https?:\/\/\S+/i.test(remoteUrl.value.trim())
})

const currentDisplay = computed(() => {
  if (!currentBackendUrl.value) return 'A descobrir…'
  return currentBackendUrl.value
})

onMounted(async () => {
  if (!desktop?.readConfig) return
  const cfg = await desktop.readConfig()
  if (cfg?.backend) {
    mode.value = cfg.backend.mode || 'local'
    remoteUrl.value = cfg.backend.remoteUrl || ''
  }
})

async function testConnection() {
  if (!desktop?.testBackend) return
  testing.value = true
  testResult.value = null
  try {
    const res = await desktop.testBackend(remoteUrl.value.trim())
    if (res.ok) {
      testResult.value = {
        tone: 'success',
        icon: 'check_circle',
        message: 'Servidor responde correctamente.',
      }
    } else {
      testResult.value = {
        tone: 'danger',
        icon: 'error',
        message:
          res.error ||
          `Status ${res.status || 'desconhecido'}.`,
      }
    }
  } catch (err) {
    testResult.value = {
      tone: 'danger',
      icon: 'error',
      message: err.message || 'Falha ao testar.',
    }
  } finally {
    testing.value = false
  }
}

async function onSave() {
  if (!desktop?.writeConfig) return
  saving.value = true
  saveError.value = ''
  try {
    const cfg = {
      backend: {
        mode: mode.value,
        remoteUrl: mode.value === 'remote' ? remoteUrl.value.trim() : '',
      },
    }
    const res = await desktop.writeConfig(cfg)
    if (!res.ok) {
      saveError.value = res.error || 'Falha ao guardar.'
      return
    }
    $q.notify({
      type: 'positive',
      message: 'Configuração guardada. A reiniciar…',
      position: 'top',
      timeout: 1500,
    })
    setTimeout(() => {
      desktop.relaunch()
    }, 800)
  } catch (err) {
    saveError.value = err.message || 'Erro inesperado.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.server-cfg {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.server-cfg__head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.server-cfg__head h1 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: #07111f;
}
.server-cfg__head p {
  margin: 2px 0 0;
  color: #58708e;
  font-size: 0.92rem;
  line-height: 1.5;
  max-width: 540px;
}

.cfg-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  color: #1d4ed8;
  font-size: 0.88rem;
}

.cfg-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(15, 37, 68, 0.04);
}
.radio-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.radio-label strong { color: #07111f; font-size: 0.95rem; }
.radio-label span { color: #58708e; font-size: 0.82rem; }

.remote-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 32px;
}
.test-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.test-result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
}
.test-result--success { color: #16a34a; }
.test-result--danger { color: #b91c1c; }

.current {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e5e9f0;
  border-radius: 10px;
}
.current__label {
  margin: 0 0 2px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #58708e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.current__value {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, monospace;
  font-size: 0.92rem;
  color: #0f2544;
}

.save-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 0.84rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
