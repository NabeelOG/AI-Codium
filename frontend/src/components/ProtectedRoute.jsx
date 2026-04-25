import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('auth_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role) {
    const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null } })()
    if (user?.role !== role) {
      return <Navigate to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
    }
  }

  return children
}
