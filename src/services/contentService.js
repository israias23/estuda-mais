// src/services/contentService.js
// Armazena e recupera o CONTEÚDO das lições de forma compartilhada.
// Ordem: cache local (rápido) -> Firestore (compartilhado entre usuários) -> gerar com IA.
// Quando a IA gera, salva no Firestore (todos aproveitam) e no cache local.
// Também guarda o FEEDBACK dos usuários sobre cada lição.

import { db, firebaseEnabled } from '../firebase/config'
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore'
import { generateLessonAI } from './aiService'

const docId = (subjectId, lessonId) => `${subjectId}__${lessonId}`
const localKey = (subjectId, lessonId) => `estudamais:lesson:${docId(subjectId, lessonId)}`

function readLocal(subjectId, lessonId) {
  try {
    const raw = localStorage.getItem(localKey(subjectId, lessonId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function writeLocal(subjectId, lessonId, content) {
  try {
    localStorage.setItem(localKey(subjectId, lessonId), JSON.stringify(content))
  } catch {
    /* cota cheia */
  }
}

// Retorna { source: 'cache'|'firestore'|'ia'|'offline', content }
export async function getLesson({ subjectId, lessonId, subject, topic, focus, track }) {
  // 1) cache local (sem rede, sem custo)
  const local = readLocal(subjectId, lessonId)
  if (local) return { source: 'cache', content: local }

  // 2) Firestore (gerado por OUTRO usuário antes — compartilhado, sem custo de IA)
  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'lessons', docId(subjectId, lessonId)))
      if (snap.exists()) {
        const content = snap.data()
        writeLocal(subjectId, lessonId, content)
        return { source: 'firestore', content }
      }
    } catch (e) {
      console.warn('[Estuda+] Falha ao ler Firestore:', e.message)
    }
  }

  // 3) gerar com IA (primeira vez na vida desta lição)
  const generated = await generateLessonAI({ subject, topic, focus, track })
  if (!generated) return { source: 'offline', content: null }

  writeLocal(subjectId, lessonId, generated)
  if (firebaseEnabled) {
    try {
      await setDoc(doc(db, 'lessons', docId(subjectId, lessonId)), {
        ...generated,
        subjectId,
        lessonId,
        createdAt: Date.now(),
      })
    } catch (e) {
      console.warn('[Estuda+] Falha ao salvar no Firestore:', e.message)
    }
  }
  return { source: 'ia', content: generated }
}

// Para "esquentar o cache": garante que a lição esteja no Firestore.
// Ordem econômica: se já está no Firestore, não faz nada; se está só no
// navegador, envia ao Firestore SEM gastar IA; senão, gera com a IA e salva.
export async function warmLesson(task) {
  const { subjectId, lessonId } = task

  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'lessons', docId(subjectId, lessonId)))
      if (snap.exists()) return 'ja-no-firestore'
    } catch (e) {
      console.warn('[Estuda+] leitura Firestore falhou:', e.message)
    }
  }

  let content = readLocal(subjectId, lessonId)
  const veioDoLocal = Boolean(content)

  if (!content) {
    content = await generateLessonAI(task)
    if (!content) return 'falhou'
    writeLocal(subjectId, lessonId, content)
  }

  if (firebaseEnabled) {
    try {
      await setDoc(doc(db, 'lessons', docId(subjectId, lessonId)), {
        ...content, subjectId, lessonId, createdAt: Date.now(),
      })
    } catch (e) {
      console.warn('[Estuda+] escrita Firestore falhou:', e.message)
      return 'falhou'
    }
  }
  return veioDoLocal ? 'enviada-do-local' : 'gerada'
}

// Registra o feedback do usuário sobre uma lição.
export async function saveFeedback({ subjectId, lessonId, lessonTitle, relevant, comment, uid }) {
  const entry = {
    subjectId,
    lessonId,
    lessonTitle: lessonTitle || '',
    relevant: Boolean(relevant),
    comment: comment || '',
    uid: uid || 'anon',
    createdAt: Date.now(),
  }
  if (firebaseEnabled) {
    await addDoc(collection(db, 'feedback'), entry)
    return
  }
  // modo local: acumula numa lista no navegador
  try {
    const arr = JSON.parse(localStorage.getItem('estudamais:feedback') || '[]')
    arr.push(entry)
    localStorage.setItem('estudamais:feedback', JSON.stringify(arr))
  } catch {
    /* ignora */
  }
}
