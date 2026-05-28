import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function PrivateRoute() {
  const { isAuthenticated, isTokenValido } = useAuthStore()

  if (!isAuthenticated || !isTokenValido()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
