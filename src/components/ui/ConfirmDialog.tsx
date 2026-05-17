import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Eliminar',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title="" onClose={onCancel} size="sm">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
        <div className="mt-2 flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}