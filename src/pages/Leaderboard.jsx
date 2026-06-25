// src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react'
import { useProgress } from '../context/ProgressContext'
import { loadLeaderboard } from '../services/progressService'
import Spinner from '../components/common/Spinner'
import Avatar from '../components/common/Avatar'
import UiIcon from '../components/icons/UiIcon'

const RANK = ['#F6B53D', '#9AA3B2', '#CD7F4D'] // ouro, prata, bronze

function Podium({ row, place }) {
  if (!row) return <div className="flex-1" />
  const heights = ['h-24', 'h-20', 'h-16']
  const order = [1, 0, 2] // prata, ouro, bronze (centralizado)
  return (
    <div className="flex flex-col items-center justify-end flex-1">
      <Avatar name={row.name} size={place === 0 ? 56 : 46} ring />
      <p className="font-display font-bold text-white text-sm mt-1.5 truncate max-w-[6rem] text-center">{row.name?.split(' ')[0]}</p>
      <p className="text-xs text-white/60">{row.weekXp || 0} XP</p>
      <div className={`mt-2 w-full max-w-[5.5rem] rounded-t-xl2 ${heights[place]} grid place-items-start justify-center pt-2`} style={{ background: `${RANK[place]}22` }}>
        <span className="font-display font-extrabold text-xl" style={{ color: RANK[place] }}>{place + 1}</span>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { progress } = useProgress()
  const [rows, setRows] = useState(null)

  useEffect(() => { loadLeaderboard(progress?.uid).then(setRows) }, [progress?.uid])
  if (!rows) return <Spinner label="Montando o ranking…" />

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)
  const myRank = rows.findIndex((r) => r.uid === progress?.uid)

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
        <UiIcon name="trophy" size={26} className="text-gold" /> Ranking
      </h1>
      <p className="text-slatey mb-6">Quem mais juntou XP nos últimos 7 dias.</p>

      {/* Pódio */}
      {top3.length >= 3 && (
        <div className="rounded-xl2 bg-night p-5 shadow-card mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-60" />
          <div className="relative flex items-end gap-2">
            <Podium row={top3[1]} place={1} />
            <Podium row={top3[0]} place={0} />
            <Podium row={top3[2]} place={2} />
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {(top3.length >= 3 ? rest : rows).map((r, i) => {
          const rank = (top3.length >= 3 ? i + 3 : i)
          const me = r.uid === progress?.uid
          return (
            <div key={r.uid} className={`flex items-center gap-3 rounded-xl2 p-3 border ${me ? 'bg-violet text-white border-violet shadow-card' : 'bg-surface border-line'}`}>
              <span className={`w-7 text-center font-display font-bold ${me ? 'text-white' : 'text-slatey'}`}>{rank + 1}</span>
              <Avatar name={r.name} size={40} />
              <div className="flex-1 min-w-0">
                <p className={`font-display font-semibold truncate ${me ? 'text-white' : 'text-ink'}`}>{r.name} {me && '(você)'}</p>
                <p className={`text-xs flex items-center gap-1 ${me ? 'text-white/70' : 'text-slatey'}`}>
                  <UiIcon name="flame" size={12} /> {r.streak || 0} dias de ofensiva
                </p>
              </div>
              <span className={`font-display font-extrabold ${me ? 'text-gold' : 'text-violet'}`}>{r.weekXp || 0} XP</span>
            </div>
          )
        })}
      </div>

      {myRank >= 0 && (
        <p className="text-center text-sm text-slatey mt-5">
          Você está em <strong className="text-violet font-display">{myRank + 1}º</strong> lugar nesta semana.
        </p>
      )}
    </div>
  )
}
