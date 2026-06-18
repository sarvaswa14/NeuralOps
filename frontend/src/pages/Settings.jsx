import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

export default function Settings() {
  const { user, logout } = useAuth()

  return (
    <Layout title="Settings">
      <div style={{ padding: '32px 40px', maxWidth: '560px' }}>

        <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '16px' }}>Account</div>
          {[
            { label: 'Name', value: user?.name || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Role', value: user?.role || 'engineer' },
            { label: 'Auth Provider', value: user?.provider || 'local' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', ...mono, width: '160px', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', ...sans }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', ...sans, marginBottom: '5px' }}>Sign out</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono }}>You will be redirected to the login page.</div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '9px 22px', fontSize: '12px', ...mono,
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', cursor: 'pointer', borderRadius: '2px',
              letterSpacing: '0.06em', transition: 'all 150ms ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          >sign out</button>
        </div>

      </div>
    </Layout>
  )
}