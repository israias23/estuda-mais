// src/components/icons/SubjectGlyph.jsx
// Identidade visual de cada matéria e trilha: um glifo SVG próprio + cor da marca.
// Substitui todos os emojis por logos vetoriais consistentes.
// Uso: <SubjectGlyph id="python" tile size={48} />  ou  <SubjectGlyph id="enem" type="track" />

// ---- Cores da marca por conteúdo (tom sólido; o tile usa uma versão suave) ----
const COLORS = {
  // Programação
  python: '#2F74C0', javascript: '#E0A82E', typescript: '#2D79C7', java: '#E2603C',
  csharp: '#7A4FD0', cpp: '#5C6BC0', c: '#4F86C6', go: '#22B5D6', rust: '#D9772E',
  php: '#6E74B8', ruby: '#D43F4B', sql: '#3C8DFF', html: '#E8643C', css: '#2F74C0',
  kotlin: '#A14ED0', swift: '#F0773B', 'logica-ed': '#13C09A', git: '#E8643C',
  // ENEM
  portugues: '#5B3FE6', matematica: '#FF6A45', redacao: '#7B63F0', biologia: '#13C09A',
  fisica: '#5B3FE6', quimica: '#FF6A45', historia: '#F6B53D', geografia: '#13C09A',
  filosofia: '#7B63F0', sociologia: '#FF6A45', ingles: '#3C8DFF', espanhol: '#F6B53D',
  // Concurso
  informatica: '#5B3FE6', conhecimentos: '#13C09A',
  // Cyber
  'cyber-fundamentos': '#5B3FE6', 'cyber-redes': '#3C8DFF', 'cyber-ferramentas': '#FF6A45',
  'cyber-cripto': '#13C09A', 'cyber-python': '#2F74C0', 'cyber-ctf': '#F6B53D',
  // Sistemas
  linux: '#F6B53D', windows: '#3C8DFF', 'so-infra': '#13C09A',
  // Trilhas
  enem: '#5B3FE6', concurso: '#3C8DFF', programacao: '#13C09A',
  ciberseguranca: '#FF6A45', sistemas: '#F6B53D',
}

export function subjectColor(id) {
  return COLORS[id] || '#5B3FE6'
}

// Monograma (linguagens): rótulo curto, peso forte, dentro do tile.
function Mono({ t, fs = 9 }) {
  return (
    <text
      x="12" y="12.5" textAnchor="middle" dominantBaseline="central"
      fontFamily="'Bricolage Grotesque', system-ui, sans-serif"
      fontWeight="800" fontSize={fs} fill="currentColor" stroke="none"
    >
      {t}
    </text>
  )
}

