/**
 * Formação e certificações — listas de opções partilhadas (Fase 3.4).
 * Espelham as choices de `training/models.py`.
 */

export const trainingKindOptions = [
  { value: 'induction', label: 'Indução' },
  { value: 'initial', label: 'Formação inicial' },
  { value: 'refresher', label: 'Reciclagem' },
  { value: 'specialty', label: 'Especialização' },
  { value: 'other', label: 'Outra' },
]

export const certificationTypeOptions = [
  { value: 'weapon_license', label: 'Credencial de uso e porte de arma' },
  { value: 'first_aid', label: 'Primeiros socorros' },
  { value: 'medical_aptitude', label: 'Aptidão médica' },
  { value: 'security_license', label: 'Credencial de vigilante' },
  { value: 'driving_license', label: 'Carta de condução' },
  { value: 'other', label: 'Outra' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const trainingKindLabel = (v) => labelFrom(trainingKindOptions, v)
export const certificationTypeLabel = (v) => labelFrom(certificationTypeOptions, v)
