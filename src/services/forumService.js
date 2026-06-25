// src/services/forumService.js
// Fórum global da comunidade, organizado por trilha e matéria.
// Usa Firestore quando disponível (perguntas e respostas compartilhadas entre todos),
// senão um modo local (localStorage) com perguntas de exemplo para testar.

import { db, firebaseEnabled } from '../firebase/config'
import {
  collection, addDoc, getDocs, getDoc, doc, query, where,
  orderBy, limit, updateDoc, increment, serverTimestamp, deleteDoc,
} from 'firebase/firestore'

const LS_THREADS = 'estudamais:forum:threads'
const LS_REPLIES = 'estudamais:forum:replies'

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* cota */ }
}
const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => Date.now()

// Perguntas de exemplo para o modo local não ficar vazio.
function seed() {
  const existing = readLS(LS_THREADS, null)
  if (existing) return
  const t = (over) => ({
    id: uid(), votes: 0, replyCount: 0, solved: false, authorUid: 'seed', ...over,
  })
  const seedThreads = [
    t({ title: 'Como não esquecer a fórmula de Bhaskara na hora da prova?', body: 'Sempre travo na hora de lembrar. Alguma técnica de memorização que funciona pra vocês?', authorName: 'Marina Souza', track: 'enem', subjectId: 'matematica', createdAt: now() - 1000 * 60 * 60 * 5, replyCount: 3, votes: 7 }),
    t({ title: 'Diferença entre list e tuple no Python', body: 'Quando devo usar cada uma? Vi que tuple é imutável mas não entendi a vantagem prática.', authorName: 'Diego Alves', track: 'programacao', subjectId: 'python', createdAt: now() - 1000 * 60 * 60 * 26, replyCount: 2, votes: 5 }),
    t({ title: 'Dicas para a competência 5 da redação (proposta de intervenção)', body: 'Sempre perco pontos aqui. Como deixar agente, ação, meio e finalidade bem claros?', authorName: 'Ana Beatriz', track: 'enem', subjectId: 'redacao', createdAt: now() - 1000 * 60 * 60 * 50, replyCount: 4, votes: 12, solved: true }),
    t({ title: 'O que estudar primeiro em cibersegurança?', body: 'Comecei agora. Vale focar em redes antes de pentest?', authorName: 'Lucas Pereira', track: 'ciberseguranca', subjectId: 'cyber-fundamentos', createdAt: now() - 1000 * 60 * 60 * 8, replyCount: 1, votes: 3 }),
    t({ title: 'Comandos básicos de Linux que todo iniciante deveria saber', body: 'Montei uma lista, mas queria a opinião de vocês sobre o que é essencial no começo.', authorName: 'Camila Rocha', track: 'sistemas', subjectId: 'linux', createdAt: now() - 1000 * 60 * 60 * 72, replyCount: 2, votes: 9 }),
  ]
  writeLS(LS_THREADS, seedThreads)
  const r = (over) => ({ id: uid(), votes: 0, accepted: false, authorUid: 'seed', ...over })
  const replies = [
    r({ threadId: seedThreads[0].id, authorName: 'Prof. Helena', body: 'Pratique deduzindo a fórmula a partir de completar o quadrado — quando você entende de onde vem, não precisa decorar.', createdAt: now() - 1000 * 60 * 60 * 4, votes: 4 }),
    r({ threadId: seedThreads[2].id, authorName: 'Rafael Lima', body: 'O que me ajudou: sempre fechar com "Cabe ao [agente] + [ação] + por meio de [meio], a fim de [finalidade]". Vira uma receita.', createdAt: now() - 1000 * 60 * 60 * 48, votes: 8, accepted: true }),
  ]
  writeLS(LS_REPLIES, replies)
}

// ---------- Listagem de tópicos ----------
export async function listThreads({ track = null, subjectId = null, sort = 'recent' } = {}) {
  if (firebaseEnabled) {
    try {
      const col = collection(db, 'forumThreads')
      let q = query(col, orderBy('createdAt', 'desc'), limit(100))
      const snap = await getDocs(q)
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toMs(d.data().createdAt) }))
      rows = filterSort(rows, { track, subjectId, sort })
      return rows
    } catch (e) {
      console.warn('[Estuda+] Fórum (firestore) falhou, usando local:', e.message)
    }
  }
  seed()
  const rows = readLS(LS_THREADS, [])
  return filterSort(rows, { track, subjectId, sort })
}

function filterSort(rows, { track, subjectId, sort }) {
  let r = rows
  if (track) r = r.filter((x) => x.track === track)
  if (subjectId) r = r.filter((x) => x.subjectId === subjectId)
  if (sort === 'top') r = [...r].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  else if (sort === 'unanswered') r = r.filter((x) => (x.replyCount || 0) === 0)
  else r = [...r].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  return r
}

function toMs(v) {
  if (!v) return now()
  if (typeof v === 'number') return v
  if (typeof v?.toMillis === 'function') return v.toMillis()
  return now()
}

