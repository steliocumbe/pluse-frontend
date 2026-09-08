/**
 * Resolve a backend file URL to an absolute URL.
 *
 * The DRF serializers already build absolute URLs when the request is in
 * their context — but as a safety net for callers that may forget to wire
 * that, this helper turns any relative `/media/...` path into a full URL
 * pointing at the active backend host.
 *
 * Use it in templates: <a :href="absoluteFileUrl(doc.file)">.
 */
export function backendBaseUrl() {
  const desktopBackend =
    typeof window !== 'undefined' ? window.pluseDesktop?.backendUrl : null
  return (
    desktopBackend ||
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8765'
  ).replace(/\/+$/, '')
}

export function absoluteFileUrl(url) {
  if (!url) return ''
  // Already absolute (http://..., https://..., blob:..., data:...)
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) return url
  // Server-relative ("/media/...") — prepend backend origin
  if (url.startsWith('/')) return `${backendBaseUrl()}${url}`
  // Relative ("media/...") — prepend backend origin + slash
  return `${backendBaseUrl()}/${url}`
}
