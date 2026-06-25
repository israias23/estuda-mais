// src/components/common/Avatar.jsx
// Avatar com iniciais e cor estável derivada do nome.
const PALETTE = ['#5B3FE6', '#13C09A', '#FF6A45', '#3C8DFF', '#F6B53D', '#7B63F0']

function hueOf(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997
  return PALETTE[h % PALETTE.length]
}

export default function Avatar({ name = '?', size = 40, className = '', ring = false }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  const c = hueOf(name)
  return (
    <span
      className={`grid place-items-center rounded-full font-display font-bold text-white shrink-0 ${ring ? 'ring-2 ring-white shadow-soft' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${c}, ${c}cc)` }}
    >
      {initials}
    </span>
  )
}
