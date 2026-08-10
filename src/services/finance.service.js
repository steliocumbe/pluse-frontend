import { api, uploadConfig } from './api'

function hasFile(payload) {
  return Object.values(payload).some((value) => value instanceof File || value instanceof Blob)
}

function toFormData(payload) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith('_')) continue
    if (value === null || value === undefined || value === '') continue

    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value)
      continue
    }

    if (Array.isArray(value) || (value && typeof value === 'object')) {
      fd.append(key, JSON.stringify(value))
      continue
    }

    if (typeof value === 'boolean') {
      fd.append(key, value ? 'true' : 'false')
      continue
    }

    fd.append(key, value)
  }
  return fd
}

function send(method, url, payload) {
  if (hasFile(payload)) {
    return api[method](url, toFormData(payload), uploadConfig(payload._onProgress))
      .then((r) => r.data)
  }
  return api[method](url, payload).then((r) => r.data)
}

export const financeAccountService = {
  list(params = {}) {
    return api.get('/finance/accounts/', { params }).then((r) => r.data)
  },
  create(payload) {
    return api.post('/finance/accounts/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/finance/accounts/${id}/`, payload).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/finance/accounts/${id}/`).then((r) => r.data)
  },
}

export const journalEntryService = {
  list(params = {}) {
    return api.get('/finance/journal-entries/', { params }).then((r) => r.data)
  },
  nextReference(entryType = 'expense') {
    return api.get('/finance/journal-entries/next-reference/', { params: { entry_type: entryType } }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/finance/journal-entries/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/finance/journal-entries/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/finance/journal-entries/${id}/`, payload).then((r) => r.data)
  },
  validate(id) {
    return api.post(`/finance/journal-entries/${id}/validate/`).then((r) => r.data)
  },
  remove(id) {
    return api.delete(`/finance/journal-entries/${id}/`).then((r) => r.data)
  },
}

export const billingDocumentService = {
  list(params = {}) {
    return api.get('/finance/billing-documents/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/finance/billing-documents/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/finance/billing-documents/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/finance/billing-documents/${id}/`, payload).then((r) => r.data)
  },
  issue(id) {
    return api.post(`/finance/billing-documents/${id}/issue/`).then((r) => r.data)
  },
  markPaid(id) {
    return api.post(`/finance/billing-documents/${id}/mark-paid/`).then((r) => r.data)
  },
  cancel(id) {
    return api.post(`/finance/billing-documents/${id}/cancel/`).then((r) => r.data)
  },
  sendEmail(id, payload = {}) {
    return api.post(`/finance/billing-documents/${id}/send-email/`, payload).then((r) => r.data)
  },
  sendWhatsApp(id, payload = {}) {
    return api.post(`/finance/billing-documents/${id}/send-whatsapp/`, payload).then((r) => r.data)
  },
  configureReceiptPlan(id, payload = {}) {
    return api.patch(`/finance/billing-documents/${id}/configure-receipt-plan/`, payload).then((r) => r.data)
  },
  testAutoEmail(id, payload = {}) {
    return api.post(`/finance/billing-documents/${id}/test-auto-email/`, payload).then((r) => r.data)
  },
  dispatchAutoEmails() {
    return api.post('/finance/billing-documents/dispatch-auto-emails/').then((r) => r.data)
  },
}

export const financeSystemSettingService = {
  get() {
    return api.get('/finance/settings/').then((r) => r.data)
  },
  update(payload) {
    return send('patch', '/finance/settings/', payload)
  },
}
