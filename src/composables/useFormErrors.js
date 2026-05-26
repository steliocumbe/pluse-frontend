import { computed, ref } from 'vue'

/**
 * useFormErrors — gestão consistente de erros de formulários do DRF.
 *
 * O DRF devolve 400 com payloads tipicamente neste formato:
 *
 *   {
 *     "field_a": ["mensagem 1", "mensagem 2"],
 *     "field_b": ["outra"],
 *     "non_field_errors": ["erro global"],
 *     "detail": "às vezes existe"
 *   }
 *
 * Este composable normaliza isso para:
 *
 *   - `fieldErrors[<campo>]` → string única (primeira mensagem)
 *   - `globalErrors`         → array de strings com erros não-campo
 *   - `hasErrors`            → boolean
 *
 * Uso típico:
 *
 *   const { fieldErrors, globalErrors, setFromResponse, clear } = useFormErrors()
 *
 *   try {
 *     await api.post(...)
 *   } catch (err) {
 *     setFromResponse(err.response)
 *   }
 *
 *   <q-input :error="!!fieldErrors.email" :error-message="fieldErrors.email" />
 */

const GLOBAL_KEYS = ['non_field_errors', 'detail', '__all__']

function flatten(payload) {
  const field = {}
  const global = []

  if (!payload || typeof payload !== 'object') {
    if (payload) global.push(String(payload))
    return { field, global }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (GLOBAL_KEYS.includes(key)) {
      const list = Array.isArray(value) ? value : [value]
      list.forEach((v) => v && global.push(String(v)))
      continue
    }
    if (Array.isArray(value)) {
      // Primeira mensagem string — listas de objects (ex. nested serializer)
      // viram JSON string para não morrermos com [object Object].
      const first = value[0]
      if (typeof first === 'string') field[key] = first
      else if (first && typeof first === 'object') field[key] = JSON.stringify(first)
    } else if (typeof value === 'string') {
      field[key] = value
    } else if (value && typeof value === 'object') {
      // Recursão para nested serializers — flatten chaves com ponto
      const nested = flatten(value)
      Object.entries(nested.field).forEach(([k, v]) => {
        field[`${key}.${k}`] = v
      })
      global.push(...nested.global)
    }
  }
  return { field, global }
}

export function useFormErrors() {
  const fieldErrors = ref({})
  const globalErrors = ref([])

  const hasErrors = computed(
    () => globalErrors.value.length > 0 || Object.keys(fieldErrors.value).length > 0,
  )

  function clear() {
    fieldErrors.value = {}
    globalErrors.value = []
  }

  /** Apaga o erro de UM campo (útil ao editar o input). */
  function clearField(name) {
    if (fieldErrors.value[name]) {
      const copy = { ...fieldErrors.value }
      delete copy[name]
      fieldErrors.value = copy
    }
  }

  /** Recebe `err.response` (axios) ou um payload já extraído. */
  function setFromResponse(response) {
    clear()
    const data = response?.data ?? response
    if (!data) {
      globalErrors.value = ['Erro inesperado. Tente novamente.']
      return
    }
    const { field, global } = flatten(data)
    fieldErrors.value = field
    globalErrors.value = global.length
      ? global
      : (Object.keys(field).length === 0 ? ['Não foi possível guardar.'] : [])
  }

  return {
    fieldErrors,
    globalErrors,
    hasErrors,
    setFromResponse,
    clear,
    clearField,
  }
}
