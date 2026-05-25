/**
 * Férias, faltas e baixas — listas de opções partilhadas (Fase 3.2).
 * Espelham as choices de `leaves/models.py`.
 */

export const leaveTypeOptions = [
  { value: 'vacation', label: 'Férias' },
  { value: 'sick_leave', label: 'Baixa médica' },
  { value: 'unpaid', label: 'Licença sem vencimento' },
  { value: 'maternity', label: 'Licença de maternidade' },
  { value: 'paternity', label: 'Licença de paternidade' },
  { value: 'marriage', label: 'Licença de casamento' },
  { value: 'bereavement', label: 'Licença por falecimento' },
  { value: 'other', label: 'Outro' },
]

export const justificationTypeOptions = [
  { value: 'medical', label: 'Médico' },
  { value: 'family', label: 'Familiar' },
  { value: 'transport', label: 'Transporte / força maior' },
  { value: 'official', label: 'Convocação oficial' },
  { value: 'other', label: 'Outro' },
]

export const leaveStatusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'active', label: 'Aprovado' },
  { value: 'inactive', label: 'Rejeitado / cancelado' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const leaveTypeLabel = (v) => labelFrom(leaveTypeOptions, v)
export const justificationTypeLabel = (v) => labelFrom(justificationTypeOptions, v)

/** AppBadge variant for a leave/justification status. */
export function leaveStatusVariant(value) {
  return {
    pending: 'warning',
    active: 'success',
    inactive: 'neutral',
  }[value] || 'neutral'
}
