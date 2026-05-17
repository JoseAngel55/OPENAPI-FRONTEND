import api from '@/services/api'
import type { Evaluacion, EvaluacionInput, Criterio } from '@/types/evaluaciones.types'

export const evaluacionesService = {
  registrar: (body: EvaluacionInput) =>
    api.post<Evaluacion>('/evaluaciones', body).then((r) => r.data),

  listar: () =>
    api.get<Evaluacion[]>('/evaluaciones').then((r) => r.data),

  obtenerCriterios: (id_exposicion: number) =>
    api.get<Criterio[]>('/criterios', { params: { id_exposicion } }).then((r) => r.data),
}