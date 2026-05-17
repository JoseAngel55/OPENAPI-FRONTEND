import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiasService, type MateriaInput } from '@/services/materias.service'

export function useMaterias(page: number, size: number, nombre: string) {
  return useQuery({
    queryKey: ['materias', page, size, nombre],
    queryFn: () => materiasService.listar({ page, size, nombre }),
  })
}

export function useCrearMateria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: MateriaInput) => materiasService.crear(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materias'] }),
  })
}

export function useActualizarMateria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: MateriaInput }) =>
      materiasService.actualizar(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materias'] }),
  })
}

export function useEliminarMateria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => materiasService.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materias'] }),
  })
}