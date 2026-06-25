// src/services/customCatalog.js
// Catálogo personalizado (matérias e objetivos/trilhas adicionados pelo admin).
// Guardado no Firestore (doc customCatalog/catalog) ou localStorage, e mesclado
// ao catálogo do app na inicialização.
import { db, firebaseEnabled } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { registerCustom } from '../data/tracks'

const LS = 'estudamais:customCatalog'
const empty = { tracks: [], subjects: {} }

export async function loadCustomCatalog() {
  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'customCatalog', 'catalog'))
      if (snap.exists()) return { ...empty, ...snap.data() }
    } catch { /* cai pro local */ }
  }
  try { return { ...empty, ...(JSON.parse(localStorage.getItem(LS) || 'null') || {}) } } catch { return empty }
}

export async function saveCustomCatalog(cat) {
  const data = { tracks: cat.tracks || [], subjects: cat.subjects || {} }
  try { localStorage.setItem(LS, JSON.stringify(data)) } catch { /* */ }
  if (firebaseEnabled) {
    try { await setDoc(doc(db, 'customCatalog', 'catalog'), data) } catch { /* */ }
  }
  registerCustom(data)
  return true
}

// Mescla o catálogo salvo ao app (chamado na inicialização).
export async function applyCustomCatalog() {
  const cat = await loadCustomCatalog()
  registerCustom(cat)
  return cat
}
