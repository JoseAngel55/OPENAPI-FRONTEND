import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gruposService, type GrupoInput } from '@/services/grupos.service'

// El queryKey incluye page, size y nombre como en GruposPage,
// por lo que useGrupos(0, 100, '') tiene su propia entrada en caché
// separada de useGrupos(0, 10, '') — ambas coexisten sin conflicto.
export function useGrupos(page: number, size: number, nombre: string) {
  return useQuery({
    queryKey: ['grupos', page, size, nombre],
    queryFn: () => gruposService.listar({ page, size, nombre }),
  })
}

export function useGrupo(id: number) {
  return useQuery({
    queryKey: ['grupos', id],
    queryFn: () => gruposService.obtener(id),
    enabled: !!id,
  })
}

export function useCrearGrupo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GrupoInput) => gruposService.crear(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  })
}

export function useActualizarGrupo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: GrupoInput }) =>
      gruposService.actualizar(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grupos'] }),
  })
}