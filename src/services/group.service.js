import { api } from './api'


/**
 * Auth groups (roles) — seeded by `manage.py seed_roles` on the backend.
 * Used to populate the "Tipos de função" multi-select in the employee form.
 */
export const groupService = {
  list() {
    return api.get('/groups/').then((r) => r.data)
  },
}
