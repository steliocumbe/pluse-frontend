/**
 * Employment / Gestão Contratual — shared option lists for the frontend.
 *
 * Mirrors the TextChoices on `employment/models.py`. The API already returns
 * `*_display` strings for reads; these lists feed the q-select inputs on the
 * create/edit forms. Keep in sync with the backend enums.
 */

export const contractTypeOptions = [
  { value: 'probation', label: 'Período probatório' },
  { value: 'fixed_term', label: 'Contrato a prazo certo' },
  { value: 'indefinite', label: 'Contrato por tempo indeterminado' },
  { value: 'part_time', label: 'Contrato a tempo parcial' },
]

/** Contract types that legally require an explicit end date. */
export const termedContractTypes = ['probation', 'fixed_term', 'part_time']

export const terminationReasonOptions = [
  { value: 'resignation', label: 'Rescisão pelo trabalhador' },
  { value: 'dismissal_with_cause', label: 'Despedimento com justa causa' },
  { value: 'dismissal_without_cause', label: 'Despedimento sem justa causa' },
  { value: 'mutual_agreement', label: 'Rescisão por mútuo acordo' },
  { value: 'contract_end', label: 'Caducidade / fim do prazo' },
  { value: 'retirement', label: 'Reforma' },
  { value: 'death', label: 'Falecimento' },
  { value: 'abandonment', label: 'Abandono do posto' },
]

export const disciplinaryTypeOptions = [
  { value: 'verbal_warning', label: 'Advertência verbal' },
  { value: 'written_warning', label: 'Advertência escrita' },
  { value: 'suspension', label: 'Suspensão' },
  { value: 'disciplinary_process', label: 'Processo disciplinar' },
]

export const disciplinaryOutcomeOptions = [
  { value: 'open', label: 'Em curso' },
  { value: 'dismissed', label: 'Arquivado / sem sanção' },
  { value: 'sanctioned', label: 'Sanção aplicada' },
  { value: 'escalated', label: 'Encaminhado para despedimento' },
]

export const departmentOptions = [
  { value: 'administrative', label: 'Administrativo' },
  { value: 'operative', label: 'Operativo' },
  { value: 'technical', label: 'Técnico' },
]

export const supportUnitOptions = [
  { value: 'direction', label: 'Direção' },
  { value: 'administration', label: 'Administração' },
  { value: 'finance', label: 'Finanças' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'supervision', label: 'Supervisão' },
]

function labelFrom(list, value) {
  return list.find((o) => o.value === value)?.label || value || '—'
}

export const contractTypeLabel = (v) => labelFrom(contractTypeOptions, v)
export const terminationReasonLabel = (v) => labelFrom(terminationReasonOptions, v)
export const disciplinaryTypeLabel = (v) => labelFrom(disciplinaryTypeOptions, v)
export const disciplinaryOutcomeLabel = (v) => labelFrom(disciplinaryOutcomeOptions, v)
