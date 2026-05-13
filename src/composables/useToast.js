import { Notify } from 'quasar'

/**
 * Thin wrapper around Quasar's Notify plugin so the rest of the app calls
 * `useToast().success(...)` etc. without thinking about Quasar internals.
 *
 * All notifications appear top-right, dismissable, with consistent timing.
 * Backend services emit toasts on error via the Axios interceptor; pages
 * emit toasts on success (after create/update/delete) and validation.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('Colaborador criado.')
 *   toast.error('Não foi possível guardar.', { caption: err.message })
 */
const COMMON = {
  position: 'top-right',
  progress: true,
  actions: [{ icon: 'close', round: true, color: 'white', dense: true }],
  // Hugging the AppHeader (z-10) — keep above page content but below modals (z-100).
  classes: 'pluse-toast',
}

function notify(level, message, opts = {}) {
  return Notify.create({
    ...COMMON,
    type: level,
    message,
    timeout: opts.timeout ?? (level === 'negative' ? 6000 : 3500),
    caption: opts.caption,
    icon: opts.icon,
    ...opts.raw, // escape hatch for Quasar-native props
  })
}

export function useToast() {
  return {
    success: (message, opts) => notify('positive', message, opts),
    error: (message, opts) => notify('negative', message, opts),
    info: (message, opts) => notify('info', message, opts),
    warning: (message, opts) => notify('warning', message, opts),
    // Stable handle of an indefinite toast — use for "loading" UX:
    //   const dismiss = toast.loading('A processar…')
    //   try { await action() } finally { dismiss() }
    loading: (message, opts) =>
      Notify.create({
        ...COMMON,
        type: 'ongoing',
        message,
        spinner: true,
        timeout: 0,
        ...opts?.raw,
      }),
  }
}
