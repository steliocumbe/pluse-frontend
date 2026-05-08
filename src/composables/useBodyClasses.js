import { onBeforeUnmount, onMounted, watch } from 'vue'

/**
 * Adds the given classes to <body> while the calling component is mounted,
 * and removes them on unmount. Useful for layouts that depend on body-level
 * class hooks (Metronic's `demo1`, `kt-sidebar-fixed`, `kt-header-fixed`).
 *
 * Accepts a string, array, or a reactive ref to either, so callers can
 * toggle classes responsively (e.g. `kt-sidebar-collapse` on toggle).
 */
export function useBodyClasses(input) {
  let current = []

  function apply(next) {
    const list = normalize(next)
    const toAdd = list.filter((c) => !current.includes(c))
    const toRemove = current.filter((c) => !list.includes(c))
    if (toRemove.length) document.body.classList.remove(...toRemove)
    if (toAdd.length) document.body.classList.add(...toAdd)
    current = list
  }

  function normalize(value) {
    const raw = typeof value === 'function' ? value() : value
    if (!raw) return []
    if (Array.isArray(raw)) return raw.filter(Boolean)
    return String(raw).split(/\s+/).filter(Boolean)
  }

  onMounted(() => {
    if (typeof input === 'object' && input !== null && 'value' in input) {
      apply(input.value)
      watch(input, (v) => apply(v))
    } else {
      apply(input)
    }
  })

  onBeforeUnmount(() => {
    if (current.length) document.body.classList.remove(...current)
    current = []
  })
}
