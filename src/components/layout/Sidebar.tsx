import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  UsersRound,
  Presentation,
  ClipboardCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin','docente','alumno'] },
  { to: '/materias',     label: 'Materias',     icon: BookOpen,        roles: ['admin'] },
  { to: '/grupos',       label: 'Grupos',       icon: Users,           roles: ['admin','docente'] },
  { to: '/alumnos',      label: 'Alumnos',      icon: GraduationCap,   roles: ['admin','docente'] },
  { to: '/equipos',      label: 'Equipos',      icon: UsersRound,      roles: ['admin','docente','alumno'] },
  { to: '/exposiciones', label: 'Exposiciones', icon: Presentation,    roles: ['admin','docente','alumno'] },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck,  roles: ['admin','docente','alumno'] },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.rol ?? 'alumno'

  const visible = navItems.filter((item) =>
    item.roles.includes(role),
  )

  return (
    <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <span className="text-lg font-bold text-primary-700">
          📋 Evaluaciones
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-900 truncate">{user.nombre}</p>
          <p className="text-xs text-gray-500 capitalize">{user.rol}</p>
        </div>
      )}
    </aside>
  )
}
