// src/components/Confetti.jsx
// Confete leve, feito só com CSS (sem bibliotecas). Cai uma vez e some.
import { useMemo } from 'react'

const COLORS = ['#5B3FE6', '#FF6B4A', '#19C2A0', '#F5B947', '#7B63F0']

export default function Confetti({ count = 60 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 0.7 + Math.random() * 0.8,
      })),
    [count]
  )

  return (
    <div aria-hidden className="pointer-events-none">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.size})`,
          }}
        />
      ))}
    </div>
  )
}
