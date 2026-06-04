<!--
  /locked — Página de bloqueio.

  Mostrada quando o backend devolve um estado de licença inválido. O
  utilizador vê o motivo, o machine code da máquina (para enviar ao
  fornecedor) e um formulário de upload do `.lic` recebido.
-->
<template>
  <div class="locked-page">
    <div class="locked-shell">
      <!-- Header com status -->
      <header class="locked-header">
        <div class="locked-icon" :class="`locked-icon--${tone}`">
          <q-icon :name="statusIcon" size="34px" />
        </div>
        <p class="locked-eyebrow">{{ statusEyebrow }}</p>
        <h1 class="locked-title">{{ statusTitle }}</h1>
        <p class="locked-sub">{{ statusSub }}</p>
      </header>

      <!-- Detalhes do estado -->
      <div v-if="errorDetail" class="locked-detail">
        <q-icon name="info" size="16px" />
        <span>{{ errorDetail }}</span>
      </div>

      <!-- Bloco com o machine code -->
      <section class="locked-section">
        <header class="locked-section__head">
          <span class="locked-section__icon">
            <q-icon name="fingerprint" size="16px" />
          </span>
          <div>
            <h3>Código desta máquina</h3>
            <p>Envia este código ao fornecedor para gerar a tua licença.</p>
          </div>
        </header>
        <div class="machine-code-row">
          <code class="machine-code">{{ machineCode || '—' }}</code>
          <q-btn
            outline no-caps icon="content_copy"
            label="Copiar"
            :disable="!machineCode"
            @click="copyMachineCode"
          />
        </div>
      </section>

      <!-- Upload -->
      <section class="locked-section">
        <header class="locked-section__head">
          <span class="locked-section__icon">
            <q-icon name="upload_file" size="16px" />
          </span>
          <div>
            <h3>Carregar ficheiro de licença</h3>
            <p>Carrega o ficheiro `.lic` enviado pelo fornecedor.</p>
          </div>
        </header>

        <q-file
          v-model="file"
          outlined dense
          label="Seleciona ou arrasta o ficheiro .lic"
          accept=".lic,text/plain"
          :disable="uploading"
          @update:model-value="onFileSelected"
        >
          <template #prepend><q-icon name="attach_file" /></template>
          <template v-if="file" #append>
            <q-icon name="cancel" class="cursor-pointer" @click.stop="clearFile" />
          </template>
        </q-file>

        <div v-if="filePreview" class="file-preview">
          <q-icon name="description" size="14px" />
          <span class="grow truncate">{{ file?.name }}</span>
          <span class="text-xs text-muted-foreground">
            {{ formatSize(file?.size) }}
          </span>
        </div>

        <div v-if="uploadError" class="upload-error">
          <q-icon name="error" size="16px" />
          <span>{{ uploadError }}</span>
        </div>

        <q-btn
          unelevated no-caps color="primary" icon="lock_open"
          label="Activar licença"
          class="full-width"
          :loading="uploading"
          :disable="!file"
          @click="upload"
        />
      </section>

      <!-- Acções secundárias -->
      <footer class="locked-footer">
        <q-btn
          flat no-caps icon="refresh"
          label="Verificar de novo"
          :loading="refreshing"
          @click="onRefresh"
        />
        <q-btn
          v-if="auth.isAuthenticated"
          flat no-caps icon="logout" color="negative"
          label="Terminar sessão"
          @click="onLogout"
        />
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, copyToClipboard } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { licensingService } from 'src/services/licensing.service'
import { useLicenseStatus } from 'src/composables/useLicenseStatus'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const { state, refresh, machineCode } = useLicenseStatus()

const file = ref(null)
const fileText = ref('')
const uploading = ref(false)
const refreshing = ref(false)
const uploadError = ref('')

const filePreview = computed(() => file.value !== null)

// ── Aparência por estado ─────────────────────────────────────────────
const status = computed(() => state.value?.status || 'missing')
const tone = computed(() => ({
  licensed: 'success',
  expired: 'warning',
  mismatched_machine: 'danger',
  corrupted: 'danger',
  missing: 'info',
}[status.value] || 'info'))

const statusIcon = computed(() => ({
  licensed: 'verified',
  expired: 'event_busy',
  mismatched_machine: 'devices_other',
  corrupted: 'broken_image',
  missing: 'lock',
}[status.value] || 'lock'))

const statusEyebrow = computed(() => ({
  licensed: 'Sistema activo',
  expired: 'Licença expirada',
  mismatched_machine: 'Licença não corresponde',
  corrupted: 'Ficheiro inválido',
  missing: 'Licença necessária',
}[status.value] || 'Bloqueado'))

const statusTitle = computed(() => ({
  licensed: 'Tudo activo.',
  expired: 'A tua licença expirou.',
  mismatched_machine: 'Esta licença pertence a outra máquina.',
  corrupted: 'O ficheiro de licença está inválido.',
  missing: 'Sistema bloqueado — falta a licença.',
}[status.value] || 'Acesso restrito.'))

