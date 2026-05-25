import { api } from './api'

/**
 * Salary categories — escalões fixos para vigilantes.
 * Lista no formulário de contrato; CRUD na página de gestão (Fase 3.3).
 */
export const salaryCategoryService = {
  list() {
    return api.get('/salary-categories/').then((r) => r.data)
  },
  get(id) {
    return api.get(`/salary-categories/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/salary-categories/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/salary-categories/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/salary-categories/${id}/`).then((r) => r.data)
  },
}
