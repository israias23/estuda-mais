// server/index.js
// Servidor que protege a chave da API e usa a IA da Anthropic para:
//  - desenvolver a lição (teoria + exemplos + atividades + prática)
//  - avaliar a resposta da atividade prática do usuário.
// A chave fica só aqui — nunca vai para o navegador.

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import webpush from 'web-push'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// --- Rate limiting simples (em memória) para as rotas /api ---
// Protege contra abuso/varredura: limita requisições por IP numa janela de tempo.
const RL_WINDOW_MS = 60 * 1000 // 1 minuto
const RL_MAX = 30 // máx. de requisições por IP por janela
const rlHits = new Map() // ip -> { count, resetAt }

setInterval(() => {
  const now = Date.now()
  for (const [ip, rec] of rlHits) if (rec.resetAt <= now) rlHits.delete(ip)
}, RL_WINDOW_MS).unref?.()

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next()
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  let rec = rlHits.get(ip)
  if (!rec || rec.resetAt <= now) { rec = { count: 0, resetAt: now + RL_WINDOW_MS }; rlHits.set(ip, rec) }
  rec.count++
  if (rec.count > RL_MAX) {
    const retry = Math.ceil((rec.resetAt - now) / 1000)
    res.set('Retry-After', String(retry))
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em instantes.' })
  }
  next()
})

const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6'
const PORT = process.env.PORT || 8787

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(API_KEY) })
})

// Diretriz ética para a trilha de segurança.
function guardrailFor(track) {
  if (track === 'ciberseguranca') {
    return `\nIMPORTANTE (segurança): aborde de forma ÉTICA, DEFENSIVA e conceitual,
voltada a entender, detectar e se proteger. NÃO forneça malware funcional, exploits prontos
ou passo a passo para atacar sistemas reais. Foque em como as ameaças funcionam e na defesa,
no espírito do hacking ético e de CTFs.`
  }
  return ''
}

async function callAnthropic(prompt, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)
  const data = await r.json()
  const text = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('').trim()
  return text.replace(/```json|```/g, '').trim()
}

// Rede de segurança: recupera um JSON que veio cortado, fechando string aberta
// e as estruturas pendentes NA ORDEM CORRETA (usando uma pilha).
function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    let s = text.replace(/```json|```/g, '').trim()
    let inStr = false, esc = false
    const stack = []
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      if (inStr) {
        if (esc) esc = false
        else if (c === '\\') esc = true
        else if (c === '"') inStr = false
        continue
      }
      if (c === '"') inStr = true
      else if (c === '{') stack.push('}')
      else if (c === '[') stack.push(']')
      else if (c === '}' || c === ']') stack.pop()
    }
    if (inStr) s += '"'        // fecha string aberta
    s = s.replace(/,\s*$/, '') // remove vírgula solta no fim
    while (stack.length) s += stack.pop() // fecha na ordem inversa de abertura
    return JSON.parse(s)
  }
}

// Gera a LIÇÃO COMPLETA.
app.post('/api/generate-lesson', async (req, res) => {
  const { subject, topic, focus = '', track = '', level = 'iniciante a intermediário' } = req.body || {}
  if (!API_KEY) return res.status(503).json({ error: 'IA não configurada no servidor.' })

  const isProg = track === 'programacao'
  const practiceSpec = isProg
    ? `"practice": {"type":"code","language":"<linguagem da matéria>","prompt":"tarefa de programação curta e concreta ligada à lição (ex.: escreva um programa que imprime ...)","hint":"dica curta"}`
    : `"practice": {"type":"text","language":"","prompt":"exercício curto para o aluno responder por escrito, aplicando a lição","hint":"dica curta"}`

  const prompt = `Você é um professor brasileiro excelente, didático e claro.
Desenvolva uma AULA COMPLETA e APROFUNDADA sobre "${topic}" da matéria "${subject}".
${focus ? `A aula deve cobrir: ${focus}.` : ''}
Nível: ${level}. Português do Brasil, linguagem acessível, com exemplos concretos.
${guardrailFor(track)}

Responda APENAS com JSON válido (sem markdown, sem texto fora do JSON):
{
  "theory": ["par. 1 bem explicado","par. 2","par. 3","par. 4","par. 5"],
  "keypoints": ["resumo 1","resumo 2","resumo 3"],
  "examples": [{"title":"título do exemplo","body":"exemplo resolvido e comentado passo a passo"}],
  "questions": [{"q":"enunciado","options":["a","b","c","d"],"correct":0,"explain":"por que é a correta"}],
  ${practiceSpec}
}

Regras:
- "theory": 5 a 7 parágrafos REALMENTE explicativos (3-5 frases cada).
- "examples": 2 a 3 exemplos resolvidos (em programação, mostre o código comentado).
- "questions": 4 questões de múltipla escolha, 4 alternativas, "correct" índice 0-3.
- "practice": UMA atividade prática adequada à lição e ao nível.`

  try {
    const parsed = safeParse(await callAnthropic(prompt, 8000))
    if (!Array.isArray(parsed.theory) || !Array.isArray(parsed.questions)) throw new Error('Formato inesperado')
    res.json({
      theory: parsed.theory,
      keypoints: Array.isArray(parsed.keypoints) ? parsed.keypoints : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      questions: parsed.questions,
      practice: parsed.practice || null,
    })
  } catch (err) {
    console.error('Erro ao gerar lição:', err.message)
    res.status(500).json({ error: 'Não foi possível gerar a lição.' })
  }
})

