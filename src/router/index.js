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

    if (requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
      }
    }

    if (guestOnly && auth.isAuthenticated) {
      return { name: 'dashboard' }
    }

    // ── Licença ─────────────────────────────────────────────────────
    // Rotas que sempre passam (mesmo sem licença):
    //   - /locked         (a própria página de bloqueio)
    //   - /auth/*         (login e amigos)
    if (to.name === 'locked' || to.path.startsWith('/auth/')) {
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

    return true
  })

  return Router
})
