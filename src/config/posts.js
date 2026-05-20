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

export const shiftHoursOptions = [
  { value: 8, label: '8 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '24 horas' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const serviceTypeLabel = (v) => labelFrom(serviceTypeOptions, v)
export const shiftHoursLabel = (v) => labelFrom(shiftHoursOptions, v)
