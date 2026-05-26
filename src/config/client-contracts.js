/**
 * Contratos comerciais de cliente — opções partilhadas.
 * Espelham as TextChoices de `clients/models.py:ClientContract`.
 */

export const contractStatusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Activo' },
  { value: 'expired', label: 'Expirado' },
  { value: 'terminated', label: 'Terminado' },
]

export const modalityOptions = [
  { value: 'static_guards', label: 'Vigilância estática' },
  { value: 'armed_reaction', label: 'Reação armada' },
  { value: 'event_security', label: 'Segurança de eventos' },
  { value: 'transport', label: 'Transporte de valores' },
  { value: 'mixed', label: 'Misto' },
  { value: 'other', label: 'Outro' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export function contractStatusVariant(value) {
  return {
    draft: 'neutral',
    active: 'success',
    expired: 'warning',
    terminated: 'danger',
  }[value] || 'neutral'
}

export const modalityLabel = (v) => labelFrom(modalityOptions, v)
export const contractStatusLabel = (v) => labelFrom(contractStatusOptions, v)
