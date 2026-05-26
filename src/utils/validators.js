/**
 * Validadores e máscaras reutilizáveis para formulários PLUSE.
 *
 * Cada validador devolve `true` quando válido ou uma string com a mensagem
 * de erro (formato esperado pelas `q-input :rules`).
 */

// ── Genéricos ────────────────────────────────────────────────────────────
export const required = (msg = 'Campo obrigatório.') => (v) =>
  (v !== null && v !== undefined && String(v).trim() !== '') || msg

export const minLength = (n, msg) => (v) =>
  !v || String(v).length >= n || msg || `Mínimo ${n} caracteres.`

export const maxLength = (n, msg) => (v) =>
  !v || String(v).length <= n || msg || `Máximo ${n} caracteres.`

// ── Telefone Moçambique ──────────────────────────────────────────────────
// 9 dígitos a começar por 8 (mobile), com prefixo +258 opcional.
// Aceita formatos: 841234567, +258841234567, 258841234567, 84 123 4567, 84-123-4567
const MZ_PHONE_RE = /^(?:\+?258)?\s*8[2-7]\d{7}$/
export const mozambicanPhone = (msg = 'Telefone inválido. Ex: 841234567 ou +258841234567.') => (v) => {
  if (!v) return true
  const digits = String(v).replace(/[\s\-()]/g, '')
  return MZ_PHONE_RE.test(digits) || msg
}

export function normalizeMzPhone(v) {
  if (!v) return ''
  const digits = String(v).replace(/\D/g, '')
  if (digits.startsWith('258')) return '+258' + digits.slice(3)
  if (digits.length === 9) return '+258' + digits
  return v
}

// ── BI moçambicano (Bilhete de Identidade) ───────────────────────────────
// Formato oficial: 13 dígitos + 1 letra + 1 dígito (ex: 1234567890123A1)
// Aceitamos formato mais permissivo (10-15 chars alfanuméricos) porque há
// emissões antigas com formato diferente.
const BI_RE = /^[A-Z0-9]{8,16}$/i
export const bilheteIdentidade = (msg = 'Bilhete de Identidade inválido (8-16 caracteres alfanuméricos).') => (v) => {
  if (!v) return true
  return BI_RE.test(String(v).replace(/\s+/g, '')) || msg
}

// ── NUIT (Número Único de Identificação Tributária) ──────────────────────
// 9 dígitos exactos.
const NUIT_RE = /^\d{9}$/
export const nuit = (msg = 'NUIT inválido. Deve ter 9 dígitos.') => (v) => {
  if (!v) return true
  return NUIT_RE.test(String(v).replace(/\s+/g, '')) || msg
}

// ── M-pesa ───────────────────────────────────────────────────────────────
// Conta M-pesa em Moçambique é um número de telemóvel — mesma validação que telefone.
export const mpesa = (msg = 'Conta M-pesa inválida. Use o número de telemóvel.') =>
  mozambicanPhone(msg)

// ── IBAN moçambicano ─────────────────────────────────────────────────────
// MZ59 + 21 dígitos (total 25 chars). Validamos formato sem o checksum.
const IBAN_MZ_RE = /^MZ\d{2}\s*(?:\d\s*){21}$/i
export const ibanMz = (msg = 'IBAN inválido. Formato: MZ59 + 21 dígitos.') => (v) => {
  if (!v) return true
  return IBAN_MZ_RE.test(String(v)) || msg
}

// ── NIB moçambicano ──────────────────────────────────────────────────────
// 21 dígitos exactos (versão sem prefixo MZ).
const NIB_RE = /^\d{21}$/
export const nib = (msg = 'NIB inválido. Deve ter 21 dígitos.') => (v) => {
  if (!v) return true
  return NIB_RE.test(String(v).replace(/\s+/g, '')) || msg
}

// ── INSS ─────────────────────────────────────────────────────────────────
// 8-11 dígitos.
const INSS_RE = /^\d{8,11}$/
export const inss = (msg = 'Número INSS inválido (8 a 11 dígitos).') => (v) => {
  if (!v) return true
  return INSS_RE.test(String(v).replace(/\s+/g, '')) || msg
}

// ── Email ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const email = (msg = 'Email inválido.') => (v) => {
  if (!v) return true
  return EMAIL_RE.test(String(v)) || msg
}

// ── Datas ────────────────────────────────────────────────────────────────
export const dateNotFuture = (msg = 'A data não pode ser no futuro.') => (v) => {
  if (!v) return true
  const d = new Date(v)
  if (isNaN(d.getTime())) return msg
  return d.getTime() <= Date.now() || msg
}

export const dateNotPast = (msg = 'A data não pode ser no passado.') => (v) => {
  if (!v) return true
  const d = new Date(v)
  if (isNaN(d.getTime())) return msg
  // Comparação por dia, não por instante
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d.getTime() >= today.getTime() || msg
}

export const dateAfter = (other, msg = 'Data deve ser posterior à inicial.') => (v) => {
  if (!v || !other) return true
  const a = new Date(other)
  const b = new Date(v)
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return true
  return b.getTime() > a.getTime() || msg
}

// ── Números ──────────────────────────────────────────────────────────────
export const positiveNumber = (msg = 'Tem de ser positivo.') => (v) => {
  if (v === null || v === undefined || v === '') return true
  const n = Number(v)
  return (!isNaN(n) && n > 0) || msg
}

export const decimalAmount = (msg = 'Montante inválido.') => (v) => {
  if (v === null || v === undefined || v === '') return true
  return /^\d+(\.\d{1,2})?$/.test(String(v)) || msg
}

// ── Compor regras ────────────────────────────────────────────────────────
/** Agrega vários validadores numa única lista para `:rules`. */
export const rules = (...validators) => validators
