// src/components/common/ProgressBar.jsx
export default function ProgressBar({ value, max, color = 'mint', className = '', height = 'h-2.5' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const bar = { mint: 'bg-mint', violet: 'bg-violet', ember: 'bg-ember', gold: 'bg-gold', sky: 'bg-sky' }[color] || 'bg-violet'
  return (
    <div className={`${height} w-full rounded-full bg-ink/[0.07] overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${bar} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
        role="progressbar" aria-valuenow={value} aria-valuemax={max}
      />
    </div>
  )
}
