// src/pages/Simulado.jsx
// Simulado cronometrado: combina questões de várias matérias, sem feedback durante
// a prova. Ao final mostra nota, tempo e correção questão a questão.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { listSubjects, getSubject } from '../data/tracks'
import { collectQuestions, shuffle } from '../services/quizBank'
import Button from '../components/common/Button'
import Confetti from '../components/Confetti'
import EmptyState from '../components/common/EmptyState'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
const hashIndex = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return 'q' + h.toString(36) }

export default function Simulado() {
  const navigate = useNavigate()
  const { progress, recordAnswer } = useProgress()

  const [phase, setPhase] = useState('config') // config | run | result
  const mySubjects = (progress?.subjects || [])
  const [selected, setSelected] = useState(mySubjects)
  const [count, setCount] = useState(10)

  const available = useMemo(() => collectQuestions(selected.length ? selected : mySubjects).length, [selected]) // eslint-disable-line
  const subjectOptions = useMemo(() => listSubjects(progress?.track || null).filter((s) => s.ready), [progress?.track])

  // Estado da prova
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([]) // índice escolhido por questão (ou null)
  const [cursor, setCursor] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function start() {
    const pool = collectQuestions(selected.length ? selected : mySubjects)
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length))
    if (picked.length === 0) return
    setQuestions(picked)
    setAnswers(new Array(picked.length).fill(null))
    setCursor(0)
    setSeconds(0)
    setPhase('run')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  function choose(optIndex) {
    setAnswers((a) => { const n = [...a]; n[cursor] = optIndex; return n })
  }

  function finish() {
    clearInterval(timerRef.current)
    // registra cada resposta (alimenta estatísticas e a fila de revisão)
    questions.forEach((item, idx) => {
      const correct = answers[idx] === item.q.correct
      recordAnswer({
        subjectId: item.subjectId, lessonId: item.lessonId || 'simulado',
        subjectTitle: item.subjectTitle, lessonTitle: item.lessonTitle || 'Simulado',
        question: item.q, qIndex: hashIndex(item.q.q), correct,
      })
    })
    setPhase('result')
  }

  // ---------- CONFIG ----------
  if (phase === 'config') {
    return (
      <div className="animate-rise">
        <button onClick={() => navigate('/app')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
          <UiIcon name="chevronLeft" size={16} /> Início
        </button>
        <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
          <UiIcon name="target" size={26} className="text-ember" /> Simulado
        </h1>
        <p className="text-slatey mb-6">Monte uma prova com questões das suas matérias e treine no clima da prova real.</p>

        <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
          <h2 className="font-display font-bold text-ink mb-3">Matérias</h2>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((s) => {
              const on = selected.includes(s.id)
              return (
                <button key={s.id} onClick={() => toggle(s.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold border transition-colors ${
                    on ? 'bg-violet text-white border-violet' : 'bg-surface text-slatey border-line hover:border-violet/40'}`}>
                  <SubjectGlyph id={s.id} size={16} color={on ? '#fff' : undefined} /> {s.title}
                </button>
              )
            })}
          </div>

          <h2 className="font-display font-bold text-ink mt-6 mb-3">Número de questões</h2>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`py-3 rounded-xl2 font-display font-bold border-2 transition-colors ${
                  count === n ? 'border-violet bg-violet-wash text-violet' : 'border-line text-slatey hover:border-violet/40'}`}>
                {n}
              </button>
            ))}
          </div>

          <p className="text-sm text-slatey mt-4">
            <strong className="text-ink">{available}</strong> questões disponíveis para esta seleção
            {available < count && available > 0 && <span> — o simulado terá {available}.</span>}
          </p>

          {available === 0 ? (
            <p className="text-sm text-ember mt-3 flex items-start gap-1.5">
              <UiIcon name="close" size={15} className="mt-0.5 shrink-0" />
              Ainda não há questões para estas matérias. Estude algumas lições primeiro (as questões geradas ficam disponíveis aqui depois).
            </p>
          ) : (
            <Button onClick={start} size="lg" className="w-full mt-5">Iniciar simulado <UiIcon name="arrowRight" size={18} /></Button>
          )}
        </div>
      </div>
    )
  }

  // ---------- RUN ----------
  if (phase === 'run') {
    const item = questions[cursor]
    const picked = answers[cursor]
    const answeredCount = answers.filter((a) => a !== null).length
    return (
      <div className="animate-rise">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => { if (confirm('Sair do simulado? Seu progresso será perdido.')) { clearInterval(timerRef.current); navigate('/app') } }}
            aria-label="Sair" className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-line">
            <UiIcon name="close" size={18} />
          </button>
          <div className="h-2.5 flex-1 rounded-full bg-ink/[0.07] overflow-hidden">
            <div className="h-full bg-ember rounded-full transition-all duration-300" style={{ width: `${((cursor + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink tabular-nums">
            <UiIcon name="clock" size={15} className="text-slatey" /> {fmtTime(seconds)}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="chip bg-violet-wash text-violet"><SubjectGlyph id={item.subjectId} size={13} /> {item.subjectTitle}</span>
          <span className="text-sm font-semibold text-slatey tabular-nums">{cursor + 1}/{questions.length}</span>
        </div>

        <h2 className="font-display text-xl font-bold text-ink mb-5 leading-snug">{item.q.q}</h2>
        <div className="flex flex-col gap-3">
          {item.q.options.map((opt, oi) => (
            <button key={oi} onClick={() => choose(oi)}
              className={`text-left rounded-xl2 border-2 px-4 py-3.5 font-medium transition-colors ${
                picked === oi ? 'bg-violet-wash border-violet text-ink' : 'bg-surface border-line text-ink hover:border-violet/40'}`}>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button variant="ghost" disabled={cursor === 0} onClick={() => setCursor((c) => c - 1)} className="flex-1">
            <UiIcon name="chevronLeft" size={18} /> Anterior
          </Button>
          {cursor + 1 < questions.length ? (
            <Button onClick={() => setCursor((c) => c + 1)} className="flex-1">Próxima <UiIcon name="chevronRight" size={18} /></Button>
          ) : (
            <Button variant="ember" onClick={finish} className="flex-1">Finalizar ({answeredCount}/{questions.length})</Button>
          )}
        </div>
      </div>
    )
  }

  // ---------- RESULT ----------
  const correctCount = questions.reduce((acc, item, idx) => acc + (answers[idx] === item.q.correct ? 1 : 0), 0)
  const pct = Math.round((correctCount / questions.length) * 100)
  const great = pct >= 70
  return (
    <div className="animate-rise">
      {great && <Confetti />}
      <div className="text-center py-2">
        <span className={`mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl ${great ? 'bg-mint/15 text-mint' : 'bg-ember/15 text-ember'}`}>
          <UiIcon name={great ? 'award' : 'target'} size={32} />
        </span>
        <h1 className="font-display text-3xl font-extrabold text-ink">{pct}%</h1>
        <p className="text-slatey">{correctCount} de {questions.length} certas · tempo {fmtTime(seconds)}</p>
      </div>

      <div className="flex gap-3 my-5">
        <Button onClick={() => setPhase('config')} variant="ghost" className="flex-1"><UiIcon name="refresh" size={18} /> Refazer</Button>
        <Button onClick={() => navigate('/app/estatisticas')} className="flex-1"><UiIcon name="layers" size={18} /> Estatísticas</Button>
      </div>

      <h2 className="font-display font-bold text-ink mb-3">Correção</h2>
      <div className="flex flex-col gap-3">
        {questions.map((item, idx) => {
          const picked = answers[idx]
          const ok = picked === item.q.correct
          return (
            <div key={idx} className={`rounded-xl2 p-4 border shadow-soft ${ok ? 'bg-mint/[0.06] border-mint/30' : 'bg-ember/[0.06] border-ember/30'}`}>
              <div className="flex items-start gap-2">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${ok ? 'bg-mint' : 'bg-ember'}`}>
                  <UiIcon name={ok ? 'check' : 'close'} size={14} strokeWidth={3} />
                </span>
                <p className="font-display font-bold text-ink text-sm">{item.q.q}</p>
              </div>
              <div className="mt-2 ml-8 text-sm">
                {picked === null
                  ? <p className="text-ember">Você não respondeu.</p>
                  : !ok && <p className="text-ember">Sua resposta: {item.q.options[picked]}</p>}
                <p className="text-mint font-medium">Correta: {item.q.options[item.q.correct]}</p>
                {item.q.explain && <p className="text-slatey mt-1">{item.q.explain}</p>}
              </div>
            </div>
          )
        })}
      </div>
      <Button onClick={() => navigate('/app')} variant="ghost" className="w-full mt-5">Voltar ao início</Button>
    </div>
  )
}
