export interface Equipo {
  id_equipo: number
  nombre_equipo: string
  id_grupo: number
  nombre_grupo?: string
  total_integrantes?: number
}

export interface EquipoInput {
  id_grupo: number
  nombre_equipo: string
  id_alumno_creador: number
  id_alumnos?: number[]
}

export interface EquiposFiltros {
  id_grupo?: number
}