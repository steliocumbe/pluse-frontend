import { api } from './api'

/**
 * Employment / Gestão Contratual (RH-2) API layer.
 *
 * One module for the whole contractual domain — contracts, terminations,
 * disciplinary records, transfers and the RH red-flag alerts. Each export
 * mirrors a DRF endpoint under /api/v1/.
 *
 * `file` fields use multipart; helpers below build FormData transparently
 * when a File is present in the payload.
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

// ── Contratos de trabalho ───────────────────────────────────────────────
export const contractService = {
  list(params = {}) {
    return api.get('/contracts/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/contracts/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/contracts/', payload)
  },
  update(id, payload) {
    return send('patch', `/contracts/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/contracts/${id}/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/contracts/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/contracts/${id}/reject/`, { reason }).then((r) => r.data)
  },
}

// ── Cessações de contrato ───────────────────────────────────────────────
export const terminationService = {
  list(params = {}) {
    return api.get('/terminations/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/terminations/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/terminations/', payload)
  },
  update(id, payload) {
    return send('patch', `/terminations/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/terminations/${id}/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/terminations/${id}/approve/`).then((r) => r.data)
  },
  reject(id) {
    return api.post(`/terminations/${id}/reject/`).then((r) => r.data)
  },
}

// ── Registos disciplinares ──────────────────────────────────────────────
export const disciplinaryService = {
  list(params = {}) {
    return api.get('/disciplinary-records/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/disciplinary-records/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/disciplinary-records/', payload)
  },
  update(id, payload) {
    return send('patch', `/disciplinary-records/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/disciplinary-records/${id}/`).then((r) => r.data)
  },
}

// ── Transferências ──────────────────────────────────────────────────────
export const transferService = {
  list(params = {}) {
    return api.get('/transfers/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/transfers/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/transfers/', payload)
  },
  update(id, payload) {
    return send('patch', `/transfers/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/transfers/${id}/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/transfers/${id}/approve/`).then((r) => r.data)
  },
  reject(id) {
    return api.post(`/transfers/${id}/reject/`).then((r) => r.data)
  },
}

// ── Alertas RH (red-flags) ──────────────────────────────────────────────
export const hrAlertsService = {
  list(days = 30) {
    return api.get('/alerts/', { params: { days } }).then((r) => r.data)
  },
}
