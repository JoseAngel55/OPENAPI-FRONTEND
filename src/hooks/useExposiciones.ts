import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { exposicionesService } from '@/services/exposiciones.service'
import type { ExposicionInput, ExposicionesFiltros } from '@/types/exposiciones.types'

export const EXPOSICIONES_KEY = 'exposiciones'

export function useExposiciones(filtros: ExposicionesFiltros) {
  return useQuery({
    queryKey: [EXPOSICIONES_KEY, filtros],
    queryFn: () => exposicionesService.listar({ page: filtros.page, size: filtros.size, search: filtros.search || undefined }),
    placeholderData: (prev) => prev,
  })
}

export function useCrearExposicion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ExposicionInput) => exposicionesService.crear(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [EXPOSICIONES_KEY] }); toast.success('Exposición registrada') },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error al registrar exposición'),
  })
}

export function useActualizarExposicion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ExposicionInput }) => exposicionesService.actualizar(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [EXPOSICIONES_KEY] }); toast.success('Exposición actualizada') },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error al actualizar'),
  })
}

export function useEliminarExposicion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exposicionesService.eliminar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [EXPOSICIONES_KEY] }); toast.success('Exposición eliminada') },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error al eliminar'),
  })
}