import api from '@/services/api'
import type { Exposicion, ExposicionInput, PagedExposiciones } from '@/types/exposiciones.types'

const BASE = '/exposiciones'

export const exposicionesService = {
  listar: (params: { page: number; size: number; search?: string }) =>
    api.get<PagedExposiciones>(BASE, { params }).then((r) => r.data),

  obtener: (id: number) =>
    api.get<Exposicion>(`${BASE}/${id}`).then((r) => r.data),

  crear: (body: ExposicionInput) =>
    api.post<Exposicion>(BASE, body).then((r) => r.data),

  actualizar: (id: number, body: ExposicionInput) =>
    api.put<Exposicion>(`${BASE}/${id}`, body).then((r) => r.data),

  eliminar: (id: number) =>
    api.delete(`${BASE}/${id}`).then(() => undefined),
}