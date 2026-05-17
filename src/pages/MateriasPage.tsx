import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useMaterias, useCrearMateria, useActualizarMateria, useEliminarMateria } from '@/hooks/useMaterias'
import type { Materia } from '@/services/materias.service'

const schema = z.object({
  clave_materia: z.string().min(2, 'Mínimo 2 caracteres').max(20, 'Máximo 20 caracteres'),
  nombre_materia: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
})

type FormValues = z.infer<typeof schema>

const PAGE_SIZE = 10

export default function MateriasPage() {
  const rol = useAuthStore((s) => s.user?.rol)
  const canWrite = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Materia | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Materia | null>(null)

  const { data, isLoading } = useMaterias(page, PAGE_SIZE, debouncedSearch)
  const crear = useCrearMateria()
  const actualizar = useActualizarMateria()
  const eliminar = useEliminarMateria()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(0)
    if (searchTimer) clearTimeout(searchTimer)
    setSearchTimer(setTimeout(() => setDebouncedSearch(value), 400))
  }

  const openCreate = () => {
    setEditing(null)
    reset({ clave_materia: '', nombre_materia: '' })
    setModalOpen(true)
  }

  const openEdit = (materia: Materia) => {
    setEditing(materia)
    reset({ clave_materia: materia.clave_materia, nombre_materia: materia.nombre_materia })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await actualizar.mutateAsync({ id: editing.id_materia, body: values })
        toast.success('Materia actualizada')
      } else {
        await crear.mutateAsync(values)
        toast.success('Materia creada')
      }
      closeModal()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar'
      toast.error(msg)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await eliminar.mutateAsync(deleteTarget.id_materia)
      toast.success('Materia eliminada')
      setDeleteTarget(null)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al eliminar'
      toast.error(msg)
    }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.totalElements} materia${data.totalElements !== 1 ? 's' : ''} registrada${data.totalElements !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            Nueva materia
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Clave</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
              {(canWrite || canDelete) && (
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                  No se encontraron materias
                </td>
              </tr>
            ) : (
              data?.content.map((materia) => (
                <tr key={materia.id_materia} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{materia.clave_materia}</td>
                  <td className="px-4 py-3 text-gray-900">{materia.nombre_materia}</td>
                  {(canWrite || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite && (
                          <button
                            onClick={() => openEdit(materia)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            aria-label="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(materia)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Eliminar"
                          >
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal crear / editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar materia' : 'Nueva materia'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Clave <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('clave_materia')}
                  placeholder="Ej. PROG-01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {errors.clave_materia && (
                  <p className="mt-1 text-xs text-red-500">{errors.clave_materia.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nombre_materia')}
                  placeholder="Ej. Programación Web"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {errors.nombre_materia && (
                  <p className="mt-1 text-xs text-red-500">{errors.nombre_materia.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear materia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Eliminar materia</h2>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar{' '}
              <span className="font-medium text-gray-700">{deleteTarget.nombre_materia}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={eliminar.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {eliminar.isPending ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}