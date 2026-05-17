import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { alumnosService } from '@/services/alumnos.service'
import type { AlumnoInput, AlumnosFiltros } from '@/types/alumnos.types'

export const ALUMNOS_KEY = 'alumnos'

export function useAlumnos(filtros: AlumnosFiltros) {
  return useQuery({
    queryKey: [ALUMNOS_KEY, filtros],
    queryFn: () =>
      alumnosService.listar({
        page: filtros.page,
        size: filtros.size,
        search: filtros.search || undefined,
      }),
    placeholderData: (prev) => prev,
  })
}

export function useCrearAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AlumnoInput) => alumnosService.crear(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
      toast.success('Alumno registrado correctamente')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Error al registrar alumno')
    },
  })
}

export function useActualizarAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AlumnoInput }) =>
      alumnosService.actualizar(id, body),
    onSuccess: (updatedAlumno) => {
      qc.setQueriesData({ queryKey: [ALUMNOS_KEY] }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData.content)) return oldData
        return {
          ...oldData,
          content: oldData.content.map((alumno: any) =>
            alumno.id_alumno === updatedAlumno.id_alumno ? { ...alumno, ...updatedAlumno } : alumno
          ),
        }
      })
      qc.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
      toast.success('Alumno actualizado correctamente')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar alumno')
    },
  })
}

export function useEliminarAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => alumnosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
      toast.success('Alumno eliminado')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar alumno')
    },
  })
}