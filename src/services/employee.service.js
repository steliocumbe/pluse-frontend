import { api } from './api'


export const employeeService = {
  list(params = {}) {
    return api.get('/employees/', { params }).then((r) => r.data)
  },

  get(id) {
    return api.get(`/employees/${id}/`).then((r) => r.data)
  },

  /**
   * Create employee. Backend expects:
   *   { full_name, birth_date, gender, document_type, document_number, ...,
   *     types: [groupId, ...], create_account: bool }
   *
   * When `create_account=true`, response.user.temporary_password is present
   * — show it once to RH/Admin so they can deliver it to the colaborador.
   */
  create(payload) {
    return api.post('/employees/', payload).then((r) => r.data)
  },

  update(id, payload) {
    return api.patch(`/employees/${id}/`, payload).then((r) => r.data)
  },

  remove(id) {
    return api.delete(`/employees/${id}/`).then((r) => r.data)
  },

  approve(id) {
    return api.post(`/employees/${id}/approve/`).then((r) => r.data)
  },

  inactivate(id) {
    return api.post(`/employees/${id}/inactivate/`).then((r) => r.data)
  },

  // Documents
  listDocuments(employeeId) {
    return api.get(`/employees/${employeeId}/documents/`).then((r) => r.data)
  },

  uploadDocument(employeeId, formData) {
    return api
      .post(`/employees/${employeeId}/documents/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteDocument(employeeId, docId) {
    return api.delete(`/employees/${employeeId}/documents/${docId}/`).then((r) => r.data)
  },
}
