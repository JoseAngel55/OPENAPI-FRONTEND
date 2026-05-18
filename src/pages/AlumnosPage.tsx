import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAlumnos, useCrearAlumno, useActualizarAlumno, useEliminarAlumno } from '@/hooks/useAlumnos'
import { useGrupos } from '@/hooks/useGrupos'
import AlumnoForm from '@/components/alumnos/AlumnoForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { useAuthStore } from '@/store/authStore'
import type { Alumno } from '@/types/alumnos.types'

export default function AlumnosPage() {
  const rol = useAuthStore((s) => s.user?.rol) ?? 'alumno'
  const canWrite = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Alumno | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Alumno | null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useAlumnos({ search, page, size: PAGE_SIZE })
  const crear      = useCrearAlumno()
  const actualizar = useActualizarAlumno()
  const eliminar   = useEliminarAlumno()

  // ✅ FIX: cargar todos los grupos para los selects, respetando el límite del backend.
  //const { data: gruposData, isLoading: gruposLoading } = useGrupos(0, 100, '')
  //const grupos = gruposData?.content ?? []

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (a: Alumno) => { setEditTarget(a); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: {
    matricula: string
    nombre: string
    apellido_pat: string
    email: string
    id_grupo?: number
  }) => {
    const body = {
      matricula:    values.matricula,
      nombre:       values.nombre,
      apellido_pat: values.apellido_pat,
      email:        values.email,
    }
    if (editTarget) {
      await actualizar.mutateAsync({ id: editTarget.id_alumno, body })
    } else {
      await crear.mutateAsync(body)
    }
    closeModal()
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alumnos</h1>
          <p className="text-sm text-slate-500">
            {data ? `${data.totalElements} alumno(s) registrado(s)` : 'Cargando…'}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} /> Nuevo alumno
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="search" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar por nombre o matrícula…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Cargando alumnos…</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-red-500">Error al cargar los datos</p>
            <p className="text-xs text-slate-400 mt-1">Verifica tu conexión o recarga la página</p>
          </div>
        )}
        {!isLoading && !isError && data?.content.length === 0 && (
          <EmptyState
            title="Sin alumnos"
            description={search ? `No hay resultados para "${search}"` : 'Registra el primer alumno.'}
            action={search
              ? <button onClick={() => setSearch('')} className="text-sm text-indigo-600 underline underline-offset-2">Limpiar búsqueda</button>
              : undefined}
          />
        )}
        {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Tabla de alumnos">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  {[
                    'Matrícula', 'Nombre', 'Correo',
                    ...(canWrite || canDelete ? ['Acciones'] : [])
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data!.content.map((a) => (
                  <tr key={a.id_alumno} className="group hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.matricula}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.nombre} {a.apellido_pat}</td>
                    <td className="px-4 py-3 text-slate-500">{a.email}</td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canWrite && (
                            <button onClick={() => openEdit(a)} aria-label={`Editar ${a.nombre}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(a)} aria-label={`Eliminar ${a.nombre}`}
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editTarget ? 'Editar alumno' : 'Registrar alumno'} onClose={closeModal}>
        <AlumnoForm
          key={editTarget?.id_alumno ?? 'new'}
          initial={editTarget}
          //grupos={grupos}
          //gruposLoading={gruposLoading}
          onSubmit={handleSubmit}
          loading={crear.isPending || actualizar.isPending}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar alumno"
        message={`¿Eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido_pat ?? ''}? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => { await eliminar.mutateAsync(deleteTarget!.id_alumno); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}