/**
 * Employee document types — single source of truth for the frontend.
 *
 * Mirrors `EmployeeDocument.DocumentType` on the backend. Grouped by category
 * so selects can show optgroups and the detail page can lay documents out
 * by section. `expirable: true` flags types that carry a validity date and
 * should be highlighted when expiring.
 *
 * Keep in sync with employees/models.py → EmployeeDocument.DocumentType.
 */
export const documentCategories = [
  {
    key: 'identification',
    label: 'Identificação',
    icon: 'ki-profile-circle',
    types: [
      { value: 'id_card', label: 'Bilhete de Identidade', expirable: true },
      { value: 'passport', label: 'Passaporte', expirable: true },
      { value: 'dire', label: 'DIRE', expirable: true },
      { value: 'nuit_card', label: 'Cartão / documento NUIT', expirable: false },
    ],
  },
  {
    key: 'admission',
    label: 'Formulário de admissão',
    icon: 'ki-document',
    types: [
      { value: 'individual_form', label: 'Formulário individual assinado', expirable: false },
    ],
  },
  {
    key: 'legal',
    label: 'Regularização legal',
    icon: 'ki-shield-tick',
    types: [
      { value: 'military_status', label: 'Situação militar', expirable: false },
      { value: 'residence_certificate', label: 'Atestado de residência', expirable: true },
      { value: 'police_clearance', label: 'Regularização policial', expirable: true },
      { value: 'criminal_record', label: 'Registo criminal', expirable: true },
      { value: 'physical_aptitude', label: 'Certidão de aptidão física', expirable: true },
      { value: 'medical_exam', label: 'Exames médicos', expirable: true },
      { value: 'weapon_license', label: 'Credencial de uso e porte de arma', expirable: true },
    ],
  },
  {
    key: 'contractual',
    label: 'Documentos contratuais',
    icon: 'ki-document',
    types: [
      { value: 'employment_contract', label: 'Contrato / acordo de trabalho assinado', expirable: true },
      { value: 'task_description', label: 'Descrição de tarefas assinada', expirable: false },
      { value: 'commitment_term', label: 'Termo de compromisso assinado', expirable: false },
      { value: 'responsibility_term', label: 'Termo de responsabilidade assinado', expirable: false },
      { value: 'induction_form', label: 'Formulário de indução assinado', expirable: false },
      { value: 'participation_form', label: 'Formulário de participações assinado', expirable: false },
    ],
  },
  {
    key: 'banking',
    label: 'Bancário',
    icon: 'ki-bank',
    types: [
      { value: 'bank_proof', label: 'Comprovativo bancário / NIB', expirable: false },
    ],
  },
  {
    key: 'disciplinary',
    label: 'Gestão disciplinar e desempenho',
    icon: 'ki-warning-2',
    types: [
      { value: 'disciplinary_process', label: 'Processo disciplinar', expirable: false },
      { value: 'warning_notice', label: 'Chamada de atenção registada', expirable: false },
      { value: 'performance_review', label: 'Avaliação de desempenho', expirable: false },
    ],
  },
  {
    key: 'training',
    label: 'Formação',
    icon: 'ki-information-2',
    types: [
      { value: 'training_certificate', label: 'Certificado de formação', expirable: true },
    ],
  },
  {
    key: 'exit',
    label: 'Saída',
    icon: 'ki-arrow-right',
    types: [
      { value: 'exit_form', label: 'Formulário de saída', expirable: false },
    ],
  },
  {
    key: 'other',
    label: 'Outros',
    icon: 'ki-document',
    types: [
      { value: 'other', label: 'Outro documento', expirable: false },
    ],
  },
]

/** Flat list of all 24 types — handy for plain selects. */
export const documentTypes = documentCategories.flatMap((c) => c.types)

export const requiredDocumentTypeValues = [
  'id_card',
  'nuit_card',
  'bank_proof',
  'employment_contract',
]

export const requiredDocumentTypes = requiredDocumentTypeValues.map((value) => {
  const type = documentTypes.find((t) => t.value === value)
  return {
    ...type,
    label: {
      id_card: 'BI',
      nuit_card: 'NUIT',
      bank_proof: 'NIB Bancário',
      employment_contract: 'Contrato Assinado',
    }[value] || type.label,
  }
})

/** value → { label, expirable, categoryKey, categoryLabel }. */
export const documentTypeMap = Object.fromEntries(
  documentCategories.flatMap((c) =>
    c.types.map((t) => [
      t.value,
      { ...t, categoryKey: c.key, categoryLabel: c.label, categoryIcon: c.icon },
    ]),
  ),
)

/** Quasar q-select options with category optgroups (`group` field). */
export const documentTypeSelectOptions = documentCategories.flatMap((c) =>
  c.types.map((t) => ({ label: t.label, value: t.value, group: c.label })),
)

/** True when this type expects a validity date. */
export function isExpirableType(value) {
  return !!documentTypeMap[value]?.expirable
}

/** Human label for a type value (falls back to the raw value). */
export function documentTypeLabel(value) {
  return documentTypeMap[value]?.label || value
}
