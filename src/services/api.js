import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

/**
 * Shared axios instance for the PLUSE backend.
 * - Adds Authorization header from the auth store on every request.
 * - On 401, tries to refresh the access token once before failing.
 *
 * The interceptors are registered by src/boot/axios.js so the auth store
 * is already available (Pinia must be installed before axios runs).
 */
export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

let _isRefreshing = false
let _waiters = []

function notifyAll(err, token) {
  _waiters.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)))
  _waiters = []
}

export function attachInterceptors(authStore) {
  api.interceptors.request.use((config) => {
    const access = authStore.accessToken
    if (access && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${access}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status
      const original = error.config || {}
      const url = original.url || ''

      // Don't try to refresh on the auth endpoints themselves
      const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh')

      if (status !== 401 || original._retry || isAuthCall) {
        return Promise.reject(error)
      }

      if (!authStore.refreshToken) {
        await authStore.logout({ silent: true })
        return Promise.reject(error)
      }

      original._retry = true

      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _waiters.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      _isRefreshing = true
      try {
        const newAccess = await authStore.refresh()
        notifyAll(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshError) {
        notifyAll(refreshError, null)
        await authStore.logout({ silent: true })
        return Promise.reject(refreshError)
      } finally {
        _isRefreshing = false
      }
    },
  )
}
