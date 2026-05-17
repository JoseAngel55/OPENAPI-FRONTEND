export interface Exposicion {
  id_exposicion: number
  titulo: string
  fecha_exposicion: string
  descripcion?: string
  id_equipo: number
  id_rubrica: number
  nombre_equipo?: string
}

export interface ExposicionInput {
  id_equipo: number
  id_rubrica: number
  titulo: string
  fecha_exposicion: string
  descripcion?: string
}

export interface PagedExposiciones {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Exposicion[]
}

export interface ExposicionesFiltros {
  search: string
  page: number
  size: number
}