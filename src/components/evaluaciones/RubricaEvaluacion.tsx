import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Star } from 'lucide-react'
import type { Criterio } from '@/types/evaluaciones.types'

function buildSchema(criterios: Criterio[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  criterios.forEach((c) => {
    shape[`criterio_${c.id_criterio}`] = z
      .number({ coerce: true, invalid_type_error: 'Ingresa un valor' })
      .min(0, 'Mínimo 0').max(10, 'Máximo 10')
  })
  return z.object(shape)
}

function CalificacionSlider({ value, onChange, error, label, descripcion }: {
  value: number; onChange: (v: number) => void; error?: string; label: string; descripcion?: string
}) {
  const color = value >= 8 ? 'text-emerald-600' : value >= 6 ? 'text-amber-500' : 'text-red-500'
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {descripcion && <p className="text-xs text-slate-400 mt-0.5">{descripcion}</p>}
        </div>
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{Number(value).toFixed(1)}</span>
      </div>
      <input type="range" min={0} max={10} step={0.5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Calificación para ${label}`}
        className="w-full accent-indigo-600 cursor-pointer" />
      <div className="flex justify-between text-xs text-slate-400">
        <span>0 — Deficiente</span><span>5 — Regular</span><span>10 — Excelente</span>
      </div>
      <input type="number" min={0} max={10} step={0.5} value={value}
        onChange={(e) => onChange(Math.min(10, Math.max(0, Number(e.target.value))))}
        className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        aria-label={`Valor numérico para ${label}`} />
      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  )
}

interface RubricaEvaluacionProps {
  criterios: Criterio[]
  criteriosLoading: boolean
  onSubmit: (data: { id_exposicion: number; id_alumno_evaluador: number; detalles: { id_criterio: number; calificacion: number }[] }) => void
  loading?: boolean
  // ✅ FIX: prop para deshabilitar submit cuando faltan selecciones externas
  disableSubmit?: boolean
}

export default function RubricaEvaluacion({ criterios, criteriosLoading, onSubmit, loading, disableSubmit }: RubricaEvaluacionProps) {
  const schema = buildSchema(criterios)
  type FormValues = z.infer<typeof schema>

  const defaultValues: Record<string, number> = {}
  criterios.forEach((c) => { defaultValues[`criterio_${c.id_criterio}`] = 5.0 })

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  // Reset cuando cambien los criterios
  useEffect(() => {
    const dv: Record<string, number> = {}
    criterios.forEach((c) => { dv[`criterio_${c.id_criterio}`] = 5.0 })
    reset(dv as any)
  }, [criterios, reset])

  const values   = watch()
  const promedio = criterios.length > 0
    ? criterios.reduce((s, c) => s + (Number(values[`criterio_${c.id_criterio}`]) || 0), 0) / criterios.length
    : 0

  const promedioColor = promedio >= 8 ? 'text-emerald-600' : promedio >= 6 ? 'text-amber-500' : 'text-red-500'

  return (
    <form onSubmit={handleSubmit((data) => {
      onSubmit({
        id_exposicion:       0, // se sobreescribe desde el padre
        id_alumno_evaluador: 0, // se sobreescribe desde el padre
        detalles: criterios.map((c) => ({ id_criterio: c.id_criterio, calificacion: Number(data[`criterio_${c.id_criterio}`]) })),
      })
    })} noValidate className="space-y-5">

      <div>
        <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Criterios de evaluación
        </p>
        {criteriosLoading && (
          <div className="flex items-center gap-2 py-6 text-slate-400">
            <Loader2 size={16} className="animate-spin" /><span className="text-sm">Cargando criterios…</span>
          </div>
        )}
        {!criteriosLoading && criterios.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <Star size={20} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Selecciona una exposición para cargar los criterios</p>
          </div>
        )}
        {!criteriosLoading && criterios.length > 0 && (
          <div className="space-y-3">
            {criterios.map((c) => (
              <Controller key={c.id_criterio} name={`criterio_${c.id_criterio}` as any} control={control}
                render={({ field: f, fieldState }) => (
                  <CalificacionSlider label={c.nombre_criterio} descripcion={c.descripcion}
                    value={Number(f.value) || 0} onChange={f.onChange} error={fieldState.error?.message} />
                )} />
            ))}
          </div>
        )}
      </div>

      {/* ✅ FIX: Calificación estimada siempre visible */}
      {criterios.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Calificación estimada</span>
          <span className={`text-3xl font-bold tabular-nums ${promedioColor}`}>{promedio.toFixed(2)}</span>
        </div>
      )}

      {/* ✅ FIX: botón deshabilitado si faltan exposición o alumno */}
      {disableSubmit && (
        <p className="text-xs text-amber-600 text-center">
          Selecciona la exposición y el alumno evaluador para continuar
        </p>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <button type="submit"
          disabled={loading || criterios.length === 0 || disableSubmit}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Registrando…' : 'Registrar evaluación'}
        </button>
      </div>
    </form>
  )
}