// Avalia a resposta da atividade prática.
app.post('/api/evaluate-practice', async (req, res) => {
  const { subject, topic, task, userAnswer, language = '', track = '' } = req.body || {}
  if (!API_KEY) return res.status(503).json({ error: 'IA não configurada no servidor.' })

  const prompt = `Você é um tutor paciente e encorajador, especialista em "${subject}".
Tarefa proposta ao aluno (tema "${topic}"${language ? `, linguagem ${language}` : ''}):
"""${task}"""

Resposta enviada pelo aluno:
"""${userAnswer}"""
${guardrailFor(track)}

Avalie se a resposta cumpre a tarefa. Seja justo: pequenos detalhes de estilo não reprovam;
o que importa é se atende ao que foi pedido${language ? ' e se o código funcionaria' : ''}.
Responda APENAS com JSON: {"correct": true/false, "feedback": "feedback curto em pt-BR, dizendo o que está certo e o que melhorar; se errado, dê uma dica sem entregar a resposta pronta"}`

  try {
    const parsed = safeParse(await callAnthropic(prompt, 900))
    res.json({ correct: Boolean(parsed.correct), feedback: parsed.feedback || '' })
  } catch (err) {
    console.error('Erro ao avaliar prática:', err.message)
    res.status(500).json({ error: 'Não foi possível avaliar agora.' })
  }
})

// ============================================================================
//  WEB PUSH (lembretes mesmo com o app fechado)
// ============================================================================
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contato@estuda.app'
const REMINDER_HOUR = Number(process.env.REMINDER_HOUR || 19)
const pushEnabled = Boolean(VAPID_PUBLIC && VAPID_PRIVATE)

if (pushEnabled) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

// Armazenamento simples das inscrições em arquivo (serve para 1 instância do servidor).
const SUBS_FILE = path.join(__dirname, 'subscriptions.json')
let subs = []
try { subs = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')) } catch { subs = [] }
function saveSubs() { try { fs.writeFileSync(SUBS_FILE, JSON.stringify(subs)) } catch (e) { console.warn('Falha ao salvar inscrições:', e.message) } }

// Envia uma notificação; remove a inscrição se ela expirou (404/410).
async function sendPush(sub, payload) {
  try {
    await webpush.sendNotification(sub.subscription, JSON.stringify(payload))
    return true
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      subs = subs.filter((s) => s.endpoint !== sub.endpoint)
      saveSubs()
    }
    return false
  }
}

async function broadcast(payload) {
  if (!pushEnabled) return { sent: 0 }
  let sent = 0
  for (const s of [...subs]) if (await sendPush(s, payload)) sent++
  return { sent }
}

// A chave pública (o front precisa dela para se inscrever).
app.get('/api/push/key', (_req, res) => res.json({ publicKey: VAPID_PUBLIC, enabled: pushEnabled }))

// Registra/atualiza a inscrição de um dispositivo.
app.post('/api/push/subscribe', (req, res) => {
  const { uid, subscription } = req.body || {}
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Inscrição inválida.' })
  const endpoint = subscription.endpoint
  subs = subs.filter((s) => s.endpoint !== endpoint)
  subs.push({ uid: uid || 'anon', endpoint, subscription, createdAt: Date.now() })
  saveSubs()
  res.json({ ok: true })
})

// Remove a inscrição (ao desativar lembretes).
app.post('/api/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body || {}
  if (endpoint) { subs = subs.filter((s) => s.endpoint !== endpoint); saveSubs() }
  res.json({ ok: true })
})

// Dispara uma notificação de teste para o dispositivo do usuário.
app.post('/api/push/test', async (req, res) => {
  const { uid, endpoint } = req.body || {}
  const targets = subs.filter((s) => (endpoint && s.endpoint === endpoint) || (uid && s.uid === uid))
  if (targets.length === 0) return res.status(404).json({ error: 'Nenhuma inscrição encontrada.' })
  let sent = 0
  for (const s of targets) if (await sendPush(s, { title: 'Estuda+ 🎓', body: 'Tudo certo! Você vai receber os lembretes por aqui.', url: '/app' })) sent++
  res.json({ ok: true, sent })
})

// Envio manual para todos (uso administrativo). Protegido por token opcional.
app.post('/api/push/broadcast', async (req, res) => {
  const token = process.env.PUSH_ADMIN_TOKEN
  if (token && req.headers['x-push-token'] !== token) return res.status(401).json({ error: 'Não autorizado.' })
  const { title, body, url } = req.body || {}
  const result = await broadcast({ title: title || 'Estuda+', body: body || 'Hora de estudar!', url: url || '/app' })
  res.json({ ok: true, ...result })
})

// Lembrete diário automático: às REMINDER_HOUR, envia uma vez por dia.
let lastReminderDay = null
function reminderTick() {
  if (!pushEnabled) return
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (now.getHours() === REMINDER_HOUR && lastReminderDay !== today) {
    lastReminderDay = today
    broadcast({
      title: 'Não perca sua ofensiva! 🔥',
      body: 'Faça uma lição rapidinha hoje e mantenha sua sequência viva.',
      url: '/app',
    }).then((r) => console.log(`  [push] lembrete diário enviado para ${r.sent} dispositivo(s)`))
  }
}
setInterval(reminderTick, 15 * 60 * 1000) // checa a cada 15 min

app.listen(PORT, () => {
  console.log(`\n  Estuda+ servidor de IA rodando em http://localhost:${PORT}`)
  console.log(`  IA configurada: ${API_KEY ? 'sim ✅' : 'não ❌ (preencha ANTHROPIC_API_KEY no server/.env)'}`)
  console.log(`  Web Push: ${pushEnabled ? `ativo ✅ (lembrete diário às ${REMINDER_HOUR}h)` : 'inativo ❌ (preencha as chaves VAPID no server/.env)'}\n`)
})
