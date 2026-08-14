import axios from 'axios'

// Prioridade da URL do backend:
//   1. `window.pluseDesktop.backendUrl` — injectado pelo preload do
//      Electron com a URL do pluse-backend.exe local (porto detectado em
//      runtime).
//   2. `VITE_API_URL` — definido no .env do frontend (dev local, ou
//      build web para um servidor remoto).
//   3. 'http://127.0.0.1:8000' — backend local usado no desenvolvimento.
const desktopBackend =
  typeof window !== 'undefined' ? window.pluseDesktop?.backendUrl : null
const baseURL = (desktopBackend || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(
  /\/+$/,
  '',
)

/**
 * Shared axios instance for the PLUSE backend.
 * - Adds Authorization header from the auth store on every request.
 * - On 401, tries to refresh the access token once before failing.
 *
 * The interceptors are registered by src/boot/axios.js so the auth store
 * is already available (Pinia must be installed before axios runs).
 */
/**
 * Default timeouts:
 *   - 20 s para JSON normal
 *   - 120 s para uploads (fotos, anexos) — definido por request
 *
 * Use `uploadConfig(onProgress)` para construir um config com progresso.
 */
export const DEFAULT_TIMEOUT = 20_000
export const UPLOAD_TIMEOUT = 120_000

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Constrói o config axios apropriado para um upload multipart com callback
 * de progresso. Devolve `{headers, timeout, onUploadProgress}` para passar
 * a `api.post(url, formData, uploadConfig(...))`.
 *
 * `onProgress` recebe um objecto `{loaded, total, percent}` periodicamente.
 */
export function uploadConfig(onProgress) {
  return {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
    onUploadProgress: (event) => {
      if (typeof onProgress !== 'function') return
      const total = event.total || event.loaded
      const percent = total ? Math.min(100, Math.round((event.loaded / total) * 100)) : 0
      onProgress({ loaded: event.loaded, total, percent })
    },
  }
}

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

      // HTTP 423 Locked → sistema bloqueado por licença. Redirecciona o
      // utilizador para /locked sem tocar nos tokens (vai precisar deles
      // para fazer upload).
      if (status === 423 && typeof window !== 'undefined') {
        if (!window.location.pathname.includes('/locked')) {
          // Soft redirect via location para não depender do router aqui
          // (api.js é carregado antes do router).
          const target = window.location.hash.startsWith('#/')
            ? '#/locked'
            : '/locked'
          window.location.assign(target)
        }
        return Promise.reject(error)
      }

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
