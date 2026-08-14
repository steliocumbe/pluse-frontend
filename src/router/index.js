import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'
import { fetchLicenseStatus, getLicenseStatus } from 'src/composables/useLicenseStatus'

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)
    const guestOnly = to.matched.some((r) => r.meta?.guestOnly)

    // ── Setup wizard (Electron, primeira execução) ──────────────────
    // Quando o Electron arranca sem `app-config.json` válido, expõe a
    // flag `needsSetup`. Redireccionamos para /setup ANTES de tudo —
    // sem backend não vale a pena tentar login ou verificar licença.
    const desktop = typeof window !== 'undefined' ? window.pluseDesktop : null
    if (desktop?.needsSetup && to.name !== 'setup') {
      return { name: 'setup' }
    }
    if (to.name === 'setup') {
      return true
    }

    // ── Licença ─────────────────────────────────────────────────────
    // Rotas que sempre passam (mesmo sem licença):
    //   - /locked         (a própria página de bloqueio)
    if (to.name === 'locked') {
      return true
    }

    // Usa estado em cache se disponível, senão faz fetch fresh
    let status = getLicenseStatus()
    if (!status) {
      try {
        status = await fetchLicenseStatus()
      } catch {
        // Se o endpoint falhar (rede), não bloqueamos o utilizador;
        // o middleware backend vai responder 423 se for caso disso.
        return true
      }
    }

    if (status && status.status !== 'licensed') {
      return { name: 'locked' }
    }

    if (requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
      }
    }

    if (guestOnly && auth.isAuthenticated) {
      return { name: 'dashboard' }
    }

    // ── Mudança obrigatória de password ─────────────────────────────
    // Se o utilizador tem `must_change_password=true`, força ir para a
    // página de segurança do perfil até mudar. Permite-se sair só por
    // logout.
    if (
      auth.isAuthenticated &&
      auth.user?.must_change_password &&
      to.name !== 'profile' &&
      to.name !== 'login'
    ) {
      return { name: 'profile', query: { tab: 'security', force: '1' } }
    }

    return true
  })

  return Router
})
