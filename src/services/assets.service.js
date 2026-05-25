import { api } from './api'

/**
 * Ativos e equipamento (Fase 4.4) — viaturas, equipamentos, atribuições.
 */

export const vehicleService = {
  list(params = {}) {
    return api.get('/vehicles/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/vehicles/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/vehicles/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/vehicles/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/vehicles/${id}/`).then((r) => r.data)
  },
}

export const equipmentService = {
  list(params = {}) {
    return api.get('/equipment/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/equipment/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/equipment/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/equipment/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/equipment/${id}/`).then((r) => r.data)
  },
}

export const assetAssignmentService = {
  list(params = {}) {
    return api.get('/asset-assignments/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/asset-assignments/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/asset-assignments/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/asset-assignments/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/asset-assignments/${id}/`).then((r) => r.data)
  },
  returnAsset(id) {
    return api.post(`/asset-assignments/${id}/return/`).then((r) => r.data)
  },
}
