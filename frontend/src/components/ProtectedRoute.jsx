import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { token, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return children
}
