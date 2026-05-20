import { api } from './api'


/**
 * Clients — minimal stub module. Used during the RH phase to populate the
 * client selector for Operations-department employees.
 */
export const clientService = {
  list(params = {}) {
    return api.get('/clients/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/clients/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/clients/', payload).then((r) => r.data)
  },
}
