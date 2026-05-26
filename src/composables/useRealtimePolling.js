import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Realtime polling para painéis de monitorização (Fase 4.6).
 *
 * Faz `fetcher()` em intervalos regulares e:
 *   - pausa quando a aba está escondida (`document.visibilitychange`)
 *   - pausa quando o browser fica offline (`navigator.onLine`)
 *   - retoma com `fetch()` imediato quando volta a ficar visível/online
 *
 * Devolve refs reactivos:
 *   - `data`        — último valor de `fetcher()` (até a primeira chamada, `null`)
 *   - `loading`     — `true` enquanto há um fetch em curso
 *   - `error`       — última excepção lançada ou `null`
 *   - `lastUpdated` — Date do último fetch bem-sucedido
 *   - `online`      — estado da ligação
 *
 * Mais:
 *   - `fetch()`       — força refresh manual (botão "Actualizar")
 *   - `start()/stop()` — controlo manual do timer
 *
 * Uso:
 *   const { data, loading, lastUpdated, fetch } = useRealtimePolling(
 *     () => ccoService.overview(date.value),
 *     { intervalMs: 30_000 },
 *   )
 */
export function useRealtimePolling(fetcher, options = {}) {
  const {
    intervalMs = 30_000,
    immediate = true,
  } = options

  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  let timer = null
  let inFlight = null

  async function fetch() {
    if (inFlight) return inFlight
    loading.value = true
    error.value = null
    inFlight = (async () => {
      try {
        const result = await fetcher()
        data.value = result
        lastUpdated.value = new Date()
        return result
      } catch (err) {
        error.value = err
        throw err
      } finally {
        loading.value = false
        inFlight = null
      }
    })()
    try { return await inFlight } catch { /* swallow */ }
  }

  function start() {
    stop()
    if (intervalMs > 0) {
      timer = setInterval(() => {
        if (online.value && !document.hidden) fetch()
      }, intervalMs)
    }
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null }
  }

  function onVisibility() {
    if (document.hidden) {
      stop()
    } else {
      fetch()
      start()
    }
  }

  function onOnline() {
    online.value = true
    fetch()
    start()
  }

  function onOffline() {
    online.value = false
    stop()
  }

  onMounted(async () => {
    if (immediate) await fetch()
    start()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
  })

  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  })

  return { data, loading, error, lastUpdated, online, fetch, start, stop }
}

/**
 * Formata "última atualização" de forma legível e amigável.
 *   - < 5 s   → "agora"
 *   - < 60 s  → "há X seg"
 *   - < 60 m  → "há X min"
 *   - resto   → hora local HH:mm
 */
export function formatRelativeTime(date) {
  if (!date) return '—'
  const diffMs = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 5) return 'agora'
  if (seconds < 60) return `há ${seconds} seg`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  return new Date(date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}
