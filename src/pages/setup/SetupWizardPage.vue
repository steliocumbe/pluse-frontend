<!--
  /setup — Wizard de primeira execução.

  Mostrado quando o Electron arranca sem `app-config.json` válido
  (`window.pluseDesktop.needsSetup === true`). Permite ao utilizador
  escolher entre:
    • Local: backend Python corre nesta máquina (precisa MySQL local)
    • Remoto: liga-se a um backend que corre noutra máquina da rede

  Depois de guardar, reinicia o Electron para aplicar a config.
-->
<template>
  <div class="setup-page">
    <div class="setup-shell">
      <header class="setup-header">
        <div class="setup-icon">
          <q-icon name="settings_ethernet" size="34px" />
        </div>
        <p class="setup-eyebrow">Bem-vindo ao PLUSE</p>
        <h1 class="setup-title">Como vai funcionar esta máquina?</h1>
        <p class="setup-sub">
          Escolhe o modo de funcionamento. Podes mudar depois nas
          Configurações da app.
        </p>
      </header>

      <!-- Opções -->
      <div class="modes">
        <button
          type="button"
          class="mode-card" :class="{ 'mode-card--active': mode === 'local' }"
          @click="mode = 'local'"
        >
          <q-icon name="home" size="24px" class="mode-card__icon" />
          <div class="mode-card__body">
            <h3>Servidor + Cliente nesta máquina</h3>
            <!-- <p>
              O backend Python corre aqui. Vais precisar do MySQL Server
              instalado e configurado nesta máquina.
            </p> -->
          </div>
          <q-icon
            v-if="mode === 'local'"
            name="check_circle" color="primary" size="20px"
            class="mode-card__check"
          />
        </button>

        <button
          type="button"
          class="mode-card" :class="{ 'mode-card--active': mode === 'remote' }"
          @click="mode = 'remote'"
        >
          <q-icon name="lan" size="24px" class="mode-card__icon" />
          <div class="mode-card__body">
            <h3>Apenas cliente — ligar a outro servidor</h3>
            <!-- <p>
              Esta máquina só executa a aplicação e liga-se a um backend
              instalado noutra máquina da rede.
            </p> -->
          </div>
          <q-icon
            v-if="mode === 'remote'"
            name="check_circle" color="primary" size="20px"
            class="mode-card__check"
          />
        </button>
      </div>

      <!-- Form da URL remota -->
      <transition name="fade">
        <section v-if="mode === 'remote'" class="setup-section">
          <header class="setup-section__head">
            <q-icon name="link" size="18px" />
            <div>
              <h3>URL do servidor PLUSE</h3>
              <p>Ex: <code>http://192.168.1.10:8765</code></p>
            </div>
          </header>
          <q-input
            v-model="remoteUrl"
            outlined dense
            placeholder="http://192.168.1.10:8765"
            :error="!!urlError"
            :error-message="urlError"
            @blur="urlError = ''"
          />
          <div class="test-row">
            <q-btn
              outline no-caps icon="wifi_tethering"
              label="Testar ligação"
              :loading="testing"
              :disable="!remoteUrl || !canSave"
              @click="testConnection"
            />
            <span v-if="testResult" :class="`test-result test-result--${testResult.tone}`">
              <q-icon :name="testResult.icon" size="16px" />
              {{ testResult.message }}
            </span>
          </div>
        </section>
      </transition>

      <!-- Erro / acções -->
      <div v-if="saveError" class="save-error">
        <q-icon name="error" size="16px" />
        <span>{{ saveError }}</span>
      </div>

      <footer class="setup-footer">
        <p class="setup-footer__hint">
          A aplicação vai reiniciar para aplicar a configuração.
        </p>
        <q-btn
          unelevated no-caps color="primary"
          icon-right="arrow_forward"
          label="Continuar"
          :loading="saving"
          :disable="!canSave"
          @click="onSave"
        />
      </footer>

      <div class="setup-signature">MIGUEL M.C ERP</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

const canSave = computed(() => {
  if (mode.value === 'local') return true
  return /^https?:\/\/\S+/i.test(remoteUrl.value.trim())
})

async function testConnection() {
  if (!desktop?.testBackend) {
    $q.notify({
      type: 'warning',
      message: 'Função disponível apenas na app desktop.',
      position: 'top',
    })
    return
  }
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
          `Servidor respondeu com status ${res.status || 'desconhecido'}.`,
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
  if (!desktop?.writeConfig) {
    saveError.value =
      'Esta página só funciona dentro da aplicação PLUSE Desktop.'
    return
  }
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
      saveError.value = res.error || 'Falha ao guardar a configuração.'
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
.setup-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(15, 37, 68, 0.04), rgba(63, 109, 246, 0.08)),
    #f5f8fc;
}
.setup-shell {
  width: min(100%, 600px);
  background: #fff;
  border: 1px solid #d9e3f0;
  border-radius: 20px;
  padding: clamp(24px, 4vw, 36px);
  box-shadow: 0 26px 80px rgba(15, 37, 68, 0.14);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.setup-signature {
  padding-top: 4px;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-align: center;
}
.setup-header { text-align: center; }
.setup-icon {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 14px;
  border-radius: 20px;
  background: #eef5ff;
  color: #3f6df6;
}
.setup-eyebrow {
  margin: 0 0 4px;
  color: #58708e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.setup-title {
  margin: 0 0 8px;
  font-size: 1.55rem;
  font-weight: 800;
  color: #07111f;
  line-height: 1.2;
}
.setup-sub {
  margin: 0 auto;
  max-width: 440px;
  color: #58708e;
  font-size: 0.94rem;
  line-height: 1.55;
}

/* Opções */
.modes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mode-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  text-align: left;
  background: #fafbfd;
  border: 2px solid #e5e9f0;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.mode-card:hover {
  border-color: #b9c8e0;
  background: #fff;
}
.mode-card--active {
  border-color: #3f6df6;
  background: #eef5ff;
}
.mode-card__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #fff;
  color: #3f6df6;
}
.mode-card__body h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f2544;
}
.mode-card__body p {
  margin: 4px 0 0;
  color: #58708e;
  font-size: 0.85rem;
  line-height: 1.45;
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e5e9f0;
  border-radius: 14px;
  background: #fafbfd;
}
.setup-section__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.setup-section__head h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f2544;
}
.setup-section__head p {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #58708e;
}
.setup-section__head code {
  background: #fff;
  border: 1px solid #e5e9f0;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.82rem;
}

.test-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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
  line-height: 1.4;
}

.setup-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #edf2f8;
}
.setup-footer__hint {
  margin: 0;
  color: #58708e;
  font-size: 0.84rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
