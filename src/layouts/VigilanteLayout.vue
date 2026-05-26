<template>
  <!--
    Layout PWA do vigilante.
    - Mobile-first: ocupa 100vh com header fixo + main scrollável + bottom nav.
    - Em tablets/desktop, centra o conteúdo num cartão de até 480 px para não
      esticar widgets desenhados para mão.
    - safe-area-inset honra o notch nos ecrãs com recorte.
  -->
  <div class="vig-shell">
    <div class="vig-frame">
      <!-- Header -->
      <header class="vig-header">
        <div class="vig-header-info">
          <p class="vig-eyebrow">{{ pageEyebrow }}</p>
          <h1 class="vig-title">{{ pageTitle }}</h1>
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

      <!-- Aviso modo offline -->
      <div v-if="!online" class="vig-banner vig-banner--offline">
        <AppIcon name="ki-cloud" :size="16" />
        <span>Sem ligação. Acções serão sincronizadas mais tarde.</span>
      </div>

      <!-- Conteúdo da página -->
      <main class="vig-main">
        <router-view />
      </main>

      <!-- Bottom nav -->
      <nav class="vig-nav" role="navigation" aria-label="Navegação principal">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="vig-nav-item"
          active-class="is-active"
        >
          <AppIcon :name="item.icon" :size="22" />
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

function setOnline() { online.value = true }
function setOffline() { online.value = false }

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
  background:
    radial-gradient(circle at 0% 0%, rgba(99,102,241,.18), transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(14,165,233,.14), transparent 45%),
    #0f172a;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.vig-frame {
  width: 100%;
  max-width: 480px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: 0 30px 60px -20px rgba(15, 23, 42, .35);
}

@media (min-width: 768px) {
  .vig-shell { padding: 24px 16px; }
  .vig-frame {
    min-height: calc(100vh - 48px);
    border-radius: 20px;
    overflow: hidden;
  }
}

.vig-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #0ea5e9 100%);
  color: #fff;
}
.vig-header-info { display: flex; flex-direction: column; min-width: 0; }
.vig-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: .8;
  margin: 0;
}
.vig-title {
  font-size: 18px;
  font-weight: 700;
  margin: 2px 0 0;
  line-height: 1.2;
}

.vig-header-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vig-online {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .14);
}
.vig-online-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #94a3b8;
}
.vig-online.is-online .vig-online-dot { background: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,.25); }
.vig-online.is-offline .vig-online-dot { background: #f87171; }

.vig-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .18);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .25);
  cursor: pointer;
}

.vig-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
}
.vig-banner--offline {
  background: #fff7ed;
  color: #c2410c;
  border-bottom: 1px solid #fed7aa;
}

.vig-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px calc(96px + env(safe-area-inset-bottom));
  background: #f8fafc;
}

.vig-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 30;
}
@media (min-width: 768px) {
  .vig-nav {
    position: sticky;
    bottom: 0;
    margin-top: auto;
  }
  .vig-main { padding-bottom: 16px; }
}
.vig-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  min-height: 56px;
  transition: color .15s;
}
.vig-nav-item.is-active {
  color: #4f46e5;
  background: linear-gradient(180deg, rgba(99,102,241,.08), transparent);
  border-top: 2px solid #4f46e5;
  padding-top: 8px;
}
.vig-nav-item:active { background: rgba(99,102,241,.06); }
</style>
