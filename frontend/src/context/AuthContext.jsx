import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const AuthContext = createContext(null)

const STORAGE_KEY = 'nlc_auth'

// Demo users for offline dev
const DEMO_USERS = {
  'admin@nlc.demo': {
    id: '33333333-0000-0000-0000-000000000001',
    email: 'admin@nlc.demo',
    name: 'Admin User',
    role: 'admin',
    warehouses: [],
  },
  'supervisor@nlc.demo': {
    id: '33333333-0000-0000-0000-000000000002',
    email: 'supervisor@nlc.demo',
    name: 'Supervisor User',
    role: 'supervisor',
    warehouses: ['11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002'],
  },
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const persist = useCallback((data) => {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setAuth(data)
  }, [])

  const login = useCallback(async (email, password) => {
    // Try real API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        persist({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        })
        return { ok: true }
      }
    } catch {
      // API not running — fall back to demo auth
    }

    // Demo fallback
    const demo = DEMO_USERS[email.toLowerCase()]
    if (demo && password === 'NLC@demo2025') {
      persist({
        accessToken: 'demo-token',
        refreshToken: 'demo-refresh',
        user: demo,
      })
      return { ok: true }
    }

    return { ok: false, error: 'Invalid email or password' }
  }, [persist])

  const logout = useCallback(async () => {
    if (auth?.accessToken && auth.accessToken !== 'demo-token') {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: JSON.stringify({ refreshToken: auth.refreshToken }),
        })
      } catch {
        // ignore
      }
    }
    queryClient.clear()
    persist(null)
  }, [auth, persist, queryClient])

  const refreshToken = useCallback(async () => {
    if (!auth?.refreshToken || auth.accessToken === 'demo-token') return false
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      })
      if (res.ok) {
        const data = await res.json()
        persist({
          ...auth,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
        return true
      }
    } catch {
      // ignore
    }
    persist(null)
    return false
  }, [auth, persist])

  // Auto-refresh: check every 5 minutes if token expires < 10 min from now
  useEffect(() => {
    if (!auth?.accessToken || auth.accessToken === 'demo-token') return
    const interval = setInterval(() => {
      try {
        const [, payload] = auth.accessToken.split('.')
        const { exp } = JSON.parse(atob(payload))
        const expiresIn = exp * 1000 - Date.now()
        if (expiresIn < 10 * 60 * 1000) refreshToken()
      } catch {
        // ignore malformed token
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [auth, refreshToken])

  return (
    <AuthContext.Provider value={{
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      isAuthenticated: !!auth,
      isAdmin: auth?.user?.role === 'admin',
      isSupervisor: ['admin', 'supervisor'].includes(auth?.user?.role),
      login,
      logout,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
