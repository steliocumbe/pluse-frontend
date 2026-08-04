import { api } from './api'

export const departmentService = {
  list(params = {}) {
    return api.get('/hr/departments/', { params }).then((r) => r.data)
  },
}

export const vacationPlanService = {
  list(params = {}) {
    return api.get('/hr/vacation-plans/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/hr/vacation-plans/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/hr/vacation-plans/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/hr/vacation-plans/${id}/`, payload).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/hr/vacation-plans/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/hr/vacation-plans/${id}/reject/`, { reason }).then((r) => r.data)
  },
}

export const vacationBalanceService = {
  list(params = {}) {
    return api.get('/hr/vacation-balances/', { params }).then((r) => r.data)
  },
  adjust(id, payload) {
    return api.post(`/hr/vacation-balances/${id}/adjust/`, payload).then((r) => r.data)
  },
}