const statusSub = computed(() => ({
  licensed: 'Já podes voltar ao sistema.',
  expired: 'Pede ao fornecedor uma licença renovada e carrega abaixo.',
  mismatched_machine: 'Cada licença é gerada para uma máquina específica. Envia o código abaixo ao fornecedor para receberes uma licença para esta máquina.',
  corrupted: 'O conteúdo do ficheiro foi adulterado ou está incompleto. Pede uma nova ao fornecedor.',
  missing: 'Para activar, envia o código desta máquina ao fornecedor e carrega o ficheiro `.lic` que ele te entregar.',
}[status.value] || 'Contacta o administrador.'))

const errorDetail = computed(() => state.value?.error_detail || '')

// ── Acções ───────────────────────────────────────────────────────────
async function copyMachineCode() {
  if (!machineCode.value) return
  try {
    await copyToClipboard(machineCode.value)
    $q.notify({ type: 'positive', message: 'Código copiado.', position: 'top' })
  } catch {
    $q.notify({ type: 'negative', message: 'Não foi possível copiar.', position: 'top' })
  }
}

async function onFileSelected(f) {
  uploadError.value = ''
  if (!f) {
    fileText.value = ''
    return
  }
  try {
    fileText.value = await f.text()
  } catch {
    uploadError.value = 'Não foi possível ler o ficheiro.'
    fileText.value = ''
  }
}

function clearFile() {
  file.value = null
  fileText.value = ''
  uploadError.value = ''
}

async function upload() {
  if (!fileText.value) {
    uploadError.value = 'Selecciona um ficheiro `.lic` primeiro.'
    return
  }
  uploading.value = true
  uploadError.value = ''
  try {
    await licensingService.upload(fileText.value)
    await refresh()
    $q.notify({
      type: 'positive', icon: 'verified',
      message: 'Licença activada com sucesso!',
      position: 'top',
    })
    // Redirecciona à home depois de pequena pausa para o utilizador ver o toast
    setTimeout(() => router.replace('/'), 1200)
  } catch (err) {
    const data = err.response?.data
    uploadError.value = data?.detail || 'Falha ao activar licença.'
  } finally {
    uploading.value = false
  }
}

async function onRefresh() {
  refreshing.value = true
  try {
    await refresh()
    if (state.value?.status === 'licensed') {
      $q.notify({ type: 'positive', message: 'Licença activa!', position: 'top' })
      router.replace('/')
    } else {
      $q.notify({ type: 'info', message: 'Ainda bloqueado.', position: 'top' })
    }
  } finally {
    refreshing.value = false
  }
}

async function onLogout() {
  await auth.logout({ silent: true })
  router.replace({ name: 'login' })
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

onMounted(refresh)
</script>

<style scoped>
.locked-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(15, 37, 68, 0.04), rgba(63, 109, 246, 0.08)),
    #f5f8fc;
}

.locked-shell {
  position: relative;
  width: min(100%, 560px);
  background: #fff;
  border: 1px solid #d9e3f0;
  border-radius: 20px;
  padding: clamp(24px, 4vw, 36px);
  box-shadow: 0 26px 80px rgba(15, 37, 68, 0.14);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ── Header ─────────────────────────────────────────────────────────── */
.locked-header {
  text-align: center;
}
.locked-icon {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 14px;
  border-radius: 20px;
  background: #eef5ff;
  color: #3f6df6;
}
.locked-icon--info { background: #eef5ff; color: #3f6df6; }
.locked-icon--success { background: #dcfce7; color: #16a34a; }
.locked-icon--warning { background: #fef3c7; color: #b45309; }
.locked-icon--danger { background: #fee2e2; color: #b91c1c; }

.locked-eyebrow {
  margin: 0 0 4px;
  color: #58708e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.locked-title {
  margin: 0 0 8px;
  font-size: 1.55rem;
  font-weight: 800;
  color: #07111f;
  line-height: 1.2;
}
.locked-sub {
  margin: 0 auto;
  max-width: 440px;
  color: #58708e;
  font-size: 0.94rem;
  line-height: 1.55;
}

.locked-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 0.84rem;
  line-height: 1.4;
}

/* ── Secções ────────────────────────────────────────────────────────── */
.locked-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid #e5e9f0;
  border-radius: 14px;
  background: #fafbfd;
}
.locked-section__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.locked-section__head h3 {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: #0f2544;
}
.locked-section__head p {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #58708e;
  line-height: 1.4;
}
.locked-section__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #eef5ff;
  color: #3f6df6;
}

/* ── Machine code ───────────────────────────────────────────────────── */
.machine-code-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.machine-code {
  flex: 1;
  min-width: 200px;
  padding: 14px 16px;
  background: #fff;
  border: 2px dashed #cfd9e8;
  border-radius: 10px;
  color: #0f2544;
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
}

/* ── Upload ─────────────────────────────────────────────────────────── */
.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  font-size: 0.84rem;
  color: #0f2544;
}
.upload-error {
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

/* ── Footer ─────────────────────────────────────────────────────────── */
.locked-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #edf2f8;
}
</style>
