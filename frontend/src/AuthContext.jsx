import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('btrans-token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('btrans-user')
    return saved ? JSON.parse(saved) : null
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!token) {
      setReady(true)
      return
    }
    api
      .me(token)
      .then(({ user }) => setUser(user))
      .catch(() => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('btrans-token')
        localStorage.removeItem('btrans-user')
      })
      .finally(() => setReady(true))
    // Only needs to run once on mount to validate a persisted token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('btrans-token', token)
    localStorage.setItem('btrans-user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const register = async (name, email, password) => {
    const { token, user } = await api.register(name, email, password)
    localStorage.setItem('btrans-token', token)
    localStorage.setItem('btrans-user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('btrans-token')
    localStorage.removeItem('btrans-user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, ready, login, register, logout }), [token, user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
