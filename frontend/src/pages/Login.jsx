import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div style={{
      minHeight: '100svh',
      background: '#F2F8FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Roboto, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            background: '#1C3F39',
            borderRadius: 14,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>N</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#01323F' }}>
            NLC Job Card System
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#505D7B' }}>
            Neelkamal Group · Warehouse Operations
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #DDE8EC',
          boxShadow: '0 2px 12px rgba(11,29,58,0.07)',
          padding: 32,
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 600, color: '#01323F' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#01323F', marginBottom: 6 }}>
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
                  border: '1px solid #DDE8EC',
                  borderRadius: 8,
                  padding: '0 12px',
                  fontSize: 14,
                  color: '#01323F',
                  fontFamily: 'Roboto, sans-serif',
                  outline: 'none',
                  background: '#FAFBFD',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#07847F'}
                onBlur={e => e.target.style.borderColor = '#DDE8EC'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#01323F', marginBottom: 6 }}>
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
                    border: '1px solid #DDE8EC',
                    borderRadius: 8,
                    padding: '0 40px 0 12px',
                    fontSize: 14,
                    color: '#01323F',
                    fontFamily: 'Roboto, sans-serif',
                    outline: 'none',
                    background: '#FAFBFD',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#07847F'}
                  onBlur={e => e.target.style.borderColor = '#DDE8EC'}
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
                  {showPw ? <EyeOff size={16} color="#505D7B" /> : <Eye size={16} color="#505D7B" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 42,
                background: loading ? '#FFBA94' : '#FF7D44',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Roboto, sans-serif',
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


        <p style={{ textAlign: 'center', fontSize: 12, color: '#505D7B', marginTop: 20 }}>
          Built by IDC Technologies for Neelkamal Group
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
