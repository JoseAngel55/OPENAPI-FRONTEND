import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useExposiciones, useCrearExposicion, useActualizarExposicion, useEliminarExposicion } from '@/hooks/useExposiciones'
import { equiposService } from '@/services/equipos.service'
import ExposicionForm from '@/components/exposiciones/ExposicionForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Exposicion } from '@/types/exposiciones.types'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch { return iso }
}

function StatusBadge({ fecha }: { fecha: string }) {
  const diff = new Date(fecha).getTime() - Date.now()
  if (diff < 0)          return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Realizada</span>
  if (diff < 86_400_000) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Hoy</span>
  return                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Próxima</span>
}

export default function ExposicionesPage() {
  const rol = useAuthStore((s) => s.user?.rol) ?? 'alumno'
  // ✅ FIX: solo admin y docente pueden crear/editar/eliminar
  const canWrite = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Exposicion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exposicion | null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useExposiciones({ search, page, size: PAGE_SIZE })
  const crear      = useCrearExposicion()
  const actualizar = useActualizarExposicion()
  const eliminar   = useEliminarExposicion()

  // ✅ FIX: cargar todos los equipos para el dropdown del formulario
  const { data: equipos = [] } = useQuery({
    queryKey: ['equipos-select'],
    queryFn: () => equiposService.listar(),
    enabled: modalOpen,
  })

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (e: Exposicion) => { setEditTarget(e); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: any) => {
    const body = { ...values }
    if (!body.descripcion) delete body.descripcion
    if (editTarget) await actualizar.mutateAsync({ id: editTarget.id_exposicion, body })
    else await crear.mutateAsync(body)
    closeModal()
  }

  const totalPages = data?.totalPages ?? 1
  const headers = ['Título', 'Fecha', 'Equipo', 'Rúbrica', 'Estado', ...(canWrite || canDelete ? ['Acciones'] : [])]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exposiciones</h1>
          <p className="text-sm text-slate-500">{data ? `${data.totalElements} exposición(es)` : 'Cargando…'}</p>
        </div>
        {/* ✅ FIX: botón solo para admin/docente */}
        {canWrite && (
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm">
            <Plus size={16} /> Nueva exposición
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="search" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar por título…"
          aria-label="Buscar exposiciones"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Cargando exposiciones…</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-red-500">Error al cargar los datos</p>
          </div>
        )}
        {!isLoading && !isError && data?.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-14 w-14 rounded-full bg-violet-50 flex items-center justify-center">
              <CalendarDays size={24} className="text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin exposiciones</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? `Sin resultados para "${search}"` : 'Registra la primera exposición.'}
            </p>
          </div>
        )}
        {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Tabla de exposiciones">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data!.content.map((expo) => (
                  <tr key={expo.id_exposicion} className="group hover:bg-violet-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{expo.titulo}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(expo.fecha_exposicion)}</td>
                    <td className="px-4 py-3 text-slate-500">{expo.nombre_equipo ?? `Equipo ${expo.id_equipo}`}</td>
                    <td className="px-4 py-3 text-slate-500">{expo.id_rubrica}</td>
                    <td className="px-4 py-3"><StatusBadge fecha={expo.fecha_exposicion} /></td>
                    {/* ✅ FIX: botones CRUD solo para admin/docente */}
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canWrite && (
                            <button onClick={() => openEdit(expo)} aria-label={`Editar ${expo.titulo}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(expo)} aria-label={`Eliminar ${expo.titulo}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && (data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Página {page + 1} de {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                aria-label="Página anterior"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                aria-label="Página siguiente"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editTarget ? 'Editar exposición' : 'Nueva exposición'} onClose={closeModal} size="lg">
        <ExposicionForm
          initial={editTarget}
          equipos={equipos}
          onSubmit={handleSubmit}
          loading={crear.isPending || actualizar.isPending}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar exposición"
        message={`¿Eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => { await eliminar.mutateAsync(deleteTarget!.id_exposicion); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}