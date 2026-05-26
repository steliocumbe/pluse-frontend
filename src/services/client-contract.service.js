import { api, uploadConfig } from './api'

/**
 * Contratos de cliente (comerciais) — PLUSE × Cliente.
 *
 * Workflow: draft → active (assinado) → expired/terminated.
 * Os ficheiros `signed_file` e `proposal_file` usam multipart quando presentes.
 */

function toFormData(payload) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(payload)) {
    if (k.startsWith('_')) continue
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) {
      // M2M (posts) — repete a chave para cada valor
      v.forEach((item) => fd.append(k, item))
      continue
    }
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

export const clientContractService = {
  list(params = {}) {
    return api.get('/client-contracts/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/client-contracts/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/client-contracts/', payload)
  },
  update(id, payload) {
    return send('patch', `/client-contracts/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/client-contracts/${id}/`).then((r) => r.data)
  },
  activate(id, body = {}) {
    return api.post(`/client-contracts/${id}/activate/`, body).then((r) => r.data)
  },
  terminate(id, body = {}) {
    return api.post(`/client-contracts/${id}/terminate/`, body).then((r) => r.data)
  },
}
