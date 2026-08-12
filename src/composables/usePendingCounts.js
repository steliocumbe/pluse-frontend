import { computed, onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { api } from 'src/services/api'

/**
 * usePendingCounts — singleton com contagens de pendentes do PLUSE.
 *
 * Faz fetch a /me/dashboard-counts/ no mount e em intervalos (default 60s).
 * Singleton porque várias views (sidebar, header, badges na Base de Operações) lêem os
 * mesmos valores — não faz sentido cada uma fazer o seu polling.
 *
 *   const { counts, lastUpdated, refresh } = usePendingCounts()
 *   counts.value.leaves_pending  // 5
 *
 * Adicional: emite evento `pluse-incident-critical` no `window` quando o
 * contador `incidents_critical` aumenta entre duas leituras consecutivas —
 * permite ? Base de Operações disparar notificações sem ter ele próprio polling extra.
 */

const POLL_INTERVAL_MS = 60_000

const _state = {
  counts: ref({}),
  lastUpdated: ref(null),
  loading: ref(false),
  error: ref(null),
  subscribers: 0,
  timer: null,
  lastCritical: 0,
}

async function _fetch() {
  if (_state.loading.value) return
  _state.loading.value = true
  try {
    const res = await api.get('/me/dashboard-counts/')
    const previous = _state.counts.value
    _state.counts.value = res.data
    _state.lastUpdated.value = new Date()
    _state.error.value = null

    // Disparar evento quando aparecem novas ocorrências críticas
    const current = res.data.incidents_critical ?? 0
    if (
      previous &&
      typeof previous.incidents_critical === 'number' &&
      current > previous.incidents_critical
    ) {
      window.dispatchEvent(new CustomEvent('pluse-incident-critical', {
        detail: {
          previous: previous.incidents_critical,
          current,
          delta: current - previous.incidents_critical,
        },
      }))
    }
    _state.lastCritical = current
  } catch (err) {
    _state.error.value = err
  } finally {
    _state.loading.value = false
  }
}

function _start() {
  if (_state.timer) return
  _state.timer = setInterval(() => {
    if (!document.hidden) _fetch()
  }, POLL_INTERVAL_MS)
  document.addEventListener('visibilitychange', _onVisibility)
}

function _stop() {
  if (_state.timer) {
    clearInterval(_state.timer)
    _state.timer = null
  }
  document.removeEventListener('visibilitychange', _onVisibility)
}

function _onVisibility() {
  if (!document.hidden) _fetch()
}

export function usePendingCounts() {
  onMounted(() => {
    _state.subscribers += 1
    if (_state.subscribers === 1) {
      _fetch()
      _start()
    }
  })

  onBeforeUnmount(() => {
    _state.subscribers = Math.max(0, _state.subscribers - 1)
    if (_state.subscribers === 0) {
      _stop()
    }
  })

  return {
    counts: readonly(_state.counts),
    lastUpdated: readonly(_state.lastUpdated),
    loading: readonly(_state.loading),
    error: readonly(_state.error),
    refresh: _fetch,
    /** Acesso conveniente: counts.value.<key> ou via getter. */
    get: (key, fallback = 0) => computed(() => _state.counts.value[key] ?? fallback),
  }
}

/**
 * Permite invalidar o cache após uma acção (ex: aprovar um pedido) —
 * força refresh imediato em vez de esperar pelo próximo tick.
 */
export function refreshPendingCounts() {
  return _fetch()
}
