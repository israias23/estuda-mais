// src/components/SubjectCard.jsx
import { useNavigate } from 'react-router-dom'
import ProgressBar from './common/ProgressBar'
import SubjectGlyph, { subjectColor } from './icons/SubjectGlyph'
import UiIcon from './icons/UiIcon'

const barColor = { violet: 'violet', ember: 'ember', mint: 'mint', gold: 'gold' }

export default function SubjectCard({ subject, doneCount = 0 }) {
  const navigate = useNavigate()
  const total = subject.lessons
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const complete = total > 0 && doneCount >= total
  const started = doneCount > 0

  return (
    <button
      onClick={() => subject.ready && navigate(`/app/trilha/${subject.id}`)}
      disabled={!subject.ready}
      className="group w-full text-left rounded-xl2 bg-surface p-4 border border-line shadow-soft
        transition-all tap hover:border-violet/40 hover:shadow-card disabled:opacity-60 disabled:active:scale-100"
    >
      <div className="flex items-center gap-3.5">
        <SubjectGlyph id={subject.id} tile size={52} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-ink truncate">{subject.title}</h3>
            {complete && (
              <span className="chip bg-gold/15 text-[#B5841E] !px-2 !py-0.5">
                <UiIcon name="award" size={12} /> Concluída
              </span>
            )}
          </div>
          <p className="text-sm text-slatey">
            {subject.ready ? `${doneCount}/${total} lições${started && !complete ? ` · ${pct}%` : ''}` : 'Em breve'}
          </p>
        </div>
        {subject.ready && (
          <span className="grid h-8 w-8 place-items-center rounded-full text-faint group-hover:text-violet group-hover:bg-violet-wash transition-colors">
            <UiIcon name="chevronRight" size={20} />
          </span>
        )}
      </div>
      {subject.ready && (
        <ProgressBar value={doneCount} max={total} color={barColor[subject.color] || 'violet'} className="mt-3" />
      )}
    </button>
  )
}
