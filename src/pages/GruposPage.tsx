import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useGrupos, useCrearGrupo, useActualizarGrupo } from '@/hooks/useGrupos'
import { materiasService } from '@/services/materias.service'
import { gruposService } from '@/services/grupos.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Grupo } from '@/services/grupos.service'

const SEMESTRES = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°']

const schema = z.object({
  nombre_grupo: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  semestre: z.string().min(1, 'Selecciona un semestre'),
  id_materia: z.coerce.number().min(1, 'Selecciona una materia'),
})

type FormValues = z.infer<typeof schema>
const PAGE_SIZE = 10

export default function GruposPage() {
  const rol = useAuthStore((s) => s.user?.rol)
  const canWrite = rol === 'admin' || rol === 'docente'
  // ✅ FIX: admin puede eliminar grupos
  const canDelete = rol === 'admin' || rol === 'docente'

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Grupo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Grupo | null>(null)

  const qc = useQueryClient()
  const { data, isLoading } = useGrupos(page, PAGE_SIZE, debouncedSearch)
  const crear = useCrearGrupo()
  const actualizar = useActualizarGrupo()

  // ✅ FIX: Mutation para eliminar grupo
  const eliminar = useMutation({
    mutationFn: (id: number) => gruposService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grupos'] })
      toast.success('Grupo eliminado')
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar grupo')
    },
  })

  const { data: materiasData } = useQuery({
    queryKey: ['materias-select'],
    queryFn: () => materiasService.listar({ page: 0, size: 100 }),
    enabled: modalOpen,
  })
  const materias = materiasData?.content ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0)
    if (searchTimer) clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => setDebouncedSearch(value), 400))
  }

  const openCreate = () => {
    setEditing(null)
    reset({ nombre_grupo: '', semestre: '', id_materia: 0 })
    setModalOpen(true)
  }

  const openEdit = (grupo: Grupo) => {
    setEditing(grupo)
    reset({ nombre_grupo: grupo.nombre_grupo, semestre: grupo.semestre, id_materia: grupo.id_materia })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await actualizar.mutateAsync({ id: editing.id_grupo, body: values })
        toast.success('Grupo actualizado')
      } else {
        await crear.mutateAsync(values)
        toast.success('Grupo creado')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar')
    }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.totalElements} grupo${data.totalElements !== 1 ? 's' : ''} registrado${data.totalElements !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
            <Plus size={16} /> Nuevo grupo
          </button>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre..." value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Semestre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Materia</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Alumnos</th>
              {(canWrite || canDelete) && (
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Cargando...</td></tr>
            ) : data?.content.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No se encontraron grupos</td></tr>
            ) : (
              data?.content.map((grupo) => (
                <tr key={grupo.id_grupo}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{grupo.nombre_grupo}</td>
                  <td className="px-4 py-3 text-gray-600">{grupo.semestre}</td>
                  <td className="px-4 py-3 text-gray-600">{grupo.nombre_materia}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {grupo.alumnos?.length ?? 0}
                    </span>
                  </td>
                  {(canWrite || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && (
                          <button onClick={() => openEdit(grupo)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            aria-label="Editar">
                            <Pencil size={15} />
                          </button>
                        )}
                        {/* ✅ FIX: Botón eliminar para admin/docente */}
                        {canDelete && (
                          <button onClick={() => setDeleteTarget(grupo)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar grupo' : 'Nuevo grupo'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input type="text" {...register('nombre_grupo')} placeholder="Ej. Grupo A"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
                {errors.nombre_grupo && <p className="mt-1 text-xs text-red-500">{errors.nombre_grupo.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Semestre <span className="text-red-500">*</span>
                </label>
                <select {...register('semestre')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white">
                  <option value="">Selecciona un semestre</option>
                  {SEMESTRES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.semestre && <p className="mt-1 text-xs text-red-500">{errors.semestre.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Materia <span className="text-red-500">*</span>
                </label>
                <select {...register('id_materia')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white">
                  <option value={0}>Selecciona una materia</option>
                  {materias.map((m) => (
                    <option key={m.id_materia} value={m.id_materia}>
                      {m.clave_materia} — {m.nombre_materia}
                    </option>
                  ))}
                </select>
                {errors.id_materia && <p className="mt-1 text-xs text-red-500">{errors.id_materia.message}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
                  {isSubmitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIX: Confirm dialog para eliminar grupo */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar grupo"
        message={`¿Eliminar el grupo "${deleteTarget?.nombre_grupo}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={() => eliminar.mutate(deleteTarget!.id_grupo)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
} 