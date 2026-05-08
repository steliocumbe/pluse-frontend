import { defineBoot } from '#q-app/wrappers'
import { api, attachInterceptors } from 'src/services/api'
import { useAuthStore } from 'src/stores/auth'

export default defineBoot(({ app }) => {
  const authStore = useAuthStore()
  attachInterceptors(authStore)

  // Make $api / $authStore available inside template via `this.$api` (Options API).
  // Composition API users should import { api } and useAuthStore() directly.
  app.config.globalProperties.$api = api
  app.config.globalProperties.$auth = authStore
})

export { api }
