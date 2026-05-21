/**
 * Postos — listas de opções partilhadas (Fase 1.2).
 * Espelham as choices de `posts/models.py`.
 */

export const serviceTypeOptions = [
  { value: 'h12_day', label: 'H12 Diurno' },
  { value: 'h12_night', label: 'H12 Noturno' },
  { value: 'h24', label: 'H24' },
  { value: 'receptionist', label: 'Recepcionista' },
]

// Regime de turno do posto — define como a escala é montada.
export const shiftHoursOptions = [
  { value: 8, label: '8 horas — 1 turno/dia' },
  { value: 12, label: '12 horas — Diurno + Noturno' },
  { value: 24, label: '24 horas — 1 turno/dia' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const serviceTypeLabel = (v) => labelFrom(serviceTypeOptions, v)
export const shiftHoursLabel = (v) => labelFrom(shiftHoursOptions, v)

/**
 * Períodos de turno que um posto precisa por dia, derivados do regime.
 * Espelha `Post.shift_periods` no backend.
 */
export function periodsForRegime(shiftHours) {
  return { 8: ['day'], 12: ['day', 'night'], 24: ['full'] }[shiftHours] || []
}
