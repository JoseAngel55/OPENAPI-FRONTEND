import { useState } from 'react'
import {  CheckCircle2, Loader2, Star, Award } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useRegistrarEvaluacion } from '@/hooks/useEvaluaciones'
import { evaluacionesService } from '@/services/evaluaciones.service'
import { exposicionesService } from '@/services/exposiciones.service'
import { alumnosService } from '@/services/alumnos.service'
import RubricaEvaluacion from '@/components/evaluaciones/RubricaEvaluacion'
import type { Criterio } from '@/types/evaluaciones.types'

const CRITERIOS_DEMO: Criterio[] = [
  { id_criterio: 1, nombre_criterio: 'Dominio del tema',         descripcion: 'Conocimiento y manejo del contenido expuesto' },
  { id_criterio: 2, nombre_criterio: 'Claridad en la exposición', descripcion: 'Comunicación clara y ordenada de las ideas' },
  { id_criterio: 3, nombre_criterio: 'Material de apoyo',         descripcion: 'Calidad y pertinencia del material presentado' },
]

type EvalResult = {
  id_evaluacion: number
  calificacion_final: number
  fecha_registro: string
}

export default function EvaluacionesPage() {
  const [resultado, setResultado]         = useState<EvalResult | null>(null)
  const [idExposicion, setIdExposicion]   = useState<number | ''>('')
  const [idAlumno, setIdAlumno]           = useState<number | ''>('')
  const registrar = useRegistrarEvaluacion()

  // ✅ FIX: Cargar exposiciones disponibles como dropdown
  const { data: exposicionesData } = useQuery({
    queryKey: ['exposiciones-eval-select'],
    queryFn: () => exposicionesService.listar({ page: 0, size: 100, search: '' }),
  })
  const exposiciones = exposicionesData?.content ?? []

  // ✅ FIX: Cargar alumnos disponibles como dropdown
  const { data: alumnosData } = useQuery({
    queryKey: ['alumnos-eval-select'],
    queryFn: () => alumnosService.listar({ page: 0, size: 100 }),
  })
  const alumnos = alumnosData?.content ?? []

  // Cuando se elige exposicion, intentar cargar criterios dinámicos
  const { data: criteriosDinamicos, isLoading: critLoading } = useQuery({
    queryKey: ['criterios', idExposicion],
    queryFn: () => evaluacionesService.obtenerCriterios(idExposicion as number),
    enabled: !!idExposicion,
    retry: false,
  })

  const criterios = criteriosDinamicos ?? CRITERIOS_DEMO

  const handleSubmit = async (data: {
    id_exposicion: number
    id_alumno_evaluador: number
    detalles: { id_criterio: number; calificacion: number }[]
  }) => {
    const payload = {
      id_exposicion:       idExposicion ? (idExposicion as number) : data.id_exposicion,
      id_alumno_evaluador: idAlumno     ? (idAlumno as number)     : data.id_alumno_evaluador,
      detalles: data.detalles,
    }
    const res = await registrar.mutateAsync(payload)
    setResultado({
      id_evaluacion:      res.id_evaluacion,
      // ✅ FIX: calificacion_final viene del backend como calificacion_total o calificacion_final
      calificacion_final: res.calificacion_final ?? (res as any).calificacion_total ?? 0,
      fecha_registro:     res.fecha_registro ?? new Date().toISOString(),
    })
  }

  const handleNueva = () => {
    setResultado(null)
    setIdExposicion('')
    setIdAlumno('')
  }

  const promedioColor = (n: number) =>
    n >= 8 ? 'text-emerald-600' : n >= 6 ? 'text-amber-500' : 'text-red-500'

  const promedioLabel = (n: number) =>
    n >= 9 ? 'Excelente' : n >= 8 ? 'Muy bien' : n >= 7 ? 'Bien' : n >= 6 ? 'Suficiente' : 'Reprobado'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Evaluaciones</h1>
        <p className="text-sm text-slate-500">Registro de evaluación con rúbrica</p>
      </div>

      {/* ✅ FIX: Resultado post-registro CON calificación bien mostrada */}
      {resultado && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">¡Evaluación registrada!</h2>
            <p className="text-sm text-slate-500 mt-1">
              ID de evaluación: <span className="font-semibold text-slate-700">#{resultado.id_evaluacion}</span>
            </p>
          </div>

          {/* Calificación grande y clara */}
          <div className="rounded-2xl bg-white border border-emerald-200 px-10 py-6 flex flex-col items-center gap-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className={promedioColor(resultado.calificacion_final)} />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calificación final</span>
            </div>
            <span className={`text-6xl font-black tabular-nums ${promedioColor(resultado.calificacion_final)}`}>
              {Number(resultado.calificacion_final).toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${promedioColor(resultado.calificacion_final)}`}>
              {promedioLabel(resultado.calificacion_final)}
            </span>
            <span className="text-xs text-slate-400 mt-1">sobre 10.00</span>
          </div>

          <button
            onClick={handleNueva}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Registrar otra evaluación
          </button>
        </div>
      )}

      {!resultado && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Contexto */}
          <div className="border-b border-slate-100 bg-indigo-50/50 px-6 py-4 rounded-t-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contexto de la evaluación
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              {/* ✅ FIX: Dropdown de exposiciones */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="ctx_expo">
                  Exposición
                </label>
                <select
                  id="ctx_expo"
                  value={idExposicion}
                  onChange={(e) => setIdExposicion(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Selecciona una exposición</option>
                  {exposiciones.map((expo) => (
                    <option key={expo.id_exposicion} value={expo.id_exposicion}>
                      {expo.titulo} — {new Date(expo.fecha_exposicion).toLocaleDateString('es-MX')}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ FIX: Dropdown de alumnos */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="ctx_alumno">
                  Alumno evaluador
                </label>
                <select
                  id="ctx_alumno"
                  value={idAlumno}
                  onChange={(e) => setIdAlumno(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Selecciona un alumno</option>
                  {alumnos.map((a) => (
                    <option key={a.id_alumno} value={a.id_alumno}>
                      {a.matricula} — {a.nombre} {a.apellido_pat ?? ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {idExposicion && critLoading && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={12} className="animate-spin" /> Cargando criterios de la exposición…
              </div>
            )}

            {idExposicion && !critLoading && !criteriosDinamicos && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  Usando criterios de demostración. Cuando el backend exponga{' '}
                  <code className="font-mono">GET /criterios</code>, se cargarán dinámicamente.
                </p>
              </div>
            )}
          </div>

          {/* Rúbrica */}
          <div className="px-6 py-5">
            <RubricaEvaluacion
              criterios={criterios}
              criteriosLoading={critLoading && !!idExposicion}
              onSubmit={(data) => handleSubmit({
                ...data,
                id_exposicion:       idExposicion ? (idExposicion as number) : data.id_exposicion,
                id_alumno_evaluador: idAlumno     ? (idAlumno as number)     : data.id_alumno_evaluador,
              })}
              loading={registrar.isPending}
              disableSubmit={!idExposicion || !idAlumno}
            />
          </div>
        </div>
      )}
    </div>
  )
}