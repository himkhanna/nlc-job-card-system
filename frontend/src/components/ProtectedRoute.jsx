import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards a route (or layout route) behind authentication.
 * - When used as a layout route element (no children): renders <Outlet />
 * - When used wrapping explicit children: renders children
 * - roles: optional array of allowed roles e.g. ['admin'] or ['admin','supervisor']
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children ?? <Outlet />
}
