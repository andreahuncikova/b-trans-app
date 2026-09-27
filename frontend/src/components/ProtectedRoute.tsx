import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../AuthContext.tsx'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return children
}
