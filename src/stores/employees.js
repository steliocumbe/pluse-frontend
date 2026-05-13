import { defineStore } from 'pinia'
import { employeeService } from 'src/services/employee.service'


/**
 * Employees store — keeps the list, current item, plus loading/error state.
 * Pages call `fetchList(filters)` on mount and on filter changes.
 *
 * Pagination is server-driven (DRF default page_size = 20). The store
 * holds `count` / `next` / `previous` straight from the API.
 */
export const useEmployeesStore = defineStore('employees', {
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

  getters: {
    pending: (state) => state.items.filter((e) => e.status === 'pending'),
    active: (state) => state.items.filter((e) => e.status === 'active'),
  },

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await employeeService.list(params)
        // DRF paginated:  { count, next, previous, results }
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
        this.current = await employeeService.get(id)
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
      this.error = null
      try {
        const created = await employeeService.create(payload)
        // Pre-pend to local list if it was loaded.
        if (this.items.length > 0) {
          this.items.unshift(created)
          this.count += 1
        }
        return created
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.submitting = false
      }
    },

    async update(id, payload) {
      this.submitting = true
      this.error = null
      try {
        const updated = await employeeService.update(id, payload)
        const idx = this.items.findIndex((e) => e.id === id)
        if (idx >= 0) this.items[idx] = updated
        if (this.current?.id === id) this.current = updated
        return updated
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.submitting = false
      }
    },

    async approve(id) {
      const updated = await employeeService.approve(id)
      this._mergeUpdated(updated)
      return updated
    },

    async inactivate(id) {
      const updated = await employeeService.inactivate(id)
      this._mergeUpdated(updated)
      return updated
    },

    _mergeUpdated(updated) {
      const idx = this.items.findIndex((e) => e.id === updated.id)
      if (idx >= 0) this.items[idx] = updated
      if (this.current?.id === updated.id) this.current = updated
    },
  },
})
