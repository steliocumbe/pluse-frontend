import { api } from './api'

/**
 * Avaliações de desempenho (Fase 3.5).
 * Multipart quando há anexo.
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

export const performanceReviewService = {
  list(params = {}) {
    return api.get('/performance-reviews/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/performance-reviews/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/performance-reviews/', payload)
  },
  update(id, payload) {
    return send('patch', `/performance-reviews/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/performance-reviews/${id}/`).then((r) => r.data)
  },
}
