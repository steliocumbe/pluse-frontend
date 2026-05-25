/**
 * Ativos e equipamento — listas de opções partilhadas (Fase 4.4).
 */

export const vehicleTypeOptions = [
  { value: 'car', label: 'Carro' },
  { value: 'motorcycle', label: 'Motorizada' },
  { value: 'van', label: 'Carrinha' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'other', label: 'Outro' },
]

export const equipmentTypeOptions = [
  { value: 'radio', label: 'Rádio' },
  { value: 'flashlight', label: 'Lanterna' },
  { value: 'weapon', label: 'Arma' },
  { value: 'uniform', label: 'Fardamento' },
  { value: 'badge', label: 'Identificação / cartão' },
  { value: 'vest', label: 'Colete' },
  { value: 'other', label: 'Outro' },
]

export const availabilityOptions = [
  { value: 'available', label: 'Disponível' },
  { value: 'in_use', label: 'Em uso' },
  { value: 'maintenance', label: 'Em manutenção' },
  { value: 'inactive', label: 'Inactivo' },
]

export function availabilityVariant(value) {
  return {
    available: 'success',
    in_use: 'info',
    maintenance: 'warning',
    inactive: 'neutral',
  }[value] || 'neutral'
}
