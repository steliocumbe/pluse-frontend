import { api } from './api'

/**
 * Postos de segurança — cadastro completo (Fase 1.2).
 * `procedures_file` / `opening_form_file` usam multipart quando presentes.
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

export const postService = {
  list(params = {}) {
    return api.get('/posts/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/posts/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/posts/', payload)
  },
  update(id, payload) {
    return send('patch', `/posts/${id}/`, payload)
  },
  remove(id) {
    return api.delete(`/posts/${id}/`).then((r) => r.data)
  },
  activate(id) {
    return api.post(`/posts/${id}/activate/`).then((r) => r.data)
  },
}
