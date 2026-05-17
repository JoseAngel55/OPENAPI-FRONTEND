import { Users } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros con los filtros actuales.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <Users size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}