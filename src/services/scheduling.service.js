import { api } from './api'

/**
 * Escalas & Presenças (Fase 2) — turnos (`Shift`).
 */
export const shiftService = {
  list(params = {}) {
    return api.get('/shifts/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/shifts/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/shifts/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/shifts/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/shifts/${id}/`).then((r) => r.data)
  },
  generate(payload) {
    return api.post('/shifts/generate/', payload).then((r) => r.data)
  },
  markAttendance(id, payload) {
    return api.post(`/shifts/${id}/mark-attendance/`, payload).then((r) => r.data)
  },
  attendanceSummary(params = {}) {
    return api.get('/attendance-summary/', { params }).then((r) => r.data)
  },
}
