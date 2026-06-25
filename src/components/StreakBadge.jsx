// src/components/StreakBadge.jsx
import UiIcon from './icons/UiIcon'

export default function StreakBadge({ days = 0, size = 'md' }) {
  const big = size === 'lg'
  const on = days > 0
  return (
    <div className={`inline-flex items-center gap-1.5 ${on ? '' : 'opacity-50'}`} title={`Ofensiva de ${days} dias`}>
      <span className={`${on ? 'text-ember animate-flame' : 'text-slatey'}`}>
        <UiIcon name="flame" size={big ? 26 : 20} strokeWidth={2} />
      </span>
      <span className={`font-display font-extrabold ${big ? 'text-2xl' : 'text-lg'} ${on ? 'text-ember' : 'text-slatey'}`}>
        {days}
      </span>
    </div>
  )
}
