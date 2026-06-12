import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FlowField from '../components/FlowField'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const isRegister = location.pathname === '/register'
  const [mode, setMode] = useState(isRegister ? 'register' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const res = await api.post(endpoint, payload)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') submit() }

  const oauthGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`
  }

  const oauthGithub = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`
  }

  const inputStyle = (field) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focusedField === field ? '#2563eb' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '4px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#fff',
    fontFamily: "'Geist', sans-serif",
    outline: 'none',
    letterSpacing: '0.01em',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
    transform: focusedField === field ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
  })

  const labelStyle = {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: "'Geist Mono', monospace",
    display: 'block',
    marginBottom: '7px'
  }

  const googleIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5, transition: 'opacity 150ms ease', flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,1)"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,1)"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,1)"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,1)"/>
    </svg>
  )

  const githubIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,1)" style={{ opacity: 0.5, transition: 'opacity 150ms ease', flexShrink: 0 }}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  )

  const oauthButtons = [
    { label: 'Continue with Google', onClick: oauthGoogle, icon: googleIcon },
    { label: 'Continue with GitHub', onClick: oauthGithub, icon: githubIcon },
  ]

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
      fontFamily: "'Geist', system-ui, sans-serif"
    }}>
      <FlowField count={500} trail={0.08} color='#4A6FA5' speed={0.5} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 52px',
        }}>
          <Logo size={20} onClick={() => navigate('/')} />
        </nav>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '36px 32px',
          }}>
            <div style={{
              display: 'flex',
              gap: '28px',
              marginBottom: '36px',
            }}>
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: mode === m ? 600 : 400,
                    color: mode === m ? '#fff' : 'rgba(255,255,255,0.22)',
                    fontFamily: "'Geist', sans-serif",
                    paddingBottom: '10px',
                    borderBottom: mode === m ? '2px solid #4A6FA5' : '2px solid transparent',
                    letterSpacing: '0.01em',
                    transition: 'color 200ms ease, border-color 200ms ease',
                  }}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handle}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleKey}
                    placeholder="Your name"
                    style={inputStyle('name')}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handle}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKey}
                  placeholder="you@company.com"
                  style={inputStyle('email')}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handle}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  style={inputStyle('password')}
                />
              </div>

              {error && (
                <p style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  fontFamily: "'Geist Mono', monospace",
                  letterSpacing: '0.02em',
                  margin: 0
                }}>
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em',
                  fontFamily: "'Geist', sans-serif",
                  opacity: loading ? 0.6 : 1,
                  marginTop: '4px',
                  transition: 'transform 150ms ease, background 150ms ease, box-shadow 150ms ease'
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)'
                    e.currentTarget.style.background = '#e8f0fe'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '4px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.2)',
                  fontFamily: "'Geist Mono', monospace",
                  letterSpacing: '0.08em'
                }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {oauthButtons.map(({ label, onClick, icon }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    fontFamily: "'Geist', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'border-color 150ms ease, color 150ms ease, transform 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    const svg = e.currentTarget.querySelector('svg')
                    if (svg) svg.style.opacity = '1'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    const svg = e.currentTarget.querySelector('svg')
                    if (svg) svg.style.opacity = '0.5'
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}