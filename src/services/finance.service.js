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

export const financeServicePricingService = {
  list(params = {}) {
    return api.get('/finance/service-pricing/', { params }).then((r) => r.data)
  },
  get(id) {
    return api.get(`/finance/service-pricing/${id}/`).then((r) => r.data)
  },
  create(payload) {
    return api.post('/finance/service-pricing/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/finance/service-pricing/${id}/`, payload).then((r) => r.data)
  },
  upsert(payload) {
    return api.post('/finance/service-pricing/upsert/', payload).then((r) => r.data)
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

export const financeRequisitionService = {
  list(params = {}) {
    return api.get('/finance/requisitions/', { params }).then((r) => r.data)
  },
  create(payload) {
    return send('post', '/finance/requisitions/', payload)
  },
  update(id, payload) {
    return send('patch', `/finance/requisitions/${id}/`, payload)
  },
  approve(id) {
    return api.post(`/finance/requisitions/${id}/approve/`).then((r) => r.data)
  },
  reject(id, reason = '') {
    return api.post(`/finance/requisitions/${id}/reject/`, { reason }).then((r) => r.data)
  },
  markPaid(id) {
    return api.post(`/finance/requisitions/${id}/mark-paid/`).then((r) => r.data)
  },
}

export const financePartnerDebtService = {
  list(params = {}) {
    return api.get('/finance/partner-debts/', { params }).then((r) => r.data)
  },
  create(payload) {
    return api.post('/finance/partner-debts/', payload).then((r) => r.data)
  },
  update(id, payload) {
    return api.patch(`/finance/partner-debts/${id}/`, payload).then((r) => r.data)
  },
  markPaid(id) {
    return api.post(`/finance/partner-debts/${id}/mark-paid/`).then((r) => r.data)
  },
  cancel(id) {
    return api.post(`/finance/partner-debts/${id}/cancel/`).then((r) => r.data)
  },
}

export const financeCommunicationLogService = {
  list(params = {}) {
    return api.get('/finance/communication-logs/', { params }).then((r) => r.data)
  },
}

export const financeActivityLogService = {
  list(params = {}) {
    return api.get('/finance/activity-logs/', { params }).then((r) => r.data)
  },
}

export const financeReportService = {
  overview(params = {}) {
    return api.get('/finance/reports/overview/', { params }).then((r) => r.data)
  },
  clientStatement(params = {}) {
    return api.get('/finance/reports/client-statement/', { params }).then((r) => r.data)
  },
  ledger(params = {}) {
    return api.get('/finance/reports/ledger/', { params }).then((r) => r.data)
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
  dispatchReminders(payload = {}) {
    return api.post('/finance/billing-documents/dispatch-reminders/', payload).then((r) => r.data)
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
