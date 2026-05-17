import api from './api'

export interface Materia {
  id_materia: number
  clave_materia: string
  nombre_materia: string
}

export interface MateriasParams {
  page?: number
  size?: number
  nombre?: string
}

export interface PagedMaterias {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Materia[]
}

export interface MateriaInput {
  clave_materia: string
  nombre_materia: string
}

export const materiasService = {
  listar: (params: MateriasParams = {}) =>
    api.get<PagedMaterias>('/materias', { params }).then((r) => r.data),

  obtener: (id: number) =>
    api.get<Materia>(`/materias/${id}`).then((r) => r.data),

  crear: (body: MateriaInput) =>
    api.post<Materia>('/materias', body).then((r) => r.data),

  actualizar: (id: number, body: MateriaInput) =>
    api.put<Materia>(`/materias/${id}`, body).then((r) => r.data),

  eliminar: (id: number) =>
    api.delete(`/materias/${id}`),
}