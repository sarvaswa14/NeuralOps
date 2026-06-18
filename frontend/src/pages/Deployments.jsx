import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

const statusColor = (status) => {
  const map = {
    success: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    rolled_back: { bg: 'rgba(234,179,8,0.1)', color: '#eab308' },
    in_progress: { bg: 'rgba(74,111,165,0.12)', color: '#4A6FA5' },
  }
  return map[status] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
}

const formatTime = (ts) => {
  if (!ts) return '—'
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Deployments() {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ service: 'api-server', version: '', deployedBy: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchDeployments() }, [])

  const fetchDeployments = async () => {
    try {
      const res = await api.get('/api/deployments')
      setDeployments(Array.isArray(res.data) ? res.data : res.data.deployments || [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!form.version || !form.deployedBy) return
    setSubmitting(true)
    try {
      const res = await api.post('/api/deployments', { ...form, status: 'success' })
      setDeployments(prev => [res.data, ...prev])
      setShowForm(false)
      setForm({ service: 'api-server', version: '', deployedBy: '' })
    } catch {}
    finally { setSubmitting(false) }
  }

  const handleRollback = async (id) => {
    try {
      const res = await api.post(`/api/deployments/${id}/rollback`)
      setDeployments(prev => prev.map(d => d._id === id ? res.data : d))
    } catch {}
  }

  const th = { fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', ...mono }

  return (
    <Layout title="Deployments">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono }}>{deployments.length} deployments</span>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '6px 16px', fontSize: '12px', ...mono,
              border: `1px solid ${showForm ? '#4A6FA5' : 'rgba(255,255,255,0.1)'}`,
              background: showForm ? 'rgba(74,111,165,0.08)' : 'transparent',
              color: showForm ? '#4A6FA5' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.04em',
              transition: 'all 150ms ease'
            }}
          >{showForm ? 'cancel' : '+ new deployment'}</button>
        </div>

        {showForm && (
          <div style={{
            border: '1px solid rgba(74,111,165,0.25)',
            background: 'rgba(74,111,165,0.04)',
            padding: '16px 18px',
            display: 'flex', gap: '12px', alignItems: 'flex-end', flexShrink: 0
          }}>
            {[
              { key: 'service', label: 'Service', placeholder: 'api-server' },
              { key: 'version', label: 'Version', placeholder: 'v1.2.0' },
              { key: 'deployedBy', label: 'Deployed By', placeholder: 'your name' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', ...mono }}>{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{
                    padding: '7px 10px', fontSize: '12px', ...mono,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', borderRadius: '2px', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(74,111,165,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}
            <button
              onClick={handleCreate}
              disabled={submitting}
              style={{
                padding: '7px 20px', fontSize: '12px', ...mono,
                background: '#4A6FA5', color: '#fff',
                border: 'none', borderRadius: '2px', cursor: 'pointer',
                letterSpacing: '0.04em', opacity: submitting ? 0.6 : 1
              }}
            >{submitting ? 'deploying...' : 'deploy'}</button>
          </div>
        )}

        <div style={{
          flex: 1, border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.015)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '100px 120px 1fr 140px 110px 80px',
            padding: '8px 18px', gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)', flexShrink: 0
          }}>
            {['Status', 'Version', 'Service', 'Deployed By', 'Time', 'Action'].map(h => (
              <div key={h} style={th}>{h}</div>
            ))}
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Loading...</div>
            )}
            {!loading && deployments.length === 0 && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>No deployments yet.</div>
            )}
            {deployments.map((dep, i) => {
              const sc = statusColor(dep.status)
              return (
                <div
                  key={dep._id || i}
                  style={{
                    display: 'grid', gridTemplateColumns: '100px 120px 1fr 140px 110px 80px',
                    padding: '10px 18px', gap: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
                    ...mono, letterSpacing: '0.05em', textTransform: 'uppercase',
                    display: 'inline-block', whiteSpace: 'nowrap',
                    background: sc.bg, color: sc.color
                  }}>{dep.status}</span>

                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', ...mono }}>{dep.version || '—'}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', ...sans }}>{dep.service || '—'}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', ...mono }}>{dep.deployedBy || '—'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', ...mono }}>{formatTime(dep.deployedAt || dep.createdAt)}</div>

                  <button
                    onClick={() => handleRollback(dep._id)}
                    disabled={dep.status === 'rolled_back'}
                    style={{
                      padding: '3px 10px', fontSize: '10px', ...mono,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent',
                      color: dep.status === 'rolled_back' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)',
                      cursor: dep.status === 'rolled_back' ? 'default' : 'pointer',
                      borderRadius: '2px', letterSpacing: '0.04em',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => { if (dep.status !== 'rolled_back') { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = dep.status === 'rolled_back' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)' }}
                  >{dep.status === 'rolled_back' ? 'rolled back' : 'rollback'}</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}