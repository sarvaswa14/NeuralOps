import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login')
      return
    }
    localStorage.setItem('token', token)
    api.get('/api/auth/me')
      .then(res => {
        login(token, res.data.user)
        navigate('/dashboard')
      })
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login')
      })
  }, [])

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Geist Mono', monospace",
      fontSize: '12px',
      color: 'rgba(255,255,255,0.3)',
      letterSpacing: '0.08em'
    }}>
      authenticating...
    </div>
  )
}