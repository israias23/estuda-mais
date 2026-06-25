// src/components/common/Card.jsx
export default function Card({ as: As = 'div', className = '', children, ...props }) {
  return (
    <As className={`rounded-xl2 bg-surface border border-line shadow-soft ${className}`} {...props}>
      {children}
    </As>
  )
}
