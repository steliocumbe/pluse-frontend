import { api } from './api'

/**
 * Licensing — estado da licença e upload.
 *
 * `GET /license/status/` é público (não bloqueado pelo middleware) e devolve
 * o estado actual para o frontend decidir entre desenhar a UI normal ou
 * redireccionar para /locked.
 *
 * `POST /license/upload/` aceita o conteúdo do `.lic` como string. O backend
 * valida tudo (assinatura, machine code, expiração) antes de aceitar.
 */

export const licensingService = {
  /** Estado da licença + machine code desta máquina. Não bloqueado. */
  status() {
    return api.get('/license/status/').then((r) => r.data)
  },

  /** Upload do conteúdo (texto) do ficheiro `.lic`. */
  upload(licenseText) {
    return api
      .post('/license/upload/', { license_text: licenseText })
      .then((r) => r.data)
  },
}
