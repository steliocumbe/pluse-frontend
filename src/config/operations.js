/**
 * Operações — listas de opções partilhadas (Fase 4.1).
 * Espelham as choices de `operations/models.py`.
 */

export const incidentTypeOptions = [
  { value: 'robbery', label: 'Assalto' },
  { value: 'intrusion', label: 'Intrusão' },
  { value: 'alarm', label: 'Alarme accionado' },
  { value: 'accident', label: 'Acidente' },
  { value: 'conflict', label: 'Conflito' },
  { value: 'equipment_failure', label: 'Falha de equipamento' },
  { value: 'suspicious_activity', label: 'Atividade suspeita' },
  { value: 'other', label: 'Outro' },
]

export const severityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
]

export const incidentStateOptions = [
  { value: 'registered', label: 'Registada' },
  { value: 'validated', label: 'Validada' },
  { value: 'closed', label: 'Encerrada' },
]

export const participationSourceOptions = [
  { value: 'cco', label: 'Base de Operações' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'manager', label: 'Gestor Operativo' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'other', label: 'Outra' },
]

export const participationStateOptions = [
  { value: 'registered', label: 'Registada' },
  { value: 'in_review', label: 'Em análise' },
  { value: 'converted', label: 'Convertida em processo' },
  { value: 'dismissed', label: 'Arquivada' },
]

export const disciplinaryRecordTypeOptions = [
  { value: 'verbal_warning', label: 'Advertência verbal' },
  { value: 'written_warning', label: 'Advertência escrita' },
  { value: 'suspension', label: 'Suspensão' },
  { value: 'disciplinary_process', label: 'Processo disciplinar' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const incidentTypeLabel = (v) => labelFrom(incidentTypeOptions, v)
export const severityLabel = (v) => labelFrom(severityOptions, v)
export const participationSourceLabel = (v) => labelFrom(participationSourceOptions, v)

export function severityVariant(value) {
  return {
    low: 'neutral',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  }[value] || 'neutral'
}

export function incidentStateVariant(value) {
  return {
    registered: 'warning',
    validated: 'info',
    closed: 'success',
  }[value] || 'neutral'
}

export function participationStateVariant(value) {
  return {
    registered: 'warning',
    in_review: 'info',
    converted: 'success',
    dismissed: 'neutral',
  }[value] || 'neutral'
}

export const patrolKindOptions = [
  { value: 'patrol', label: 'Ronda' },
  { value: 'supervision', label: 'Supervisão' },
]

export const patrolStateOptions = [
  { value: 'planned', label: 'Planeada' },
  { value: 'in_progress', label: 'Em curso' },
  { value: 'completed', label: 'Concluída' },
  { value: 'missed', label: 'Não realizada' },
]

export const patrolPeriodOptions = [
  { value: 'day', label: 'Diurno' },
  { value: 'night', label: 'Noturno' },
  { value: 'full', label: 'Dia inteiro' },
]

export function patrolStateVariant(value) {
  return {
    planned: 'warning',
    in_progress: 'info',
    completed: 'success',
    missed: 'danger',
  }[value] || 'neutral'
}
