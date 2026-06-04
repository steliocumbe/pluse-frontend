<!--
  /admin/license — Gestão da licença pelo admin.

  Vista detalhada do estado actual + upload de novo ficheiro. Acessível
  mesmo quando a licença está activa (para renovações antes de expirar).
-->
<template>
  <AdminPageTemplate
    eyebrow="Administração"
    title="Licença do sistema"
    description="Vê o estado actual da licença, copia o código desta máquina e activa uma nova licença."
  >
    <template #meta>
      <span class="admin-meta-chip" :class="`admin-meta-chip--${stateChipTone}`">
        <q-icon :name="stateChipIcon" size="14px" />
        {{ state?.status_label || '—' }}
      </span>
      <span v-if="isLifetime" class="admin-meta-chip">
        <q-icon name="all_inclusive" size="13px" />
        Vitalícia
      </span>
      <span
        v-else-if="daysRemaining != null"
        class="admin-meta-chip"
        :class="daysClass"
      >
        <q-icon name="event" size="13px" />
        {{ daysRemaining }} dia{{ daysRemaining === 1 ? '' : 's' }} restante{{ daysRemaining === 1 ? '' : 's' }}
      </span>
    </template>

    <template #actions>
      <q-btn
        outline no-caps class="admin-hero-button"
        icon="refresh" label="Verificar"
        :loading="loading" @click="refresh"
      />
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Card de info -->
      <section class="detail-section lg:col-span-2">
        <header class="detail-section__head">
          <span class="detail-section__icon">
            <q-icon name="card_membership" size="16px" />
          </span>
          <span class="detail-section__title">Detalhes da licença</span>
        </header>
        <div class="detail-section__body">
          <div class="field-row">
            <span class="field-row__label">Cliente</span>
            <span class="field-row__value">{{ state?.customer || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-row__label">ID da licença</span>
            <span class="field-row__value text-mono">{{ state?.license_id || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Emitida em</span>
            <span class="field-row__value">{{ formatDate(state?.issued_at) || '—' }}</span>
          </div>
          <div class="field-row">
            <span class="field-row__label">Expira em</span>
            <span class="field-row__value">
              <template v-if="isLifetime">Sem fim (vitalícia)</template>
              <template v-else>{{ formatDate(state?.expires_at) || '—' }}</template>
            </span>
          </div>
          <div v-if="state?.error_detail" class="field-row field-row--wide">
            <span class="field-row__label">Aviso</span>
            <span class="field-row__value text-warning">{{ state.error_detail }}</span>
          </div>
        </div>
      </section>

      <!-- Card de machine code -->
      <section class="detail-section">
        <header class="detail-section__head">
          <span class="detail-section__icon">
            <q-icon name="fingerprint" size="16px" />
          </span>
          <span class="detail-section__title">Esta máquina</span>
        </header>
        <div class="machine-block">
          <code class="machine-code">{{ machineCode || '—' }}</code>
          <q-btn
            outline no-caps icon="content_copy"
            label="Copiar código"
            :disable="!machineCode"
            @click="copyCode"
          />
          <p class="machine-hint">
            Envia este código ao fornecedor para gerar uma licença válida
            só para esta máquina.
          </p>
        </div>
      </section>

      <!-- Upload -->
      <section class="detail-section lg:col-span-3">
        <header class="detail-section__head">
          <span class="detail-section__icon">
            <q-icon name="upload_file" size="16px" />
          </span>
          <span class="detail-section__title">Carregar nova licença</span>
        </header>
        <div class="upload-block">
          <q-file
            v-model="file"
            outlined dense
            label="Ficheiro .lic recebido do fornecedor"
            accept=".lic,text/plain"
            :disable="uploading"
            @update:model-value="onFileSelected"
          >
            <template #prepend><q-icon name="attach_file" /></template>
            <template v-if="file" #append>
              <q-icon name="cancel" class="cursor-pointer" @click.stop="clearFile" />
            </template>
          </q-file>

          <div v-if="uploadError" class="upload-error">
            <q-icon name="error" size="16px" />
            <span>{{ uploadError }}</span>
          </div>

          <q-btn
            unelevated no-caps color="primary" icon="lock_open"
            label="Activar licença"
            :loading="uploading"
            :disable="!file"
            @click="upload"
          />
        </div>
      </section>
    </div>
  </AdminPageTemplate>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { licensingService } from 'src/services/licensing.service'
import { useLicenseStatus } from 'src/composables/useLicenseStatus'
import AdminPageTemplate from 'src/components/layout/AdminPageTemplate.vue'

const $q = useQuasar()
const {
  state, loading, refresh,
  daysRemaining, isLifetime, machineCode,
} = useLicenseStatus()

const file = ref(null)
const fileText = ref('')
const uploading = ref(false)
const uploadError = ref('')

// ── Aparência ────────────────────────────────────────────────────────
const stateChipTone = computed(() => ({
  licensed: 'positive',
  expired: 'warning',
  mismatched_machine: 'danger',
  corrupted: 'danger',
  missing: 'warning',
}[state.value?.status] || 'neutral'))

const stateChipIcon = computed(() => ({
  licensed: 'verified',
  expired: 'event_busy',
  mismatched_machine: 'devices_other',
  corrupted: 'broken_image',
  missing: 'lock',
}[state.value?.status] || 'help'))

const daysClass = computed(() => {
  if (daysRemaining.value == null) return ''
  if (daysRemaining.value <= 7) return 'admin-meta-chip--danger'
  if (daysRemaining.value <= 30) return 'admin-meta-chip--warning'
  return ''
})

// ── Acções ───────────────────────────────────────────────────────────
async function copyCode() {
  try {
    await copyToClipboard(machineCode.value)
    $q.notify({ type: 'positive', message: 'Código copiado.', position: 'top' })
  } catch {
    $q.notify({ type: 'negative', message: 'Falha ao copiar.', position: 'top' })
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
  }
}

function clearFile() {
  file.value = null
  fileText.value = ''
  uploadError.value = ''
}

async function upload() {
  if (!fileText.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    await licensingService.upload(fileText.value)
    await refresh()
    $q.notify({
      type: 'positive', icon: 'verified',
      message: 'Licença activada com sucesso.',
      position: 'top',
    })
    clearFile()
  } catch (err) {
    uploadError.value = err.response?.data?.detail || 'Falha ao activar licença.'
  } finally {
    uploading.value = false
  }
}

function formatDate(s) {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return s
  }
}
</script>

<style scoped>
.detail-section {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  overflow: hidden;
}
.detail-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--muted) 30%, transparent);
}
.detail-section__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  color: var(--primary);
}
.detail-section__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--mono);
}
.detail-section__body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px 20px;
  padding: 18px;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.field-row--wide { grid-column: 1 / -1; }
.field-row__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.field-row__value {
  font-size: 0.92rem;
  color: var(--foreground);
  word-break: break-word;
}
.text-warning { color: #b45309; }

.machine-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}
.machine-code {
  padding: 14px 16px;
  background: var(--card);
  border: 2px dashed color-mix(in oklab, var(--primary) 30%, transparent);
  border-radius: 10px;
  color: var(--mono);
  font-family: ui-monospace, monospace;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
}
.machine-hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted-foreground);
  line-height: 1.45;
}

.upload-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  max-width: 560px;
}
.upload-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: color-mix(in oklab, var(--destructive) 8%, var(--card));
  border: 1px solid color-mix(in oklab, var(--destructive) 32%, var(--border));
  border-radius: 8px;
  color: var(--destructive);
  font-size: 0.86rem;
}

.admin-meta-chip--warning {
  background: color-mix(in oklab, #f59e0b 14%, transparent);
  color: #b45309;
}
.admin-meta-chip--danger {
  background: color-mix(in oklab, var(--destructive) 14%, transparent);
  color: var(--destructive);
}
.admin-meta-chip--positive {
  background: color-mix(in oklab, #16a34a 14%, transparent);
  color: #16a34a;
}
</style>
