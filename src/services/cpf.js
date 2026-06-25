// src/services/cpf.js
// Validação e formatação de CPF (dígitos verificadores).

export function onlyDigits(v) {
  return (v || '').replace(/\D/g, '')
}

export function formatCPF(v) {
  const d = onlyDigits(v).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function isValidCPF(value) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // todos iguais

  const calc = (len) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cpf[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === parseInt(cpf[9]) && calc(10) === parseInt(cpf[10])
}
