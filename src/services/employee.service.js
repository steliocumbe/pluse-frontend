import { api } from './api'


export const employeeService = {
  list(params = {}) {
    return api.get('/employees/', { params }).then((r) => r.data)
  },

  get(id) {
    return api.get(`/employees/${id}/`).then((r) => r.data)
  },

  /**
   * Create employee + initial work contract (always) + initial documents.
   *
   * `initialContract` is mandatory — the backend creates the Employee, its
   * User (if requested), the first EmploymentContract (PENDING) and all
   * Documents atomically.
   *
   * When `initialDocuments` is empty: sends regular JSON.
   * When `initialDocuments` has entries: switches to multipart and sends
   * the files as `initial_documents_files_{N}`.
   */
  create(payload, initialDocuments = [], initialContract = null) {
    const contractJson = JSON.stringify(initialContract || {})

    if (!initialDocuments || initialDocuments.length === 0) {
      return api
        .post('/employees/', { ...payload, initial_contract: contractJson })
        .then((r) => r.data)
    }

    const fd = new FormData()
    for (const [k, v] of Object.entries(payload)) {
      if (v === null || v === undefined) continue
      if (k === 'types' && Array.isArray(v)) {
        v.forEach((id) => fd.append('types', String(id)))
      } else if (Array.isArray(v)) {
        v.forEach((item) => fd.append(k, String(item)))
      } else if (typeof v === 'boolean') {
        fd.append(k, v ? 'true' : 'false')
      } else {
        fd.append(k, String(v))
      }
    }

    fd.append('initial_contract', contractJson)

    const meta = initialDocuments.map((d) => ({
      type: d.type,
      title: d.title || '',
      issue_date: d.issue_date || null,
      expiry_date: d.expiry_date || null,
      notes: d.notes || '',
    }))
    fd.append('initial_documents', JSON.stringify(meta))
    initialDocuments.forEach((d, i) => {
      fd.append(`initial_documents_files_${i}`, d.file)
    })

    return api
      .post('/employees/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
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
