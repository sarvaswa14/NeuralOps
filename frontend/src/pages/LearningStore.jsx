import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

const anomalyColor = (type) => {
  const map = {
    HIGH_ERROR_RATE: '#ef4444',
    MEMORY_LEAK: '#eab308',
    SLOW_RESPONSE: '#4A6FA5',
    HIGH_CPU: '#f97316',
  }
  return map[type] || 'rgba(255,255,255,0.4)'
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

export default function LearningStore() {
  const [learnings, setLearnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchLearnings() }, [])

  const fetchLearnings = async () => {
    try {
      const res = await api.get('/api/learning')
      setLearnings(Array.isArray(res.data) ? res.data : [])
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <Layout title="Learning Store">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono }}>{learnings.length} learnings stored</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', ...mono }}>auto-populated from resolved incidents</span>
        </div>

        <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 80px 80px', padding: '8px 18px', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
            {['Anomaly Type', 'Root Cause', 'Fix Applied', 'Success', 'Learned'].map(h => (
              <div key={h} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', ...mono }}>{h}</div>
            ))}
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {loading && <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Loading...</div>}
            {!loading && learnings.length === 0 && (
              <div style={{ padding: '32px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>No learnings yet.</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.12)', ...mono }}>Learnings are created automatically when the agent resolves an incident.</div>
              </div>
            )}
            {learnings.map((l, i) => {
              const color = anomalyColor(l.anomalyType)
              const isExpanded = expanded === i
              return (
                <div
                  key={l._id || i}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 80px 80px', padding: '11px 18px', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color, ...mono, fontWeight: 500 }}>{l.anomalyType || '—'}</span>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', ...sans, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.rootCause?.slice(0, 80) || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', ...mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.fixApplied || '—'}</div>
                    <div style={{ fontSize: '11px', ...mono, color: l.fixSucceeded ? '#22c55e' : '#ef4444' }}>{l.fixSucceeded ? '✓ yes' : '✗ no'}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', ...mono }}>{formatTime(l.createdAt)}</div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                      {l.symptoms?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Symptoms</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {l.symptoms.map((s, j) => (
                              <span key={j} style={{ fontSize: '11px', color: '#4A6FA5', background: 'rgba(74,111,165,0.1)', padding: '2px 8px', borderRadius: '2px', ...mono }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {l.rootCause && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Full Root Cause</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', ...sans, lineHeight: 1.7 }}>{l.rootCause}</div>
                        </div>
                      )}
                      {l.timeToResolve && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '4px' }}>Time to Resolve</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', ...mono }}>{l.timeToResolve}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}