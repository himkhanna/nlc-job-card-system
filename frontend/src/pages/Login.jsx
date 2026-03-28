import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const DEMO_USERS = [
  { email: 'admin@nlc.demo',      role: 'Admin',      warehouses: 'All warehouses' },
  { email: 'supervisor@nlc.demo', role: 'Supervisor',  warehouses: 'DXB-WH1, DXB-WH2' },
]

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password.')
      return
    }
    setLoading(true)
    const { ok, error } = await login(email, password)
    if (ok) {
      toast.success(`Welcome back!`)
      const from = location.state?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } else {
      toast.error(error ?? 'Invalid credentials.')
    }
    setLoading(false)
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail)
    setPassword('NLC@demo2025')
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: '#F4F6FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            background: '#0B1D3A',
            borderRadius: 14,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>N</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1A2440' }}>
            NLC Job Card System
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7A94' }}>
            Neelkamal Group · Warehouse Operations
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #E8ECF2',
          boxShadow: '0 2px 12px rgba(11,29,58,0.07)',
          padding: 32,
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 600, color: '#1A2440' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1A2440', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@nlc.demo"
                autoComplete="email"
                style={{
                  width: '100%',
                  height: 40,
                  border: '1px solid #E8ECF2',
                  borderRadius: 8,
                  padding: '0 12px',
                  fontSize: 14,
                  color: '#1A2440',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  background: '#FAFBFD',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#1565C0'}
                onBlur={e => e.target.style.borderColor = '#E8ECF2'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1A2440', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #E8ECF2',
                    borderRadius: 8,
                    padding: '0 40px 0 12px',
                    fontSize: 14,
                    color: '#1A2440',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    background: '#FAFBFD',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1565C0'}
                  onBlur={e => e.target.style.borderColor = '#E8ECF2'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} color="#6B7A94" /> : <Eye size={16} color="#6B7A94" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 42,
                background: loading ? '#FFB380' : '#FF6B00',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div style={{
          marginTop: 20,
          background: '#FFF8E1',
          border: '1px solid #FFE082',
          borderRadius: 10,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <FlaskConical size={14} color="#F57F17" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#7B5800' }}>DEMO ACCOUNTS — click to fill</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                onClick={() => fillDemo(u.email)}
                style={{
                  background: '#fff',
                  border: '1px solid #FFE082',
                  borderRadius: 7,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2440', fontFamily: 'DM Mono, monospace' }}>
                    {u.email}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7A94', marginTop: 1 }}>
                    {u.warehouses}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: u.role === 'Admin' ? '#1565C0' : '#2E7D32',
                  background: u.role === 'Admin' ? '#E3F0FF' : '#E8F5E9',
                  padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
                }}>
                  {u.role.toUpperCase()}
                </span>
              </button>
            ))}
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9E6B00', textAlign: 'center' }}>
              Password for all: <code style={{ fontFamily: 'DM Mono, monospace' }}>NLC@demo2025</code>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7A94', marginTop: 20 }}>
          Built by IDC Technologies for Neelkamal Group
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
