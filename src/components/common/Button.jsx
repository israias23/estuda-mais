// src/components/common/Button.jsx
const variants = {
  primary: 'bg-violet text-white shadow-node hover:bg-violet-deep active:shadow-nodeActive active:translate-y-[3px]',
  ember:   'bg-ember text-white shadow-node hover:brightness-105 active:shadow-nodeActive active:translate-y-[3px]',
  dark:    'bg-ink text-white shadow-node hover:bg-night active:shadow-nodeActive active:translate-y-[3px]',
  ghost:   'bg-surface text-ink border border-line hover:border-violet/40 hover:bg-violet-wash/40',
  soft:    'bg-violet-wash text-violet hover:bg-violet-wash/70',
  subtle:  'bg-transparent text-slatey hover:text-ink hover:bg-line/60',
}
const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-3 rounded-xl2 gap-2',
  lg: 'px-6 py-3.5 text-lg rounded-xl2 gap-2.5',
}

export default function Button({
  children, variant = 'primary', size = 'md', className = '', disabled, ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-display font-semibold select-none
        transition-all duration-100 disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
