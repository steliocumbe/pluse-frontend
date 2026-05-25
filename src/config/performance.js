/**
 * Avaliação de desempenho — opções e critérios (Fase 3.5).
 */

export const outcomeOptions = [
  { value: 'exceeds', label: 'Supera expectativas' },
  { value: 'meets', label: 'Cumpre expectativas' },
  { value: 'below', label: 'Abaixo das expectativas' },
  { value: 'unsatisfactory', label: 'Insatisfatório' },
]

export const criteria = [
  { field: 'score_quality', label: 'Cumprimento das funções' },
  { field: 'score_punctuality', label: 'Pontualidade e assiduidade' },
  { field: 'score_discipline', label: 'Disciplina e apresentação' },
  { field: 'score_teamwork', label: 'Trabalho em equipa' },
  { field: 'score_initiative', label: 'Iniciativa' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const outcomeLabel = (v) => labelFrom(outcomeOptions, v)

/** AppBadge variant para um desfecho. */
export function outcomeVariant(value) {
  return {
    exceeds: 'success',
    meets: 'info',
    below: 'warning',
    unsatisfactory: 'danger',
  }[value] || 'neutral'
}
