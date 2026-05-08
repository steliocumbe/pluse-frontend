import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

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

  Router.beforeEach((to) => {
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

    return true
  })

  return Router
})