// ---------- Tópico + respostas ----------
export async function getThread(id) {
  if (firebaseEnabled) {
    try {
      const tSnap = await getDoc(doc(db, 'forumThreads', id))
      if (!tSnap.exists()) return null
      const thread = { id: tSnap.id, ...tSnap.data(), createdAt: toMs(tSnap.data().createdAt) }
      const rSnap = await getDocs(query(collection(db, 'forumReplies'), where('threadId', '==', id)))
      const replies = rSnap.docs
        .map((d) => ({ id: d.id, ...d.data(), createdAt: toMs(d.data().createdAt) }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      return { thread, replies }
    } catch (e) {
      console.warn('[Estuda+] getThread firestore falhou:', e.message)
    }
  }
  seed()
  const thread = readLS(LS_THREADS, []).find((t) => t.id === id) || null
  if (!thread) return null
  const replies = readLS(LS_REPLIES, [])
    .filter((r) => r.threadId === id)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  return { thread, replies }
}

// ---------- Criar pergunta ----------
export async function createThread({ title, body, track, subjectId, author }) {
  const base = {
    title: title.trim(),
    body: body.trim(),
    track: track || null,
    subjectId: subjectId || null,
    authorName: author?.name || 'Estudante',
    authorUid: author?.uid || 'anon',
    votes: 0,
    replyCount: 0,
    solved: false,
  }
  if (firebaseEnabled) {
    try {
      const ref = await addDoc(collection(db, 'forumThreads'), { ...base, createdAt: serverTimestamp() })
      return { id: ref.id, ...base, createdAt: now() }
    } catch (e) {
      console.warn('[Estuda+] createThread firestore falhou:', e.message)
    }
  }
  seed()
  const thread = { id: uid(), ...base, createdAt: now() }
  const list = readLS(LS_THREADS, [])
  writeLS(LS_THREADS, [thread, ...list])
  return thread
}

// ---------- Responder ----------
export async function addReply(threadId, { body, author }) {
  const base = {
    threadId,
    body: body.trim(),
    authorName: author?.name || 'Estudante',
    authorUid: author?.uid || 'anon',
    votes: 0,
    accepted: false,
  }
  if (firebaseEnabled) {
    try {
      const ref = await addDoc(collection(db, 'forumReplies'), { ...base, createdAt: serverTimestamp() })
      await updateDoc(doc(db, 'forumThreads', threadId), { replyCount: increment(1) }).catch(() => {})
      return { id: ref.id, ...base, createdAt: now() }
    } catch (e) {
      console.warn('[Estuda+] addReply firestore falhou:', e.message)
    }
  }
  seed()
  const reply = { id: uid(), ...base, createdAt: now() }
  const replies = readLS(LS_REPLIES, [])
  writeLS(LS_REPLIES, [...replies, reply])
  const threads = readLS(LS_THREADS, []).map((t) =>
    t.id === threadId ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t
  )
  writeLS(LS_THREADS, threads)
  return reply
}

// ---------- Voto simples (otimista, melhor esforço) ----------
export async function voteThread(threadId, delta = 1) {
  if (firebaseEnabled) {
    try { await updateDoc(doc(db, 'forumThreads', threadId), { votes: increment(delta) }); return } catch { /* */ }
  }
  const threads = readLS(LS_THREADS, []).map((t) =>
    t.id === threadId ? { ...t, votes: (t.votes || 0) + delta } : t
  )
  writeLS(LS_THREADS, threads)
}

// Voto em uma resposta.
export async function voteReply(replyId, delta = 1) {
  if (firebaseEnabled) {
    try { await updateDoc(doc(db, 'forumReplies', replyId), { votes: increment(delta) }); return } catch { /* */ }
  }
  const replies = readLS(LS_REPLIES, []).map((r) =>
    r.id === replyId ? { ...r, votes: (r.votes || 0) + delta } : r
  )
  writeLS(LS_REPLIES, replies)
}

// Marca/desmarca uma resposta como aceita (só o autor da pergunta deve chamar).
// Marca apenas UMA resposta como aceita e o tópico como resolvido.
export async function acceptReply(threadId, replyId, accept = true) {
  if (firebaseEnabled) {
    try {
      const rSnap = await getDocs(query(collection(db, 'forumReplies'), where('threadId', '==', threadId)))
      await Promise.all(rSnap.docs.map((d) =>
        updateDoc(doc(db, 'forumReplies', d.id), { accepted: accept && d.id === replyId })
      ))
      await updateDoc(doc(db, 'forumThreads', threadId), { solved: accept })
      return
    } catch (e) { console.warn('[Estuda+] acceptReply firestore falhou:', e.message) }
  }
  const replies = readLS(LS_REPLIES, []).map((r) =>
    r.threadId === threadId ? { ...r, accepted: accept && r.id === replyId } : r
  )
  writeLS(LS_REPLIES, replies)
  const threads = readLS(LS_THREADS, []).map((t) => (t.id === threadId ? { ...t, solved: accept } : t))
  writeLS(LS_THREADS, threads)
}

// Remoção administrativa de um tópico (e suas respostas) — usada no painel.
export async function deleteThreadAdmin(threadId) {
  if (firebaseEnabled) {
    try {
      const rSnap = await getDocs(query(collection(db, 'forumReplies'), where('threadId', '==', threadId)))
      await Promise.all(rSnap.docs.map((d) => deleteDoc(doc(db, 'forumReplies', d.id))))
      await deleteDoc(doc(db, 'forumThreads', threadId))
      return true
    } catch (e) { console.warn('[Estuda+] deleteThreadAdmin falhou:', e.message); return false }
  }
  writeLS(LS_THREADS, readLS(LS_THREADS, []).filter((t) => t.id !== threadId))
  writeLS(LS_REPLIES, readLS(LS_REPLIES, []).filter((r) => r.threadId !== threadId))
  return true
}
