// ─── Paginación ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  statusCode: number
}

// ─── Entidades del dominio (esqueletos — cada rama las completa) ──────────────
export interface Materia {
  id: number
  nombre: string
  clave: string
  creditos: number
  createdAt: string
}

export interface Grupo {
  id: number
  nombre: string
  materiaId: number
  materia?: Materia
  createdAt: string
}

export interface Alumno {
  id: number
  nombre: string
  apellido: string
  matricula: string
  email: string
  grupoId?: number
  createdAt: string
}

export interface Equipo {
  id: number
  nombre: string
  grupoId: number
  grupo?: Grupo
  alumnos?: Alumno[]
  createdAt: string
}

export interface Exposicion {
  id: number
  tema: string
  fecha: string
  equipoId: number
  equipo?: Equipo
  createdAt: string
}

export interface Criterio {
  id: number
  descripcion: string
  ponderacion: number
}

export interface Rubrica {
  id: number
  nombre: string
  criterios: Criterio[]
}

export interface Evaluacion {
  id: number
  exposicionId: number
  rubricaId: number
  calificaciones: { criterioId: number; puntaje: number }[]
  promedio: number
  createdAt: string
}
