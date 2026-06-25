// src/components/Brand.jsx
// Marca da plataforma: símbolo (capelo + barra "+") e logotipo.

export function BrandMark({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B3FE6" />
          <stop offset="1" stopColor="#7B63F0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="17" fill="url(#bm-g)" />
      <path d="M14 25 L32 16 L50 25 L32 34 Z" fill="#fff" />
      <path d="M21 30 v8 c0 3.4 5 5.6 11 5.6 s11-2.2 11-5.6 v-8 L32 38 Z" fill="#F6B53D" />
      <rect x="49" y="24" width="2.6" height="12" rx="1.3" fill="#fff" />
      <circle cx="50.3" cy="39.5" r="2.6" fill="#FF6A45" />
    </svg>
  )
}

export default function Brand({ size = 36, className = '', textClass = 'text-ink' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark size={size} />
      <span className={`font-display font-extrabold tracking-tight ${textClass}`}>
        Estuda<span className="text-violet">+</span>
      </span>
    </span>
  )
}
