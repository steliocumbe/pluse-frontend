import { api, uploadConfig } from './api'

/**
 * PWA do vigilante — endpoints `me/...` (Fase 4.5).
 * O backend infere o `Employee` a partir do utilizador autenticado.
 */

function toFormData(payload) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined || v === '') continue
    fd.append(k, v)
  }
  return fd
}
function hasFile(payload) {
  return Object.values(payload).some((v) => v instanceof File || v instanceof Blob)
}

export const vigilanteService = {
  profile() {
    return api.get('/me/profile/').then((r) => r.data)
  },
  schedule(params = {}) {
    return api.get('/me/schedule/', { params }).then((r) => r.data)
  },
  today() {
    return api.get('/me/today/').then((r) => r.data)
  },
  checkIn(payload = {}) {
    return api.post('/me/check-in/', payload).then((r) => r.data)
  },
  checkOut(payload = {}) {
    return api.post('/me/check-out/', payload).then((r) => r.data)
  },
  createIncident(payload, onProgress) {
    if (hasFile(payload)) {
      return api
        .post('/me/incidents/', toFormData(payload), uploadConfig(onProgress))
        .then((r) => r.data)
    }
    return api.post('/me/incidents/', payload).then((r) => r.data)
  },
}

/**
 * GPS — obter posição actual com Promise.
 * Resolve com `{latitude, longitude, accuracy}` ou rejeita com erro legível.
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este dispositivo não suporta GPS.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        const messages = {
          1: 'Permissão de localização negada. Active o GPS para confirmar presença.',
          2: 'Posição GPS indisponível. Tente sair e voltar para o sinal.',
          3: 'Tempo esgotado a obter localização. Tente novamente.',
        }
        reject(new Error(messages[err.code] || err.message || 'Erro de GPS.'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000, ...options },
    )
  })
}

/**
 * Fila offline simples para check-ins / ocorrências por enviar.
 * Persiste em localStorage; o frontend tenta drenar quando online.
 */
const OFFLINE_KEY = 'pluse.vigilante.offline_queue'

export const offlineQueue = {
  list() {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]')
    } catch {
      return []
    }
  },
  add(entry) {
    const list = offlineQueue.list()
    list.push({ id: Date.now(), ...entry })
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list))
    return list
  },
  remove(id) {
    const list = offlineQueue.list().filter((e) => e.id !== id)
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list))
    return list
  },
  clear() {
    localStorage.removeItem(OFFLINE_KEY)
  },
  async drain() {
    const list = offlineQueue.list()
    const failed = []
    for (const entry of list) {
      try {
        if (entry.type === 'check-in') {
          await vigilanteService.checkIn(entry.payload)
        } else if (entry.type === 'check-out') {
          await vigilanteService.checkOut(entry.payload)
        } else if (entry.type === 'incident') {
          await vigilanteService.createIncident(entry.payload)
        }
      } catch {
        failed.push(entry)
      }
    }
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(failed))
    return { sent: list.length - failed.length, pending: failed.length }
  },
}
