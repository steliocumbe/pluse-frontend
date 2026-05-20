import { defineStore } from 'pinia'
import { contractService } from 'src/services/employment.service'

/**
 * Contracts store — list + current item for the Contratos de trabalho pages.
 * Mirrors the employees store: server-driven pagination, loading/error state.
 */
export const useContractsStore = defineStore('contracts', {
  state: () => ({
    items: [],
    count: 0,
    next: null,
    previous: null,

    current: null,

    loading: false,
    submitting: false,
    error: null,
  }),

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await contractService.list(params)
        if (data?.results !== undefined) {
          this.items = data.results
          this.count = data.count
          this.next = data.next
          this.previous = data.previous
        } else {
          this.items = data || []
          this.count = this.items.length
          this.next = null
          this.previous = null
        }
        return this.items
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id) {
      this.loading = true
      this.error = null
      try {
        this.current = await contractService.get(id)
        return this.current
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.submitting = true
      try {
        return await contractService.create(payload)
      } finally {
        this.submitting = false
      }
    },

    async update(id, payload) {
      this.submitting = true
      try {
        const updated = await contractService.update(id, payload)
        if (this.current?.id === id) this.current = updated
        return updated
      } finally {
        this.submitting = false
      }
    },

    async approve(id) {
      const updated = await contractService.approve(id)
      this._merge(updated)
      return updated
    },

    async reject(id, reason = '') {
      const updated = await contractService.reject(id, reason)
      this._merge(updated)
      return updated
    },

    _merge(updated) {
      const idx = this.items.findIndex((c) => c.id === updated.id)
      if (idx >= 0) this.items[idx] = updated
      if (this.current?.id === updated.id) this.current = updated
    },
  },
})
