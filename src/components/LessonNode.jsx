// src/components/LessonNode.jsx
// Cada "bolha" da trilha. Estados: concluída, atual (desbloqueada) ou bloqueada.
import UiIcon from './icons/UiIcon'

export default function LessonNode({ lesson, index, state, onClick }) {
  const offset = [0, 54, 78, 54, 0, -54, -78, -54][index % 8]

  const styles = {
    done: 'bg-mint text-white shadow-node',
    current: 'bg-violet text-white shadow-node ring-4 ring-violet/20 animate-pop',
    locked: 'bg-surface text-faint shadow-node border border-line',
  }

  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {state === 'current' && (
        <span className="absolute -top-7 chip bg-violet text-white shadow-soft whitespace-nowrap animate-floaty">
          Começar
        </span>
      )}
      <button
        onClick={onClick}
        disabled={state === 'locked'}
        aria-label={`${lesson.title} — ${state === 'done' ? 'concluída' : state === 'locked' ? 'bloqueada' : 'disponível'}`}
        className={`grid h-16 w-16 place-items-center rounded-full font-display text-xl font-extrabold
          transition-transform active:translate-y-[3px] active:shadow-nodeActive disabled:active:translate-y-0 ${styles[state]}`}
      >
        {state === 'done' ? <UiIcon name="check" size={26} strokeWidth={3} />
          : state === 'locked' ? <UiIcon name="lock" size={22} />
          : index + 1}
      </button>
      <span className={`mt-2 max-w-[8rem] text-center text-xs font-semibold leading-tight ${state === 'locked' ? 'text-faint' : 'text-ink'}`}>
        {lesson.title}
      </span>
    </div>
  )
}
