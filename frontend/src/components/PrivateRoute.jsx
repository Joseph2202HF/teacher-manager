import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute — redirige vers /login si non authentifié
 */
export default function PrivateRoute() {
  const { isAuth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
          <p className="text-[#8892a4] text-sm">Vérification de la session…</p>
        </div>
      </div>
    )
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}
