import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { gruposService } from '@/services/grupos.service'
import type { Alumno } from '@/types/alumnos.types'

const schema = z.object({
  matricula: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones'),
  nombre:       z.string().min(2, 'Mínimo 2 caracteres').max(80),
  apellido_pat: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  email:        z.string().email('Correo inválido'),
  id_grupo:     z.coerce.number().positive().optional(),
})

type FormValues = z.infer<typeof schema>

interface AlumnoFormProps {
  initial?: Alumno | null
  onSubmit: (values: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function AlumnoForm({ initial, onSubmit, loading, onCancel }: AlumnoFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Cargar grupos siempre al montar, sin `enabled` condicional
  const { data: gruposData } = useQuery({
    queryKey: ['grupos-alumno-select'],
    queryFn: () => gruposService.listar({ page: 0, size: 200 }),
    staleTime: 1000 * 60 * 5,
  })
  const grupos = gruposData?.content ?? []

  useEffect(() => {
    if (initial) {
      reset({
        matricula:    initial.matricula,
        nombre:       initial.nombre,
        apellido_pat: initial.apellido_pat,
        email:        initial.email,
        id_grupo:     initial.id_grupo ?? undefined,
      })
    } else {
      reset({
        matricula:    '',
        nombre:       '',
        apellido_pat: '',
        email:        '',
        id_grupo:     undefined,
      })
    }
  }, [initial, reset])

  const field  = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'
  const lbl    = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'
  const errCls = 'mt-1 text-xs text-red-500'
  console.log('gruposData:', gruposData)
  console.log('grupos:', grupos)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="matricula">Matrícula *</label>
        <input
          id="matricula"
          {...register('matricula')}
          className={field}
          aria-invalid={!!errors.matricula}
          placeholder="Ej. 21CS001"
          readOnly={!!initial}
          style={initial ? { backgroundColor: '#f8fafc', cursor: 'not-allowed' } : {}}
        />
        {errors.matricula && <p className={errCls} role="alert">{errors.matricula.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl} htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            {...register('nombre')}
            className={field}
            aria-invalid={!!errors.nombre}
            placeholder="Nombre(s)"
          />
          {errors.nombre && <p className={errCls} role="alert">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="apellido_pat">Apellido *</label>
          <input
            id="apellido_pat"
            {...register('apellido_pat')}
            className={field}
            aria-invalid={!!errors.apellido_pat}
            placeholder="Apellido(s)"
          />
          {errors.apellido_pat && <p className={errCls} role="alert">{errors.apellido_pat.message}</p>}
        </div>
      </div>

      <div>
        <label className={lbl} htmlFor="email">Correo electrónico *</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={field}
          aria-invalid={!!errors.email}
          placeholder="alumno@universidad.edu"
        />
        {errors.email && <p className={errCls} role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="id_grupo">Grupo (opcional)</label>
        <select id="id_grupo" {...register('id_grupo')} className={field}>
          <option value="">Sin grupo asignado</option>
          {grupos.map((g) => (
            <option key={g.id_grupo} value={g.id_grupo}>
              {g.nombre_grupo} — {g.nombre_materia} ({g.semestre})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}