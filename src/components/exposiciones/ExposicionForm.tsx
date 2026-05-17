import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Exposicion } from '@/types/exposiciones.types'

const schema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  fecha_exposicion: z.string().min(1, 'La fecha es requerida'),
  id_equipo: z.number({ coerce: true, invalid_type_error: 'Selecciona un equipo' }).positive('Selecciona un equipo'),
  id_rubrica: z.number({ coerce: true, invalid_type_error: 'Requerido' }).positive('ID de rúbrica inválido'),
  descripcion: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface ExposicionFormProps {
  initial?: Exposicion | null
  // ✅ FIX: recibe lista de equipos para dropdown
  equipos: { id_equipo: number; nombre_equipo: string; nombre_grupo?: string }[]
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function ExposicionForm({ initial, equipos, onSubmit, loading, onCancel }: ExposicionFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    reset(initial
      ? {
          titulo:           initial.titulo,
          fecha_exposicion: initial.fecha_exposicion.slice(0, 16),
          id_equipo:        initial.id_equipo,
          id_rubrica:       initial.id_rubrica,
          descripcion:      initial.descripcion ?? '',
        }
      : { titulo: '', fecha_exposicion: '', id_equipo: undefined as any, id_rubrica: undefined as any, descripcion: '' }
    )
  }, [initial, reset])

  const field = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white'
  const lbl   = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'
  const err   = 'mt-1 text-xs text-red-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="titulo">Título de la exposición *</label>
        <input id="titulo" {...register('titulo')} className={field}
          aria-invalid={!!errors.titulo} placeholder="Ej. Patrones de diseño en REST" />
        {errors.titulo && <p className={err} role="alert">{errors.titulo.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="fecha_exposicion">Fecha y hora *</label>
        <input id="fecha_exposicion" type="datetime-local" {...register('fecha_exposicion')} className={field}
          aria-invalid={!!errors.fecha_exposicion} />
        {errors.fecha_exposicion && <p className={err} role="alert">{errors.fecha_exposicion.message}</p>}
      </div>

      {/* ✅ FIX: Dropdown de equipos en lugar de input numérico */}
      <div>
        <label className={lbl} htmlFor="id_equipo">Equipo *</label>
        <select id="id_equipo" {...register('id_equipo')} className={field} aria-invalid={!!errors.id_equipo}>
          <option value="">Selecciona un equipo</option>
          {equipos.map((eq) => (
            <option key={eq.id_equipo} value={eq.id_equipo}>
              {eq.nombre_equipo}{eq.nombre_grupo ? ` — ${eq.nombre_grupo}` : ''}
            </option>
          ))}
        </select>
        {errors.id_equipo && <p className={err} role="alert">{errors.id_equipo.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="id_rubrica">ID de rúbrica *</label>
        <input id="id_rubrica" type="number" {...register('id_rubrica')} className={field}
          aria-invalid={!!errors.id_rubrica} placeholder="ID de rúbrica" />
        {errors.id_rubrica && <p className={err} role="alert">{errors.id_rubrica.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="descripcion">Descripción (opcional)</label>
        <textarea id="descripcion" {...register('descripcion')} className={`${field} resize-none`}
          rows={3} placeholder="Descripción breve de la exposición" />
        {errors.descripcion && <p className={err} role="alert">{errors.descripcion.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}