import api from '@/services/api'
import type { Alumno, AlumnoInput, PagedAlumnos } from '@/types/alumnos.types'

const BASE = '/alumnos'

export const alumnosService = {
  listar: (params: { page: number; size: number; search?: string }) =>
    api.get<PagedAlumnos>(BASE, { params }).then((r) => r.data),

  obtener: (id: number) =>
    api.get<Alumno>(`${BASE}/${id}`).then((r) => r.data),

  crear: (body: AlumnoInput) =>
    api.post<Alumno>(BASE, body).then((r) => r.data),

  actualizar: (id: number, body: AlumnoInput) =>
    api.put<Alumno>(`${BASE}/${id}`, body).then((r) => r.data),

  eliminar: (id: number) =>
    api.delete(`${BASE}/${id}`).then(() => undefined),
}