import { useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: 'Operations Center', path: '/dashboard' },
  { label: 'Live Monitor', path: '/monitor' },
  { label: 'Incidents', path: '/incidents' },
  { label: 'Agent Trace', path: '/incidents' },
  { label: 'Logs', path: '/logs' },
  { label: 'Deployments', path: '/deployments' },
  { label: 'Learning Store', path: '/learning' },
  { label: 'Demo Control', path: '/demo' },
  { label: 'Settings', path: '/settings' },
]

export default function Layout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#000',
      fontFamily: "'Geist', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      <aside style={{
        width: '210px',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <Logo size={16} />
          </div>
          {[
            { name: 'target-app', score: 0.11, status: 'ok' },
            { name: 'backend', score: 0.08, status: 'ok' },
            { name: 'agent', score: 0.06, status: 'ok' },
          ].map(svc => (
            <div key={svc.name} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 0'
            }}>
              <span style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.38)',
                fontFamily: "'Geist Mono', monospace"
              }}>{svc.name}</span>
              <span style={{
                fontSize: '11px',
                fontFamily: "'Geist Mono', monospace",
                padding: '1px 6px',
                borderRadius: '2px',
                color: svc.status === 'ok' ? '#22c55e' : svc.status === 'warn' ? '#eab308' : '#ef4444',
                background: svc.status === 'ok' ? 'rgba(34,197,94,0.09)' : svc.status === 'warn' ? 'rgba(234,179,8,0.09)' : 'rgba(239,68,68,0.09)'
              }}>{svc.score}</span>
            </div>
          ))}
        </div>

        <nav style={{ padding: '10px 0', flex: 1 }}>
          {NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  borderLeft: active ? '2px solid #4A6FA5' : '2px solid transparent',
                  background: active ? 'rgba(255,255,255,0.03)' : 'transparent',
                  fontFamily: "'Geist', sans-serif",
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
              >
                {item.label}
              </div>
            )
          })}
        </nav>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(74,111,165,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: '#4A6FA5',
            fontWeight: 600,
            flexShrink: 0
          }}>{initials}</div>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'Geist Mono', monospace",
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{user?.name || 'User'}</span>
          <span
            onClick={logout}
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontFamily: "'Geist Mono', monospace",
              letterSpacing: '0.04em',
              transition: 'color 150ms ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
          >logout</span>
        </div>
      </aside>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0
      }}>
        <div style={{
          padding: '12px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: "'Geist Mono', monospace"
          }}>{title}</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: "'Geist Mono', monospace",
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'liveblink 2s ease-in-out infinite'
              }} />
              Live
            </div>
            <span>Updated 2s ago</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        @keyframes liveblink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}