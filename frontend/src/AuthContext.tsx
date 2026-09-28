import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api.ts'
import type { User } from './types.ts'

interface AuthContextValue {
  token: string | null
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setSession: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('btrans-token'))
  const [user, setUser] = useState<User | null>(() => {
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

  const setSession = (token: string, user: User) => {
    localStorage.setItem('btrans-token', token)
    localStorage.setItem('btrans-user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    setSession(token, user)
  }

  const logout = async () => {
    const currentToken = token
    localStorage.removeItem('btrans-token')
    localStorage.removeItem('btrans-user')
    setToken(null)
    setUser(null)
    if (currentToken) {
      try {
        await api.logout(currentToken)
      } catch {
        // best effort: client is already logged out locally even if this request fails
      }
    }
  }

  const value = useMemo(() => ({ token, user, ready, login, logout, setSession }), [token, user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
