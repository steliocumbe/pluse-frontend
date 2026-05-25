import { api } from './api'

/**
 * Operações — Ocorrências e Participações (Fase 4.1).
 * Multipart automático quando há anexo.
 */

function toFormData(payload) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) {
      v.forEach((item) => fd.append(k, item))
    } else if (typeof v === 'boolean') {
      fd.append(k, v ? 'true' : 'false')
    } else {
      fd.append(k, v)
    }
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

export const incidentService = {
  list(params = {}) {
    return api.get('/incidents/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/incidents/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/incidents/', payload)
  },
  update(id, payload) {
    return send('patch', `/incidents/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/incidents/${id}/`).then((r) => r.data)
  },
  validate(id) {
    return api.post(`/incidents/${id}/validate/`).then((r) => r.data)
  },
  close(id) {
    return api.post(`/incidents/${id}/close/`).then((r) => r.data)
  },
}

export const ccoService = {
  overview(date) {
    const params = date ? { date } : {}
    return api.get('/cco/overview/', { params }).then((r) => r.data)
  },
}

export const participationService = {
  list(params = {}) {
    return api.get('/participations/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/participations/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/participations/', payload)
  },
  update(id, payload) {
    return send('patch', `/participations/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/participations/${id}/`).then((r) => r.data)
  },
  convert(id, payload = {}) {
    return api.post(`/participations/${id}/convert/`, payload).then((r) => r.data)
  },
  dismiss(id) {
    return api.post(`/participations/${id}/dismiss/`).then((r) => r.data)
  },
}
