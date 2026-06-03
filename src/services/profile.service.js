import { api } from './api'

/**
 * Profile — gestão do perfil do utilizador autenticado.
 *
 * Estes endpoints actualizam apenas dados do próprio utilizador (PATCH /me/),
 * fazem alteração de password e gerem as sessões JWT activas.
 */

export const profileService = {
  /** Devolve o objecto User completo (UserSerializer no backend). */
  me() {
    return api.get('/auth/me/').then((r) => r.data)
  },

  /**
   * Actualiza dados próprios — whitelist `full_name` e `phone`.
   * Campos não-whitelisted são silenciosamente ignorados pelo backend.
   */
  updateMe(payload) {
    return api.patch('/auth/me/', payload).then((r) => r.data)
  },

  /**
   * Muda password. Backend pede `old_password` + `new_password`.
   * Devolve 204; em caso de erro devolve 400 com mensagens por campo.
   */
  changePassword(payload) {
    return api.post('/auth/change-password/', payload).then((r) => r.data)
  },

  /** Lista sessões activas (refresh tokens não expirados nem revogados). */
  sessions() {
    return api.get('/auth/me/sessions/').then((r) => r.data)
  },

  /**
   * Termina todas as outras sessões. Recebe o refresh actual (do localStorage)
   * para o preservar — assim o utilizador continua autenticado neste browser.
   */
  logoutAllOther(currentRefresh) {
    return api
      .post('/auth/logout-all-other/', { refresh: currentRefresh })
      .then((r) => r.data)
  },
}
