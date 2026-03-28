import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const AuthContext = createContext(null)

const STORAGE_KEY = 'nlc_auth'

// In development, Vite proxies /api → http://localhost:5144
// In production, VITE_API_BASE_URL should be the backend base URL
const API = import.meta.env.VITE_API_BASE_URL ?? ''

// Demo users for offline dev (when backend is unavailable)
const DEMO_USERS = {
  'admin@nlc.demo': {
    id: '33333333-0000-0000-0000-000000000001',
    email: 'admin@nlc.demo',
    name: 'Admin User',
    role: 'admin',
    assignedWarehouseIds: [],
  },
  'supervisor@nlc.demo': {
    id: '33333333-0000-0000-0000-000000000002',
    email: 'supervisor@nlc.demo',
    name: 'Supervisor User',
    role: 'supervisor',
    assignedWarehouseIds: ['11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002'],
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
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        persist({
          accessToken:  data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt:    data.expiresAt,
          user:         data.user,
          isDemo:       false,
        })
        return { ok: true }
      }
      if (res.status === 401) {
        return { ok: false, error: 'Invalid email or password' }
      }
    } catch {
      // API not reachable — fall through to demo auth
    }

    // Demo fallback (offline dev mode)
    const demo = DEMO_USERS[email.toLowerCase()]
    if (demo && password === 'NLC@demo2025') {
      persist({
        accessToken:  'demo-token',
        refreshToken: 'demo-refresh',
        expiresAt:    null,
        user:         demo,
        isDemo:       true,
      })
      return { ok: true }
    }

    return { ok: false, error: 'Invalid email or password' }
  }, [persist])

  const logout = useCallback(async () => {
    if (auth?.accessToken && !auth.isDemo) {
      try {
        await fetch(`${API}/api/auth/logout`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
    if (!auth?.refreshToken || auth.isDemo) return false
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      })
      if (res.ok) {
        const data = await res.json()
        persist({ ...auth, accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt })
        return true
      }
    } catch {
      // ignore
    }
    persist(null)
    return false
  }, [auth, persist])

  // Auto-refresh: check every 5 minutes, refresh if token expires < 10 min from now
  useEffect(() => {
    if (!auth?.accessToken || auth.isDemo) return
    const tick = () => {
      try {
        const [, payload] = auth.accessToken.split('.')
        const { exp } = JSON.parse(atob(payload))
        if (exp * 1000 - Date.now() < 10 * 60 * 1000) refreshToken()
      } catch { /* malformed token — ignore */ }
    }
    const id = setInterval(tick, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [auth, refreshToken])

  return (
    <AuthContext.Provider value={{
      user:            auth?.user ?? null,
      accessToken:     auth?.accessToken ?? null,
      isAuthenticated: !!auth,
      isDemo:          auth?.isDemo ?? false,
      isAdmin:         auth?.user?.role === 'admin',
      isSupervisor:    ['admin', 'supervisor'].includes(auth?.user?.role),
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
