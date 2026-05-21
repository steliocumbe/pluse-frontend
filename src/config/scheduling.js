/**
 * Escalas & Presenças — listas de opções partilhadas (Fase 2).
 * Espelham as choices de `scheduling/models.py`.
 */

export const periodOptions = [
  { value: 'day', label: 'Diurno' },
  { value: 'night', label: 'Noturno' },
  { value: 'full', label: '24 horas' },
]

export const attendanceStatusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'present', label: 'Presente' },
  { value: 'absent', label: 'Faltou' },
  { value: 'substituted', label: 'Substituído' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const periodLabel = (v) => labelFrom(periodOptions, v)
export const attendanceStatusLabel = (v) => labelFrom(attendanceStatusOptions, v)

/** Quasar AppBadge variant for an attendance status. */
export function attendanceVariant(value) {
  return {
    pending: 'neutral',
    present: 'success',
    absent: 'danger',
    substituted: 'warning',
  }[value] || 'neutral'
}
