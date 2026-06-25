// src/data/tracks.js
// Catálogo central: as trilhas e todas as matérias.
// Cada matéria declara em quais trilhas aparece (campo "tracks").
// As lições podem ter conteúdo fixo (theory/questions) OU apenas título+foco,
// caso em que a IA desenvolve o conteúdo na hora (com cache).

import { informatica } from './content/informatica'
import { portugues } from './content/portugues'
import { basicasSubjects } from './content/basicas'
import { enemSubjects } from './content/enem'
import { programacaoSubjects } from './content/programacao'
import { cibersegurancaSubjects } from './content/ciberseguranca'
import { sistemasSubjects } from './content/sistemas'

// Registro único de TODAS as matérias (id -> objeto da matéria).
const registry = {
  // com conteúdo fixo de fallback
  [informatica.id]: informatica,
  [portugues.id]: portugues,
  // currículos (conteúdo desenvolvido pela IA)
  ...basicasSubjects,
  ...enemSubjects,
  ...programacaoSubjects,
  ...cibersegurancaSubjects,
  ...sistemasSubjects,
}

export function getSubject(id) {
  return registry[id] || null
}

// Registra trilhas/matérias adicionadas pelo admin (mescla no catálogo em tempo de execução).
// Chamado na inicialização do app, antes da renderização.
export function registerCustom({ tracks = [], subjects = {} } = {}) {
  for (const t of tracks) {
    if (!t?.id || TRACKS.find((x) => x.id === t.id)) continue
    TRACKS.push({ id: t.id, title: t.title || t.id, tagline: t.tagline || '', icon: '', custom: true })
  }
  for (const [id, s] of Object.entries(subjects)) {
    if (!s) continue
    registry[id] = {
      id,
      title: s.title || id,
      description: s.description || '',
      color: s.color || 'violet',
      tracks: Array.isArray(s.tracks) ? s.tracks : (s.tracks ? [s.tracks] : []),
      lessons: Array.isArray(s.lessons) ? s.lessons : [],
      custom: true,
    }
  }
}

// Lista as matérias de uma trilha (ou todas, se track for nulo).
export function listSubjects(track) {
  return Object.values(registry)
    .filter((s) => !track || (s.tracks || []).includes(track))
    .map((s) => ({
      id: s.id,
      title: s.title,
      icon: s.icon,
      color: s.color,
      lessons: s.lessons.length,
      ready: s.lessons.length > 0,
      tracks: s.tracks,
    }))
}

export const TRACKS = [
  { id: 'enem', title: 'ENEM', tagline: 'Todas as matérias do ensino médio + línguas.', icon: '🎓' },
  { id: 'concurso', title: 'Concurso Público', tagline: 'Básicas do edital: Português, Matemática, Informática, Redação e Conhecimentos Gerais.', icon: '🏛️' },
  { id: 'programacao', title: 'Programação', tagline: 'Aprenda linguagens: Python, JavaScript, Java, C e SQL.', icon: '💾' },
  { id: 'ciberseguranca', title: 'CyberSegurança', tagline: 'Hacking ético, redes, ferramentas, defesa e CTFs.', icon: '🛡️' },
  { id: 'sistemas', title: 'Sistemas Operacionais', tagline: 'Torne-se profissional em Linux e Windows.', icon: '🖥️' },
]


export function getTrack(id) {
  return TRACKS.find((t) => t.id === id) || null
}
