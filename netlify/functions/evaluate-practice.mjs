const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6'

const json = (statusCode, obj) => ({
  statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj),
})

async function callAnthropic(prompt, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`)
  const data = await r.json()
  const text = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('').trim()
  return text.replace(/```json|```/g, '').trim()
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' })
  if (!API_KEY) return json(503, { error: 'IA não configurada no servidor.' })

  const { subject, topic, task, userAnswer, language = '', track = '' } = JSON.parse(event.body || '{}')
  const prompt = `Você é um tutor paciente e encorajador, especialista em "${subject}".
Tarefa proposta ao aluno (tema "${topic}"${language ? `, linguagem ${language}` : ''}):
"""${task}"""

Resposta enviada pelo aluno:
"""${userAnswer}"""

Avalie se a resposta cumpre a tarefa. Seja justo${language ? ' e considere se o código funcionaria' : ''}.
Responda APENAS com JSON: {"correct": true/false, "feedback": "feedback curto em pt-BR; se errado, dê uma dica sem entregar a resposta pronta"}`

  try {
    const parsed = JSON.parse(await callAnthropic(prompt, 900))
    return json(200, { correct: Boolean(parsed.correct), feedback: parsed.feedback || '' })
  } catch (err) {
    return json(500, { error: 'Não foi possível avaliar agora.', detail: err.message })
  }
}