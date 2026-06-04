import { computed, onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { licensingService } from 'src/services/licensing.service'

/**
 * useLicenseStatus — singleton que mantém o estado da licença em memória.
 *
 * Faz polling a cada `POLL_INTERVAL_MS` (default: 5 min) para apanhar
 * expirações em sessões longas. Re-fetch também quando a aba volta a estar
 * visível.
 *
 * Estados possíveis (campo `status`):
 *   - 'licensed'             — válida, acesso permitido
 *   - 'expired'              — passou da data
 *   - 'mismatched_machine'   — ficheiro de outra máquina
 *   - 'corrupted'            — ficheiro inválido / assinatura má
 *   - 'missing'              — não há ficheiro
 *
 * Uso:
 *   const { state, isValid, daysRemaining, refresh } = useLicenseStatus()
 *
 *   refresh()  // força fetch (depois de uploadar nova licença)
 */

const POLL_INTERVAL_MS = 5 * 60_000  // 5 minutos

const _state = {
  data: ref(null),
  loading: ref(false),
  error: ref(null),
  lastFetched: ref(null),
  subscribers: 0,
  timer: null,
}

async function _fetch() {
  if (_state.loading.value) return
  _state.loading.value = true
  try {
    const res = await licensingService.status()
    _state.data.value = res
    _state.error.value = null
    _state.lastFetched.value = new Date()
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

export function useLicenseStatus(autoMount = true) {
  if (autoMount) {
    onMounted(() => {
      _state.subscribers += 1
      if (_state.subscribers === 1) {
        _fetch()
        _start()
      }
    })

    onBeforeUnmount(() => {
      _state.subscribers = Math.max(0, _state.subscribers - 1)
      if (_state.subscribers === 0) _stop()
    })
  }

  const state = readonly(_state.data)

  const isValid = computed(() => state.value?.status === 'licensed')
  const daysRemaining = computed(() => state.value?.days_remaining ?? null)
  const isLifetime = computed(() => state.value?.is_lifetime === true)
  const machineCode = computed(() => state.value?.machine_code ?? '')

  return {
    state,
    loading: readonly(_state.loading),
    error: readonly(_state.error),
    lastFetched: readonly(_state.lastFetched),
    isValid,
    isLifetime,
    daysRemaining,
    machineCode,
    refresh: _fetch,
  }
}

/** Acesso directo ao estado sem registar subscriber (ex: router guard). */
export async function fetchLicenseStatus() {
  await _fetch()
  return _state.data.value
}

export function getLicenseStatus() {
  return _state.data.value
}
