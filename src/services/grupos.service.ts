import api from './api'

export interface Grupo {
  id_grupo: number
  nombre_grupo: string
  semestre: string
  id_materia: number
  nombre_materia: string
  alumnos: any[]
}

export interface GruposParams {
  page?: number
  size?: number
  nombre?: string
}

export interface PagedGrupos {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Grupo[]
}

export interface GrupoInput {
  nombre_grupo: string
  semestre: string
  id_materia: number
}

export const gruposService = {
  listar: (params: GruposParams = {}) =>
    api.get<PagedGrupos>('/grupos', { params }).then((r) => r.data),

  obtener: (id: number) =>
    api.get<Grupo>(`/grupos/${id}`).then((r) => r.data),

  crear: (body: GrupoInput) =>
    api.post<Grupo>('/grupos', body).then((r) => r.data),

  actualizar: (id: number, body: GrupoInput) =>
    api.put<Grupo>(`/grupos/${id}`, body).then((r) => r.data),

  // ✅ FIX: endpoint para eliminar grupo
  eliminar: (id: number) =>
    api.delete(`/grupos/${id}`).then(() => undefined),
}