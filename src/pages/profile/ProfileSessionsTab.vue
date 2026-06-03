<template>
  <div class="profile-tab-content">
    <section class="detail-section">
      <header class="detail-section__head">
        <span class="detail-section__icon"><AppIcon name="ki-monitor" :size="16" /></span>
        <span class="detail-section__title">Sessões activas</span>
        <span v-if="data" class="sessions-count">{{ data.count }}</span>
        <q-btn
          v-if="data && data.count > 1"
          class="ms-auto" outline no-caps size="sm" color="negative"
          icon="logout" label="Terminar outras sessões"
          :loading="revoking"
          @click="confirmRevokeOthers"
        />
      </header>

      <div class="profile-form">
        <p class="text-sm text-muted-foreground">
          Estas são as sessões abertas com a tua conta. Cada vez que fazes login num navegador
          ou dispositivo, é criada uma sessão. Podes terminar todas as outras se suspeitas
          que alguém tem acesso indevido.
        </p>

        <div v-if="loading" class="loading-state">
          <q-spinner color="primary" size="1.6em" /><span>A carregar…</span>
        </div>

        <div v-else-if="!data?.sessions?.length" class="empty-row">
          <AppIcon name="ki-information-2" :size="28" />
          <p><strong>Sem outras sessões activas.</strong></p>
          <p class="text-sm">Só este browser está autenticado neste momento.</p>
        </div>

        <ul v-else class="sessions-list">
          <li
            v-for="s in data.sessions" :key="s.jti"
            class="session-row"
            :class="{ 'is-current': s.jti === currentJti }"
          >
            <div class="session-icon">
              <AppIcon :name="s.jti === currentJti ? 'ki-check-circle' : 'ki-monitor'" :size="18" />
            </div>
            <div class="session-body">
              <div class="session-title">
                {{ s.jti === currentJti ? 'Esta sessão' : 'Sessão activa' }}
              </div>
              <div class="session-meta">
                Iniciada {{ formatDateTime(s.created_at) }} ·
                expira {{ formatDateTime(s.expires_at) }}
              </div>
            </div>
            <span v-if="s.jti === currentJti" class="current-pill">Actual</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useToast } from 'src/composables/useToast'
import { useAuthStore } from 'src/stores/auth'
import { profileService } from 'src/services/profile.service'
import AppIcon from 'src/components/ui/AppIcon.vue'

const $q = useQuasar()
const toast = useToast()
const auth = useAuthStore()

const loading = ref(false)
const revoking = ref(false)
const data = ref(null)

/**
 * Tenta extrair o jti do refresh token actual para destacar a sessão.
 * JWT é base64url(header).base64url(payload).signature — basta decodificar a payload.
 */
const currentJti = computed(() => {
  const refresh = auth.refreshToken
  if (!refresh) return null
  try {
    const payload = refresh.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json).jti || null
  } catch {
    return null
  }
})

async function load() {
  loading.value = true
  try {
    data.value = await profileService.sessions()
  } finally {
    loading.value = false
  }
}

function confirmRevokeOthers() {
  $q.dialog({
    title: 'Terminar outras sessões',
    message:
      'Vais terminar todas as sessões abertas com a tua conta noutros navegadores ou dispositivos. ' +
      'A sessão actual continua activa. Continuar?',
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Terminar outras', color: 'negative', unelevated: true, noCaps: true },
  }).onOk(async () => {
    revoking.value = true
    try {
      const res = await profileService.logoutAllOther(auth.refreshToken)
      toast.success(`${res.revoked} sessão(ões) terminadas.`)
      await load()
    } catch {
      toast.error('Não foi possível terminar as outras sessões.')
    } finally {
      revoking.value = false
    }
  })
}

function formatDateTime(s) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}

onMounted(load)
</script>

<style scoped>
@import './profile-shared.css';

.sessions-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
}

.empty-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
  color: var(--muted-foreground);
  text-align: center;
}
.empty-row p { margin: 0; }

.sessions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.session-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
}
.session-row.is-current {
  border-color: color-mix(in oklab, var(--primary) 32%, var(--border));
  background: color-mix(in oklab, var(--primary) 4%, var(--card));
}
.session-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 10px;
  background: color-mix(in oklab, var(--muted) 60%, transparent);
  color: var(--muted-foreground);
}
.session-row.is-current .session-icon {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
}
.session-body { flex: 1; min-width: 0; }
.session-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--foreground);
}
.session-meta {
  font-size: 0.76rem;
  color: var(--muted-foreground);
  margin-top: 2px;
}
.current-pill {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
</style>
