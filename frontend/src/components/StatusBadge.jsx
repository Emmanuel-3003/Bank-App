import { titleCase } from '../utils/format'

const STYLES = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-slate-200 text-slate-700',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {titleCase(status)}
    </span>
  )
}