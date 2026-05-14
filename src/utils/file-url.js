/**
 * Resolve a backend file URL to an absolute URL.
 *
 * The DRF serializers already build absolute URLs when the request is in
 * their context — but as a safety net for callers that may forget to wire
 * that, this helper turns any relative `/media/...` path into a full URL
 * pointing at the configured `VITE_API_URL` host.
 *
 * Use it in templates: <a :href="absoluteFileUrl(doc.file)">.
 */
const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

export function absoluteFileUrl(url) {
  if (!url) return ''
  // Already absolute (http://..., https://..., blob:..., data:...)
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) return url
  // Server-relative ("/media/...") — prepend backend origin
  if (url.startsWith('/')) return `${API_BASE}${url}`
  // Relative ("media/...") — prepend backend origin + slash
  return `${API_BASE}/${url}`
}
