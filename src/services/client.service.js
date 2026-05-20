import { api } from './api'

/**
 * Clientes — cadastro + workflow de onboarding (Fase 1).
 *
 * Onboarding: Prospeção → Análise de risco (em aprovação) → Concluído.
 * `risk_analysis_file` usa multipart quando presente.
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

export const clientService = {
  list(params = {}) {
    return api.get('/clients/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/clients/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/clients/', payload)
  },
  update(id, payload) {
    return send('patch', `/clients/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/clients/${id}/`).then((r) => r.data)
  },
  submitRisk(id) {
    return api.post(`/clients/${id}/submit-risk/`).then((r) => r.data)
  },
  approveOnboarding(id) {
    return api.post(`/clients/${id}/approve-onboarding/`).then((r) => r.data)
  },
  rejectOnboarding(id, reason = '') {
    return api.post(`/clients/${id}/reject-onboarding/`, { reason }).then((r) => r.data)
  },
}
