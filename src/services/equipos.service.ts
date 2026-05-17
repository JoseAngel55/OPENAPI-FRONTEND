import api from '@/services/api'
import type { Equipo, EquipoInput } from '@/types/equipos.types'

const BASE = '/equipos'

export const equiposService = {
  listar: (params?: { id_grupo?: number }) =>
    api.get<Equipo[]>(BASE, { params }).then((r) => r.data),

  obtenerPorId: (id: number) =>
    api.get<Equipo>(`${BASE}/${id}`).then((r) => r.data),

  crear: (body: EquipoInput) =>
    api.post<Equipo>(BASE, body).then((r) => r.data),

  actualizar: (id: number, body: { nombre_equipo: string; id_grupo: number }) =>
    api.put<Equipo>(`${BASE}/${id}`, body).then((r) => r.data),

  eliminar: (id: number) =>
    api.delete(`${BASE}/${id}`).then(() => undefined),
}