// Glifos pictográficos (traço currentColor, salvo quando indicado).
const GLYPHS = {
  python: <Mono t="Py" />, javascript: <Mono t="JS" />, typescript: <Mono t="TS" />,
  java: <Mono t="Jv" />, csharp: <Mono t="C#" />, cpp: <Mono t="C++" fs={7.5} />,
  c: <Mono t="C" fs={11} />, go: <Mono t="Go" />, rust: <Mono t="Rs" />,
  php: <Mono t="php" fs={8} />, ruby: <Mono t="Rb" />, kotlin: <Mono t="Kt" />,
  swift: <Mono t="Sw" />, html: <Mono t="</>" fs={8} />, css: <Mono t="css" fs={8} />,

  sql: (
    <g>
      <ellipse cx="12" cy="6.5" rx="6" ry="2.4" />
      <path d="M6 6.5v11c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-11M6 12c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4" />
    </g>
  ),
  git: (
    <g>
      <circle cx="7" cy="6" r="2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="11" r="2" />
      <path d="M7 8v8M9 6.6 15 10" />
    </g>
  ),
  'logica-ed': (
    <g>
      <circle cx="12" cy="5.5" r="2.2" /><circle cx="6" cy="17" r="2.2" /><circle cx="18" cy="17" r="2.2" />
      <path d="M10.3 7.2 7.2 14.8M13.7 7.2l3.1 7.6M8 17h8" />
    </g>
  ),

  portugues: (
    <g>
      <path d="M5 5h6a2.5 2.5 0 0 1 2.5 2.5V19a2.5 2.5 0 0 0-2.5-2.5H5V5Z" />
      <path d="M19 5h-6A2.5 2.5 0 0 0 10.5 7.5V19A2.5 2.5 0 0 1 13 16.5h6V5Z" opacity=".55" />
    </g>
  ),
  matematica: (
    <g>
      <path d="M12 4 6 20M12 4l6 16M8.5 13h7" />
      <path d="M4 8.5h4M16 8.5h4" opacity=".6" />
    </g>
  ),
  redacao: (
    <g>
      <path d="M4 16.5 15 5.5l3.5 3.5L7.5 20 4 20v-3.5Z" />
      <path d="M13 7.5 16.5 11M4 20h16" opacity=".6" />
    </g>
  ),
  biologia: (
    <g>
      <path d="M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" />
      <path d="M9.2 7h5.6M9.2 17h5.6M8.5 12h7" opacity=".55" />
    </g>
  ),
  fisica: (
    <g>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </g>
  ),
  quimica: (
    <g>
      <path d="M10 4h4M10.5 4v5L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L13.5 9V4" />
      <path d="M8.2 14h7.6" opacity=".6" />
      <circle cx="10.5" cy="17" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="18" r="0.7" fill="currentColor" stroke="none" />
    </g>
  ),
  historia: (
    <g>
      <path d="M4 8h16M6 8v9M10 8v9M14 8v9M18 8v9M4 20h16M5 8 12 4l7 4" />
    </g>
  ),
  geografia: (
    <g>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.6 2.2 2.6 13.8 0 16M12 4c-2.6 2.2-2.6 13.8 0 16" opacity=".7" />
    </g>
  ),
  filosofia: (
    <g>
      <path d="M9 17h6M9.5 20h5M8 12.5a4 4 0 1 1 8 0c0 1.6-1 2.4-1.5 3.2H9.5C9 14.9 8 14.1 8 12.5Z" />
      <path d="M12 4v1.5M5.5 8 6.7 8.7M18.5 8l-1.2.7" opacity=".6" />
    </g>
  ),
  sociologia: (
    <g>
      <circle cx="8" cy="8" r="2.4" /><circle cx="16" cy="8" r="2.4" />
      <path d="M3.5 18a4.5 4.5 0 0 1 9 0M11.5 18a4.5 4.5 0 0 1 9 0" />
    </g>
  ),
  ingles: (
    <g>
      <path d="M4 6h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-9l-4 3v-3H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M8 10.5h8M8 13h5" opacity=".7" />
    </g>
  ),
  espanhol: (
    <g>
      <path d="M3 6h11a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H8l-3 2.5V13H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M17 10h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v2l-2.5-2H15" opacity=".7" />
    </g>
  ),
  informatica: (
    <g>
      <rect x="3" y="5" width="18" height="11" rx="1.5" />
      <path d="M9 20h6M12 16v4" />
      <rect x="9" y="9" width="6" height="3.5" rx="0.8" opacity=".7" />
    </g>
  ),
  conhecimentos: (
    <g>
      <path d="M12 4v14M6 9 4 14a3 3 0 0 0 4 0L6 9ZM18 9l-2 5a3 3 0 0 0 4 0l-2-5ZM7 6.5l5-1 5 1M8 20h8" />
    </g>
  ),
  'cyber-fundamentos': (
    <g>
      <path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" opacity=".85" />
    </g>
  ),
  'cyber-redes': (
    <g>
      <circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" /><circle cx="12" cy="13" r="2" />
      <path d="M12 7v4M10.5 14.5 6.5 16.7M13.5 14.5l4 2.2" />
    </g>
  ),
  'cyber-ferramentas': (
    <g>
      <path d="M14 6a3.5 3.5 0 0 0-4.7 4.3L4 15.6 6.4 18l5.3-5.3A3.5 3.5 0 0 0 16 8l-2 2-2-2 2-2Z" />
      <path d="M14.5 14.5 19 19" opacity=".7" />
    </g>
  ),
  'cyber-cripto': (
    <g>
      <rect x="5" y="10" width="14" height="9.5" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <circle cx="12" cy="14.2" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 15.4V17.4" />
    </g>
  ),
  'cyber-python': (
    <g>
      <path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" opacity=".9" />
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontFamily="'Bricolage Grotesque',sans-serif" fontWeight="800" fontSize="6.5" fill="currentColor" stroke="none">Py</text>
    </g>
  ),
  'cyber-ctf': (
    <g>
      <path d="M6 4v16M6 5h11l-2.5 3.5L17 12H6" />
    </g>
  ),
  linux: (
    <g>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M7 10l2.5 2L7 14M11.5 14.5h4" opacity=".9" />
    </g>
  ),
  windows: (
    <g>
      <path d="M4 6.5 11 5.4V11H4V6.5ZM13 5.1 20 4v7h-7V5.1ZM4 13h7v5.6L4 17.5V13Zm9 0h7v7l-7-1.1V13Z" />
    </g>
  ),
  'so-infra': (
    <g>
      <rect x="4" y="4" width="16" height="5" rx="1.2" />
      <rect x="4" y="10.5" width="16" height="5" rx="1.2" />
      <rect x="4" y="17" width="16" height="3" rx="1.2" opacity=".6" />
      <circle cx="7.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
    </g>
  ),

  // Trilhas
  enem: (
    <g>
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5M21 9v5" />
    </g>
  ),
  concurso: (
    <g>
      <path d="M3 9.5 12 4l9 5.5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
    </g>
  ),
  programacao: <Mono t="</>" fs={9} />,
  ciberseguranca: (
    <g>
      <path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" opacity=".85" />
    </g>
  ),
  sistemas: (
    <g>
      <rect x="3.5" y="5" width="17" height="11" rx="1.6" />
      <path d="M7 9l2.5 2L7 13M11.5 13h4M9 20h6M12 16v4" opacity=".9" />
    </g>
  ),
}

// Tom suave (tile) a partir do hex sólido.
function softBg(hex) {
  return hex + '1A' // ~10% alpha
}

export default function SubjectGlyph({
  id,
  size = 40,
  tile = false,
  className = '',
  color,
}) {
  const c = color || subjectColor(id)
  const glyph = GLYPHS[id] || GLYPHS.conhecimentos

  const svg = (
    <svg
      width={tile ? size * 0.58 : size}
      height={tile ? size * 0.58 : size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: c }}
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )

  if (!tile) return <span className={className}>{svg}</span>

  return (
    <span
      className={`grid place-items-center rounded-2xl shrink-0 ${className}`}
      style={{ width: size, height: size, background: softBg(c), color: c }}
    >
      {svg}
    </span>
  )
}
