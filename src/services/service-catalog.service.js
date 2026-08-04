import { api } from './api'

export const serviceCatalogService = {
  list(params = {}) {
    return api.get('/service-catalog/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/service-catalog/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/service-catalog/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/service-catalog/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/service-catalog/${id}/`).then((r) => r.data)
  },
}
