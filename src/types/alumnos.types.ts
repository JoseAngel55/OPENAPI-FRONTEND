export interface Alumno {
  id_alumno: number
  matricula: string
  nombre: string
  apellido_pat: string   // campo real del backend
  apellido_mat?: string
  email: string
  id_grupo?: number
  nombre_grupo?: string
}

export interface AlumnoInput {
  matricula: string
  nombre: string
  apellido_pat: string   // único campo — el backend acepta apellido_pat
  email: string
  id_grupo?: number
}

export interface PagedAlumnos {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Alumno[]
}

export interface AlumnosFiltros {
  search: string
  page: number
  size: number
}