// src/components/XpPill.jsx
import UiIcon from './icons/UiIcon'

export default function XpPill({ xp = 0, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-[#B5841E] ${className}`}>
      <UiIcon name="bolt" size={15} strokeWidth={2} className="text-gold" />
      {xp.toLocaleString('pt-BR')} XP
    </span>
  )
}
