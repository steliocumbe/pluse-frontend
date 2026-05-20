import { api } from './api'


/**
 * Salary categories — the 4 fixed vigilante grades seeded on the backend.
 * Feeds the salary selector in the employee form.
 */
export const salaryCategoryService = {
  list() {
    return api.get('/salary-categories/').then((r) => r.data)
  },
}
