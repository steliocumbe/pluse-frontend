import { defineStore } from 'pinia'
import { authService } from 'src/services/auth.service'

const PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'pluse'
const KEYS = {
  access: `${PREFIX}.access`,
  refresh: `${PREFIX}.refresh`,
  user: `${PREFIX}.user`,
}

function loadInitialState() {
  try {
    const access = localStorage.getItem(KEYS.access)
    const refresh = localStorage.getItem(KEYS.refresh)
    const userRaw = localStorage.getItem(KEYS.user)
    return {
      accessToken: access,
      refreshToken: refresh,
      user: userRaw ? JSON.parse(userRaw) : null,
    }
  } catch {
    return { accessToken: null, refreshToken: null, user: null }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...loadInitialState(),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    groups: (state) => state.user?.groups || [],
    hasGroup: (state) => (name) => (state.user?.groups || []).includes(name),
    hasAnyGroup: (state) => (...names) =>
      (state.user?.groups || []).some((g) => names.includes(g)),
  },

  actions: {
    persist() {
      if (this.accessToken) localStorage.setItem(KEYS.access, this.accessToken)
      else localStorage.removeItem(KEYS.access)

      if (this.refreshToken) localStorage.setItem(KEYS.refresh, this.refreshToken)
      else localStorage.removeItem(KEYS.refresh)

      if (this.user) localStorage.setItem(KEYS.user, JSON.stringify(this.user))
      else localStorage.removeItem(KEYS.user)
    },

    async login(identifier, password) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.login(identifier, password)
        this.accessToken = data.access
        this.refreshToken = data.refresh
        this.user = data.user
        this.persist()
        return this.user
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao iniciar sessão.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('No refresh token')
      const data = await authService.refresh(this.refreshToken)
      this.accessToken = data.access
      if (data.refresh) this.refreshToken = data.refresh
      this.persist()
      return data.access
    },

    async fetchMe() {
      const user = await authService.me()
      this.user = user
      this.persist()
      return user
    },

    async logout({ silent = false } = {}) {
      if (!silent && this.refreshToken) {
        try {
          await authService.logout(this.refreshToken)
        } catch {
          /* ignore — we want to clear local state regardless */
        }
      }
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.persist()
    },
  },
})
