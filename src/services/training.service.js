import { api, uploadConfig } from './api'

/**
 * Formação e certificações (Fase 3.4).
 * Ambos os recursos aceitam um ficheiro (certificado) — usa multipart quando
 * presente.
 */

function toFormData(payload) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(payload)) {
    if (k.startsWith('_')) continue
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
    return api[method](url, toFormData(payload), uploadConfig(payload._onProgress))
      .then((r) => r.data)
  }
  return api[method](url, payload).then((r) => r.data)
}

export const trainingRecordService = {
  list(params = {}) {
    return api.get('/training-records/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/training-records/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/training-records/', payload)
  },
  update(id, payload) {
    return send('patch', `/training-records/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/training-records/${id}/`).then((r) => r.data)
  },
}

export const certificationService = {
  list(params = {}) {
    return api.get('/certifications/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/certifications/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/certifications/', payload)
  },
  update(id, payload) {
    return send('patch', `/certifications/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/certifications/${id}/`).then((r) => r.data)
  },
}
