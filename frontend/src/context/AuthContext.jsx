import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cti_token') || null)
  const [role, setRole] = useState(localStorage.getItem('cti_role') || null)
  const [username, setUsername] = useState(localStorage.getItem('cti_username') || null)

  const persist = (t, r, u) => {
    localStorage.setItem('cti_token', t)
    localStorage.setItem('cti_role', r)
    localStorage.setItem('cti_username', u)
    setToken(t); setRole(r); setUsername(u)
  }

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload)
    persist(data.access_token, data.role, data.username)
    return data
  }, [])

  const login = useCallback(async (usernameVal, password) => {
    const { data } = await api.post('/auth/login', { username: usernameVal, password })
    persist(data.access_token, data.role, data.username)
    return data
  }, [])

  const adminLogin = useCallback(async (usernameVal, password) => {
    const { data } = await api.post('/auth/admin/login', { username: usernameVal, password })
    persist(data.access_token, data.role, data.username)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cti_token')
    localStorage.removeItem('cti_role')
    localStorage.removeItem('cti_username')
    setToken(null); setRole(null); setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, role, username, signup, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
