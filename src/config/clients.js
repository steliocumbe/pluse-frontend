/**
 * Clientes — listas de opções partilhadas (Fase 1).
 * Espelham as TextChoices de `clients/models.py`.
 */

export const clientTypeOptions = [
  { value: 'armed_reaction', label: 'Reação Armada' },
  { value: 'static', label: 'Estática' },
]

export const riskLevelOptions = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
]

export const clientStageOptions = [
  { value: 'prospecting', label: 'Prospeção' },
  { value: 'risk_review', label: 'Análise de risco em aprovação' },
  { value: 'approved', label: 'Admissão concluída' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const clientTypeLabel = (v) => labelFrom(clientTypeOptions, v)
export const riskLevelLabel = (v) => labelFrom(riskLevelOptions, v)
export const clientStageLabel = (v) => labelFrom(clientStageOptions, v)
