import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { evaluacionesService } from '@/services/evaluaciones.service'
import type { EvaluacionInput } from '@/types/evaluaciones.types'

export const EVALUACIONES_KEY = 'evaluaciones'

export function useRegistrarEvaluacion() {
  return useMutation({
    mutationFn: (body: EvaluacionInput) => evaluacionesService.registrar(body),
    onSuccess: () => {
      toast.success('Evaluación registrada correctamente')
    },
    onError: (err: any) => {
      const status  = err?.response?.status
      const message = err?.response?.data?.message
      if (status === 409) {
        toast.error(message ?? 'Ya registraste una evaluación para esta exposición')
      } else {
        toast.error(message ?? 'Error al registrar la evaluación')
      }
    },
  })
}

export function useEvaluaciones() {
  return useQuery({
    queryKey: [EVALUACIONES_KEY],
    queryFn: () => evaluacionesService.listar(),
  })
}