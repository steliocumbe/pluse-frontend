<template>
  <div class="vig-shell">
    <div class="vig-frame">
      <header class="vig-header">
        <div class="vig-brand">
          <span class="vig-brand-mark">P</span>
          <div class="vig-header-info">
            <span class="vig-eyebrow">{{ pageEyebrow }}</span>
            <div class="vig-title">{{ pageTitle }}</div>
          </div>
        </div>

        <div class="vig-header-side">
          <div class="vig-online" :class="online ? 'is-online' : 'is-offline'">
            <span class="vig-online-dot" />
            <span>{{ online ? 'Online' : 'Offline' }}</span>
          </div>
          <button class="vig-avatar" type="button" @click="goProfile" :title="profileLabel">
            {{ initials }}
          </button>
        </div>
      </header>

      <div v-if="!online" class="vig-banner vig-banner--offline">
        <AppIcon name="ki-cloud" :size="16" />
        <span>Sem ligação. As ações serão sincronizadas mais tarde.</span>
      </div>

      <main class="vig-main">
        <router-view />
      </main>

      <nav class="vig-nav" role="navigation" aria-label="Navegação principal do vigilante">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="vig-nav-item"
          active-class="is-active"
        >
          <span class="vig-nav-icon">
            <AppIcon :name="item.icon" :size="21" />
          </span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from 'src/components/ui/AppIcon.vue'
import { useAuthStore } from 'src/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const online = ref(navigator.onLine)

function setOnline() {
  online.value = true
}
function setOffline() {
  online.value = false
}

onMounted(() => {
  window.addEventListener('online', setOnline)
  window.addEventListener('offline', setOffline)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', setOnline)
  window.removeEventListener('offline', setOffline)
})

const titles = {
  'vigilante-schedule': { eyebrow: 'PLUSE Campo', title: 'A minha escala' },
  'vigilante-post': { eyebrow: 'Posto', title: 'Detalhe do posto' },
  'vigilante-check-in': { eyebrow: 'Presença', title: 'Check-in' },
  'vigilante-result': { eyebrow: 'Presença', title: 'Resultado' },
  'vigilante-offline': { eyebrow: 'Sincronização', title: 'Por enviar' },
  'vigilante-incident': { eyebrow: 'Ocorrência', title: 'Reportar' },
}

const pageEyebrow = computed(() => titles[route.name]?.eyebrow || 'PLUSE Campo')
const pageTitle = computed(() => titles[route.name]?.title || 'PLUSE')

const profileLabel = computed(() => auth.user?.full_name || auth.user?.email || 'Vigilante')
const initials = computed(() => {
  const name = profileLabel.value || 'V'
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'V'
})

function goProfile() {
  router.push({ name: 'vigilante-schedule' })
}

const nav = [
  { to: '/vigilante/escala', icon: 'ki-calendar', label: 'Escala' },
  { to: '/vigilante/posto', icon: 'ki-geolocation', label: 'Posto' },
  { to: '/vigilante/check-in', icon: 'ki-check-circle', label: 'Check-in' },
  { to: '/vigilante/ocorrencia', icon: 'ki-warning-2', label: 'Ocorrência' },
]
</script>

<style scoped>
.vig-shell {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  background:
    radial-gradient(circle at 12% 0%, rgba(63, 109, 246, 0.2), transparent 34%),
    radial-gradient(circle at 94% 8%, rgba(16, 185, 129, 0.18), transparent 30%),
    linear-gradient(145deg, #07162b 0%, #0f2544 48%, #123d56 100%);
}

.vig-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #eef4fb;
  box-shadow: 0 30px 80px rgba(4, 18, 38, 0.34);
}

.vig-frame::before {
  position: absolute;
  inset: 0 0 auto;
  height: 220px;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent),
    radial-gradient(circle at 78% 10%, rgba(16, 185, 129, 0.22), transparent 34%);
}

.vig-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, #0f2544 0%, #17446a 58%, #176b87 100%);
  color: #ffffff;
}

.vig-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.vig-brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  flex: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: linear-gradient(135deg, #3f6df6, #10b8d4);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(63, 109, 246, 0.28);
}

.vig-header-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.vig-eyebrow {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.2;
  text-transform: uppercase;
}

.vig-title {
  margin-top: 3px;
  color: #ffffff;
  font-size: 1.28rem;
  font-weight: 820;
  letter-spacing: 0;
  line-height: 1.08;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vig-header-side {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.vig-online {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.74rem;
  font-weight: 800;
}

.vig-online-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #94a3b8;
}

.vig-online.is-online .vig-online-dot {
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.22);
}

.vig-online.is-offline .vig-online-dot {
  background: #f87171;
  box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.18);
}

.vig-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 900;
}

.vig-banner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 0.82rem;
  font-weight: 750;
}

.vig-banner--offline {
  border-bottom: 1px solid #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.vig-main {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px calc(96px + env(safe-area-inset-bottom));
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0)),
    #eef4fb;
}

.vig-nav {
  position: fixed;
  right: 12px;
  bottom: 10px;
  left: 12px;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  border: 1px solid rgba(220, 229, 241, 0.9);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 42px rgba(15, 37, 68, 0.18);
  backdrop-filter: blur(16px);
}

.vig-nav-item {
  display: grid;
  align-content: center;
  justify-items: center;
  min-height: 54px;
  gap: 4px;
  border-radius: 16px;
  color: #60758f;
  font-size: 0.72rem;
  font-weight: 850;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.vig-nav-item:active {
  transform: scale(0.98);
}

.vig-nav-icon {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
}

.vig-nav-item.is-active {
  background: #e4ebff;
  color: #3f6df6;
}

@media (max-width: 390px) {
  .vig-online span:last-child {
    display: none;
  }
}

@media (min-width: 768px) {
  .vig-shell {
    padding: 26px;
  }

  .vig-frame {
    width: min(100%, 900px);
    min-height: calc(100vh - 52px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
  }

  .vig-header {
    padding: 24px 28px 22px;
  }

  .vig-title {
    font-size: 1.72rem;
  }

  .vig-main {
    padding: 24px 28px 28px;
  }

  .vig-nav {
    position: sticky;
    right: auto;
    bottom: auto;
    left: auto;
    margin: auto 28px 24px;
    padding: 8px;
    border-radius: 20px;
  }
}
</style>
