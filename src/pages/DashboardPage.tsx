import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, Users, GraduationCap, UsersRound, Presentation, ClipboardCheck,
  TrendingUp, Activity,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'
import { materiasService } from '@/services/materias.service'
import { gruposService } from '@/services/grupos.service'
import { alumnosService } from '@/services/alumnos.service'
import { equiposService } from '@/services/equipos.service'
import { exposicionesService } from '@/services/exposiciones.service'

interface NavCard {
  to: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  roles: UserRole[]
}

const NAV_CARDS: NavCard[] = [
  { to: '/materias',     label: 'Materias',     description: 'Administra las materias del sistema', icon: BookOpen,       color: 'bg-blue-50 text-blue-700 border-blue-100',    roles: ['admin'] },
  { to: '/grupos',       label: 'Grupos',       description: 'Gestiona grupos por materia',          icon: Users,          color: 'bg-green-50 text-green-700 border-green-100',  roles: ['admin', 'docente'] },
  { to: '/alumnos',      label: 'Alumnos',      description: 'Consulta y administra alumnos',        icon: GraduationCap,  color: 'bg-purple-50 text-purple-700 border-purple-100', roles: ['admin', 'docente'] },
  { to: '/equipos',      label: 'Equipos',      description: 'Organiza equipos de trabajo',          icon: UsersRound,     color: 'bg-orange-50 text-orange-700 border-orange-100', roles: ['admin', 'docente', 'alumno'] },
  { to: '/exposiciones', label: 'Exposiciones', description: 'Revisa las exposiciones registradas',  icon: Presentation,   color: 'bg-pink-50 text-pink-700 border-pink-100',     roles: ['admin', 'docente', 'alumno'] },
  { to: '/evaluaciones', label: 'Evaluaciones', description: 'Registra y consulta evaluaciones',     icon: ClipboardCheck, color: 'bg-teal-50 text-teal-700 border-teal-100',     roles: ['admin', 'docente', 'alumno'] },
]

// ✅ FIX: Widget de estadística para el dashboard de admin
function StatCard({ label, value, icon: Icon, color, loading }: {
  label: string; value: number | string; icon: React.ElementType; color: string; loading?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const role = user?.rol ?? 'alumno'

  const visible = NAV_CARDS.filter((card) => card.roles.includes(role))

  // ✅ FIX: Consultas de métricas solo para admin
  const isAdmin = role === 'admin'

  const { data: materias, isLoading: loadM } = useQuery({
    queryKey: ['dashboard-materias'],
    queryFn: () => materiasService.listar({ page: 0, size: 1 }),
    enabled: isAdmin,
  })
  const { data: grupos, isLoading: loadG } = useQuery({
    queryKey: ['dashboard-grupos'],
    queryFn: () => gruposService.listar({ page: 0, size: 1 }),
    enabled: isAdmin,
  })
  const { data: alumnos, isLoading: loadA } = useQuery({
    queryKey: ['dashboard-alumnos'],
    queryFn: () => alumnosService.listar({ page: 0, size: 1 }),
    enabled: isAdmin,
  })
  const { data: equipos, isLoading: loadEq } = useQuery({
    queryKey: ['dashboard-equipos'],
    queryFn: () => equiposService.listar(),
    enabled: isAdmin,
  })
  const { data: exposiciones, isLoading: loadEx } = useQuery({
    queryKey: ['dashboard-exposiciones'],
    queryFn: () => exposicionesService.listar({ page: 0, size: 1, search: '' }),
    enabled: isAdmin,
  })

  const proximasExposiciones = exposiciones?.content?.filter(
    (e) => new Date(e.fecha_exposicion).getTime() > Date.now()
  ).length ?? 0

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500">
          Bienvenido,{' '}
          <span className="font-medium text-gray-700">{user?.nombre}</span>
          {' '}— accede a las secciones disponibles para tu rol.
        </p>
      </div>

      {/* ✅ FIX: Métricas para admin */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Resumen del sistema</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label="Materias"
              value={materias?.totalElements ?? 0}
              icon={BookOpen}
              color="bg-blue-50 text-blue-600"
              loading={loadM}
            />
            <StatCard
              label="Grupos"
              value={grupos?.totalElements ?? 0}
              icon={Users}
              color="bg-green-50 text-green-600"
              loading={loadG}
            />
            <StatCard
              label="Alumnos"
              value={alumnos?.totalElements ?? 0}
              icon={GraduationCap}
              color="bg-purple-50 text-purple-600"
              loading={loadA}
            />
            <StatCard
              label="Equipos"
              value={Array.isArray(equipos) ? equipos.length : 0}
              icon={UsersRound}
              color="bg-orange-50 text-orange-600"
              loading={loadEq}
            />
            <StatCard
              label="Próx. Exposic."
              value={loadEx ? '…' : proximasExposiciones}
              icon={TrendingUp}
              color="bg-pink-50 text-pink-600"
              loading={loadEx}
            />
          </div>
        </div>
      )}

      {/* Tarjetas de navegación */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(({ to, label, description, icon: Icon, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group text-left rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-150"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-gray-900 mb-1">{label}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}