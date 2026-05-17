import { useState } from 'react'
import { Plus, Loader2, Users, Pencil, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { useEquipos, useCrearEquipo, useActualizarEquipo, useEliminarEquipo } from '@/hooks/useEquipos'
import { gruposService } from '@/services/grupos.service'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Equipo } from '@/types/equipos.types'

const schema = z.object({
  nombre_equipo: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  id_grupo: z.number({ coerce: true }).positive('Selecciona un grupo'),
})
type FormValues = z.infer<typeof schema>

interface Grupo {
  id_grupo: number
  nombre_grupo: string
  nombre_materia: string
  semestre: string
}

function EquipoForm({
  initial, grupos, onSubmit, loading, onCancel,
}: {
  initial?: Equipo | null
  grupos: Grupo[]
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_equipo: initial?.nombre_equipo ?? '',
      id_grupo: initial?.id_grupo ?? (undefined as any),
    },
  })

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all'
  const lbl = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="eq_nombre">Nombre del equipo *</label>
        <input id="eq_nombre" {...register('nombre_equipo')} className={inputCls}
          aria-invalid={!!errors.nombre_equipo} placeholder="Ej. Equipo Alpha" />
        {errors.nombre_equipo && <p className="mt-1 text-xs text-red-500">{errors.nombre_equipo.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="eq_grupo">Grupo *</label>
        {/* ✅ FIX: mostrar spinner si grupos aún no cargaron */}
        {grupos.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" /> Cargando grupos…
          </div>
        ) : (
          <select id="eq_grupo" {...register('id_grupo')} className={`${inputCls} bg-white`}
            aria-invalid={!!errors.id_grupo}>
            <option value="">Selecciona un grupo</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.nombre_grupo} — {g.nombre_materia} ({g.semestre})
              </option>
            ))}
          </select>
        )}
        {errors.id_grupo && <p className="mt-1 text-xs text-red-500">{errors.id_grupo.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading || grupos.length === 0}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Crear equipo'}
        </button>
      </div>
    </form>
  )
}

export default function EquiposPage() {
  const user = useAuthStore((s) => s.user)
  const rol  = user?.rol ?? 'alumno'
  const canWrite  = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Equipo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Equipo | null>(null)
  const [idGrupoFiltro, setIdGrupoFiltro] = useState<number | undefined>()

  const { data: equipos = [], isLoading, isError } = useEquipos(
    idGrupoFiltro ? { id_grupo: idGrupoFiltro } : undefined
  )
  const crear      = useCrearEquipo()
  const actualizar = useActualizarEquipo()
  const eliminar   = useEliminarEquipo()

  // ✅ FIX PRINCIPAL: sin `enabled` condicional — los grupos se cargan
  // inmediatamente al montar la página, no al abrir el modal.
  // Así cuando el modal abre, la lista ya está en caché.
  const { data: gruposData } = useQuery({
    queryKey: ['grupos-select-equipos'],
    queryFn: () => gruposService.listar({ page: 0, size: 200 }),
    staleTime: 1000 * 60 * 5,
  })
  const grupos: Grupo[] = gruposData?.content ?? []

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (eq: Equipo) => { setEditTarget(eq); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: FormValues) => {
    if (editTarget) {
      await actualizar.mutateAsync({ id: editTarget.id_equipo, body: values })
    } else {
      await crear.mutateAsync({
        nombre_equipo:     values.nombre_equipo,
        id_grupo:          values.id_grupo,
        id_alumno_creador: user?.id ?? 1,
      })
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Cargando…' : `${equipos.length} equipo(s)`}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Plus size={16} /> Nuevo equipo
          </button>
        )}
      </div>

      {/* Filtro por grupo */}
      <div className="max-w-xs">
        <select
          value={idGrupoFiltro ?? ''}
          onChange={(e) => setIdGrupoFiltro(e.target.value ? Number(e.target.value) : undefined)}
          aria-label="Filtrar equipos por grupo"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all">
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id_grupo} value={g.id_grupo}>
              {g.nombre_grupo} — {g.nombre_materia}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Cargando equipos…</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-red-500">Error al cargar los datos</p>
          </div>
        )}
        {!isLoading && !isError && equipos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Users size={24} className="text-teal-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin equipos</p>
            <p className="text-xs text-slate-400 mt-1">
              {idGrupoFiltro ? 'No hay equipos en ese grupo.' : 'Crea el primer equipo.'}
            </p>
          </div>
        )}
        {!isLoading && !isError && equipos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Tabla de equipos">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  {[
                    'Nombre del equipo', 'Grupo', 'Integrantes',
                    ...(canWrite || canDelete ? ['Acciones'] : [])
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipos.map((eq) => (
                  <tr key={eq.id_equipo} className="group hover:bg-teal-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{eq.nombre_equipo}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.nombre_grupo ?? `Grupo ${eq.id_grupo}`}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.total_integrantes ?? '—'}</td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canWrite && (
                            <button onClick={() => openEdit(eq)} aria-label={`Editar ${eq.nombre_equipo}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-teal-100 hover:text-teal-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                          )}
                          {/* ✅ FIX: botón eliminar llama a deleteTarget, no a DELETE directo */}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(eq)} aria-label={`Eliminar ${eq.nombre_equipo}`}
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
      </div>

      {/* Modal crear/editar */}
      <Modal open={modalOpen} title={editTarget ? 'Editar equipo' : 'Nuevo equipo'} onClose={closeModal}>
        <EquipoForm
          initial={editTarget}
          grupos={grupos}
          onSubmit={handleSubmit}
          loading={crear.isPending || actualizar.isPending}
          onCancel={closeModal}
        />
      </Modal>

      {/* ✅ FIX: Confirm dialog — la mutación sí llama al endpoint DELETE correcto */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar equipo"
        message={`¿Eliminar el equipo "${deleteTarget?.nombre_equipo}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => {
          await eliminar.mutateAsync(deleteTarget!.id_equipo)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}