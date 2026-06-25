// src/components/common/EmptyState.jsx
export default function EmptyState({ icon, title, children, action, className = '' }) {
  return (
    <div className={`rounded-xl2 border-2 border-dashed border-line bg-surface/60 p-8 text-center ${className}`}>
      {icon && <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-violet-wash text-violet">{icon}</div>}
      {title && <h3 className="font-display font-bold text-ink">{title}</h3>}
      {children && <p className="text-sm text-slatey mt-1 max-w-xs mx-auto">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
