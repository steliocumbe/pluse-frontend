export const clientDocumentTypes = [
  { value: 'nuit', label: 'NUIT' },
  { value: 'business_license', label: 'Alvará' },
  { value: 'representative_id', label: 'BI do representante' },
  { value: 'certificate', label: 'Certidão' },
]

export const clientDocumentTypeValues = clientDocumentTypes.map((item) => item.value)

export function clientDocumentTypeLabel(value) {
  return clientDocumentTypes.find((item) => item.value === value)?.label || value || 'Documento'
}
