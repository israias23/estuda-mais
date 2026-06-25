// src/components/common/Spinner.jsx
import { BrandMark } from '../Brand'

export default function Spinner({ label = 'Carregando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-slatey">
      <div className="relative grid place-items-center">
        <div className="h-14 w-14 rounded-full border-[3px] border-violet/15 border-t-violet animate-spin" />
        <span className="absolute animate-floaty"><BrandMark size={26} /></span>
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
