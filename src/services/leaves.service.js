import { api } from './api'

/**
 * Férias, faltas e baixas (Fase 3.2).
 *
 * - `leaveRequestService` — pedidos de férias / outras ausências planeadas.
 * - `absenceJustificationService` — justificação de faltas (RH insere →
 *   Diretor Financeiro aprova).
 */

function toFormData(payload) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined || v === '') continue
    if (typeof v === 'boolean') fd.append(k, v ? 'true' : 'false')
    else fd.append(k, v)
  }
  return fd
}
function hasFile(payload) {
  return Object.values(payload).some((v) => v instanceof File || v instanceof Blob)
}
function send(method, url, payload) {
  if (hasFile(payload)) {
    return api[method](url, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  }
  return api[method](url, payload).then((r) => r.data)
}

export const leaveRequestService = {
  list(params = {}) {
    return api.get('/leaves/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/leaves/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/leaves/', payload)
  },
  update(id, payload) {
    return send('patch', `/leaves/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/leaves/${id}/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/leaves/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/leaves/${id}/reject/`, { reason }).then((r) => r.data)
  },
}

export const absenceJustificationService = {
  list(params = {}) {
    return api.get('/absence-justifications/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/absence-justifications/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/absence-justifications/', payload)
  },
  update(id, payload) {
    return send('patch', `/absence-justifications/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/absence-justifications/${id}/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/absence-justifications/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/absence-justifications/${id}/reject/`, { reason }).then((r) => r.data)
  },
}
