// Entrada exacta del OpenAPI
export interface EvaluacionInput {
  id_exposicion: number
  id_alumno_evaluador: number
  detalles: DetalleInput[]
}

export interface DetalleInput {
  id_criterio: number
  calificacion: number  // 0 – 10
}

// Respuesta exacta del OpenAPI
export interface Evaluacion {
  id_evaluacion: number
  id_exposicion: number
  id_alumno_evaluador: number
  calificacion_final: number
  fecha_registro: string
  detalles: DetalleEvaluacion[]
}

export interface DetalleEvaluacion {
  id_criterio: number
  nombre_criterio: string
  calificacion: number
}

// Criterio de rúbrica
export interface Criterio {
  id_criterio: number
  nombre_criterio: string
  descripcion?: string
}

export interface PagedEvaluaciones {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Evaluacion[]
}