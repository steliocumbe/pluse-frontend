import { api } from './api'

/**
 * Processamento salarial (Fase 3.3) — folhas de pagamento mensais.
 */
export const payrollService = {
  list(params = {}) {
    return api.get('/payroll-runs/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/payroll-runs/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/payroll-runs/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/payroll-runs/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/payroll-runs/${id}/`).then((r) => r.data)
  },
  regenerate(id) {
    return api.post(`/payroll-runs/${id}/regenerate/`).then((r) => r.data)
  },
  approve(id) {
    return api.post(`/payroll-runs/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/payroll-runs/${id}/reject/`, { reason }).then((r) => r.data)
  },
  /**
   * Faz download da folha em Excel (.xlsx). Vai pelo axios (com o token
   * Bearer) — não dá para abrir o URL directamente porque o backend exige
   * autenticação. Devolve { blob, filename } para o caller guardar.
   */
  exportXlsx(id) {
    return api
      .get(`/payroll-runs/${id}/export/`, { responseType: 'blob' })
      .then((r) => {
        const disp = r.headers?.['content-disposition'] || ''
        const match = /filename="?([^"]+)"?/.exec(disp)
        return {
          blob: r.data,
          filename: match?.[1] || `folha-${id}.xlsx`,
        }
      })
  },
}

export const payrollDoubleRuleService = {
  list(params = {}) {
    return api.get('/payroll-double-rules/', { params }).then((r) => r.data)
  },
  create(payload) {
    return api.post('/payroll-double-rules/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/payroll-double-rules/${id}/`, payload).then((r) => r.data)
  },
}
