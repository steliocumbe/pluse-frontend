import { api } from './api'


/**
 * Posts (postos de segurança) — minimal stub module. Used during the RH
 * phase to populate the post selector on the employee form.
 */
export const postService = {
  list(params = {}) {
    return api.get('/posts/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/posts/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/posts/', payload).then((r) => r.data)
  },
}
