// src/components/common/Badge.jsx
const tones = {
  violet: 'bg-violet-wash text-violet',
  mint: 'bg-mint/12 text-mint',
  ember: 'bg-ember/12 text-ember',
  gold: 'bg-gold/15 text-[#B5841E]',
  sky: 'bg-sky/12 text-sky',
  neutral: 'bg-line/70 text-slatey',
}
export default function Badge({ tone = 'violet', className = '', children }) {
  return <span className={`chip ${tones[tone] || tones.violet} ${className}`}>{children}</span>
}
