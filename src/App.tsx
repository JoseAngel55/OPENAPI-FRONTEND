import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'

// Lazy pages — cada módulo las implementa en su rama
import MateriasPage from '@/pages/MateriasPage'
import GruposPage from '@/pages/GruposPage'
import AlumnosPage from '@/pages/AlumnosPage'
import EquiposPage from '@/pages/EquiposPage'
import ExposicionesPage from '@/pages/ExposicionesPage'
import EvaluacionesPage from '@/pages/EvaluacionesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas con layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Cada rama activa su propia ruta descomentando aquí */}
        { <Route path="materias"    element={<MateriasPage />} /> }
        { <Route path="grupos"      element={<GruposPage />} /> }
        {<Route path="alumnos"     element={<AlumnosPage />} /> }
        {<Route path="equipos"     element={<EquiposPage />} /> }
        {<Route path="exposiciones" element={<ExposicionesPage />} /> }
        { <Route path="evaluaciones" element={<EvaluacionesPage />} /> }

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
