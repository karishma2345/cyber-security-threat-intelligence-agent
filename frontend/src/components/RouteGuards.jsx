import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function RequireUser({ children }) {
  const { token, role } = useAuth()
  if (!token || role !== 'user') return <Navigate to="/login" replace />
  return children
}

export function RequireAdmin({ children }) {
  const { token, role } = useAuth()
  if (!token || role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}
