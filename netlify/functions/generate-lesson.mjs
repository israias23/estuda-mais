const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6'

const json = (statusCode, obj) => ({
  statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj),
})

function guardrailFor(track) {
  if (track === 'ciberseguranca') {
    return `\nIMPORTANTE (segurança): aborde de forma ÉTICA, DEFENSIVA e conceitual,
voltada a entender, detectar e se proteger. NÃO forneça malware funcional, exploits prontos
ou passo a passo para atacar sistemas reais.`
  }
  return ''
}

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

function safeParse(text) {
  try { return JSON.parse(text) } catch {
    let s = text.replace(/```json|```/g, '').trim()
    let inStr = false, esc = false
    const stack = []
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue }
      if (c === '"') inStr = true
      else if (c === '{') stack.push('}')
      else if (c === '[') stack.push(']')
      else if (c === '}' || c === ']') stack.pop()
    }
    if (inStr) s += '"'
    s = s.replace(/,\s*$/, '')
    while (stack.length) s += stack.pop()
    return JSON.parse(s)
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' })
  if (!API_KEY) return json(503, { error: 'IA não configurada no servidor.' })

  const { subject, topic, focus = '', track = '' } = JSON.parse(event.body || '{}')
  const isProg = track === 'programacao'
  const practiceSpec = isProg
    ? `"practice": {"type":"code","language":"<linguagem da matéria>","prompt":"tarefa de programação curta e concreta ligada à lição","hint":"dica curta"}`
    : `"practice": {"type":"text","language":"","prompt":"exercício curto para o aluno responder por escrito","hint":"dica curta"}`

  const prompt = `Você é um professor brasileiro excelente, didático e claro.
Desenvolva uma AULA COMPLETA e APROFUNDADA sobre "${topic}" da matéria "${subject}".
${focus ? `A aula deve cobrir: ${focus}.` : ''}
Português do Brasil, linguagem acessível, com exemplos concretos.
${guardrailFor(track)}

Responda APENAS com JSON válido (sem markdown):
{
  "theory": ["par. 1","par. 2","par. 3","par. 4","par. 5"],
  "keypoints": ["resumo 1","resumo 2","resumo 3"],
  "examples": [{"title":"título","body":"exemplo resolvido e comentado"}],
  "questions": [{"q":"enunciado","options":["a","b","c","d"],"correct":0,"explain":"por que é a correta"}],
  ${practiceSpec}
}

Regras: "theory" com 5 a 7 parágrafos explicativos; "examples" 2 a 3; "questions" 4 questões de 4 alternativas (correct índice 0-3); "practice" uma atividade.`

  try {
    const parsed = safeParse(await callAnthropic(prompt, 6000))
    if (!Array.isArray(parsed.theory) || !Array.isArray(parsed.questions)) throw new Error('Formato inesperado')
    return json(200, {
      theory: parsed.theory,
      keypoints: Array.isArray(parsed.keypoints) ? parsed.keypoints : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      questions: parsed.questions,
      practice: parsed.practice || null,
    })
  } catch (err) {
    return json(500, { error: 'Não foi possível gerar a lição.', detail: err.message })
  }
}