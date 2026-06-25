// src/services/validators.js
// Validações de cadastro mais criteriosas (executadas no cliente para UX; a validação
// que REALMENTE protege está nas regras do Firestore + verificação de e-mail + App Check).

// Regex de e-mail mais rigorosa (não aceita domínios sem ponto, espaços, etc.).
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

// Domínios de e-mail temporário/descartável mais comuns (bloqueados no cadastro).
const DISPOSABLE = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
  'guerrillamail.info', 'sharklasers.com', 'yopmail.com', 'getnada.com', 'trashmail.com',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'mintemail.com',
  'throwawaymail.com', 'mohmal.com', 'emailondeck.com', 'tempr.email', 'mailcatch.com',
  'tmpmail.org', 'spam4.me', 'grr.la', 'mailtemp.net', 'inboxbear.com', 'tempmailo.com',
])

// Domínios populares para sugerir correção de digitação (gmial → gmail).
const POPULAR = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br',
  'icloud.com', 'live.com', 'bol.com.br', 'uol.com.br', 'terra.com.br', 'protonmail.com']

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

function suggestDomain(domain) {
  if (!domain || POPULAR.includes(domain)) return null
  let best = null, bestDist = 99
  for (const p of POPULAR) {
    const dist = levenshtein(domain, p)
    if (dist < bestDist) { bestDist = dist; best = p }
  }
  return bestDist > 0 && bestDist <= 2 ? best : null
}

// Verifica um e-mail. Retorna { ok, reason?, suggestion? }.
export function checkEmail(email) {
  const value = (email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(value)) return { ok: false, reason: 'Digite um e-mail válido (ex.: nome@provedor.com).' }
  const domain = value.split('@')[1]
  if (DISPOSABLE.has(domain)) return { ok: false, reason: 'E-mails temporários/descartáveis não são aceitos. Use um e-mail real.' }
  const suggestion = suggestDomain(domain)
  if (suggestion) return { ok: false, reason: `Você quis dizer ${value.split('@')[0]}@${suggestion}?`, suggestion: `${value.split('@')[0]}@${suggestion}` }
  return { ok: true }
}

// Força da senha. Retorna { score 0..4, label, ok, tips }.
export function passwordStrength(pw) {
  const p = pw || ''
  const checks = {
    length: p.length >= 8,
    lower: /[a-z]/.test(p),
    upper: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
    symbol: /[^a-zA-Z0-9]/.test(p),
  }
  let score = 0
  if (checks.length) score++
  if (checks.lower && checks.upper) score++
  if (checks.number) score++
  if (checks.symbol) score++
  if (p.length >= 12 && score >= 3) score = 4

  // senhas muito comuns derrubam a pontuação
  const COMMON = ['12345678', 'senha123', 'password', 'qwerty123', '123456789', 'estuda123']
  if (COMMON.includes(p.toLowerCase())) score = 1

  const labels = ['muito fraca', 'fraca', 'razoável', 'boa', 'forte']
  // Mínimo aceitável: 8+ caracteres com letras e números (score >= 2)
  const ok = checks.length && (checks.lower || checks.upper) && checks.number && score >= 2
  const tips = []
  if (!checks.length) tips.push('use 8+ caracteres')
  if (!(checks.lower && checks.upper)) tips.push('misture maiúsculas e minúsculas')
  if (!checks.number) tips.push('inclua números')
  if (!checks.symbol) tips.push('um símbolo deixa mais forte')
  return { score: Math.max(0, Math.min(4, score)), label: labels[Math.max(0, Math.min(4, score))], ok, tips }
}
