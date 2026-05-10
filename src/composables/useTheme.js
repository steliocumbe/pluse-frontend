import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'pluse.theme'

/**
 * Theme management compatible with Metronic's class-based dark mode.
 * Adds/removes `.dark` on <html> so both Metronic CSS and our Tailwind v4
 * `@custom-variant dark` rules light up at the same time.
 *
 * Supported values: 'light' | 'dark' | 'system'
 */
const stored = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
})()

const theme = ref(stored || 'system')

function resolve(mode) {
  if (mode === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(mode) {
  const effective = resolve(mode)
  document.documentElement.classList.toggle('dark', effective === 'dark')
  document.documentElement.setAttribute('data-kt-theme-mode', mode)
}

// Persist + apply whenever theme changes.
watch(
  theme,
  (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {
      /* private mode — ignore */
    }
    applyTheme(v)
  },
  { immediate: true },
)

// Track OS-level changes when mode is 'system'.
if (typeof window !== 'undefined' && window.matchMedia) {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system')
    })
}

export function useTheme() {
  const isDark = computed(() => resolve(theme.value) === 'dark')
  function setTheme(v) {
    theme.value = v
  }
  function toggleDark() {
    theme.value = isDark.value ? 'light' : 'dark'
  }
  return { theme, isDark, setTheme, toggleDark }
}
