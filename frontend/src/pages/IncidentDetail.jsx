import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/api'
import { useSocket } from '../context/SocketContext'

const statusColor = (status) => {
  const map = {
    investigating: { bg: 'rgba(234,179,8,0.1)', color: '#eab308' },
    escalated: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    fixing: { bg: 'rgba(74,111,165,0.12)', color: '#4A6FA5' },
    verifying: { bg: 'rgba(74,111,165,0.12)', color: '#4A6FA5' },
    resolved: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  }
  return map[status] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
}

const formatTime = (ts) => {
  if (!ts) return '—'
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

const formatDuration = (start, end) => {
  if (!start) return '—'
  const ms = (end ? new Date(end) : new Date()) - new Date(start)
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  const [incident, setIncident] = useState(null)
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    if (!socket) return
    socket.on('incident:updated', (updated) => {
      if (updated._id === id) setIncident(updated)
    })
    socket.on('step:added', (step) => {
      if (step.incidentId === id) setSteps(prev => [...prev, step])
    })
    return () => {
      socket.off('incident:updated')
      socket.off('step:added')
    }
  }, [socket, id])

  const fetchData = async () => {
    try {
      const [incRes, stepsRes] = await Promise.all([
        api.get(`/api/incidents/${id}`),
        api.get(`/api/incidents/${id}/steps`)
      ])
      setIncident(incRes.data.incident)
      setSteps(stepsRes.data.steps || [])
    } catch {}
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this incident and all its steps?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/incidents/${id}`)
      navigate('/incidents')
    } catch {}
    finally { setDeleting(false) }
  }

  if (loading) return (
    <Layout title="Incident Detail">
      <div style={{ padding: '32px 22px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Loading...</div>
    </Layout>
  )

  if (!incident) return (
    <Layout title="Incident Detail">
      <div style={{ padding: '32px 22px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Incident not found.</div>
    </Layout>
  )

  const sc = statusColor(incident.status)
  const pm = incident.postMortem

  return (
    <Layout title="Incident Detail">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.015)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: '11px', padding: '4px 10px', borderRadius: '2px',
            ...mono, letterSpacing: '0.05em', textTransform: 'uppercase',
            background: sc.bg, color: sc.color, whiteSpace: 'nowrap'
          }}>{incident.status}</span>

          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.07)' }} />

          {[
            { label: 'Incident', value: incident.anomalyType || 'Unknown' },
            { label: 'Score', value: incident.anomalyScore?.toFixed(2) || '—', color: incident.anomalyScore > 0.8 ? '#ef4444' : '#eab308' },
            { label: 'Detected', value: formatTime(incident.createdAt) },
            { label: 'Duration', value: formatDuration(incident.createdAt, incident.resolvedAt) },
            { label: 'Action', value: incident.actionTaken || '—' },
          ].map(({ label, value, color }, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono }}>{label}</span>
              <span style={{ fontSize: '13px', color: color || 'rgba(255,255,255,0.65)', ...mono }}>{value}</span>
            </div>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                fontSize: '12px', ...mono,
                color: 'rgba(239,68,68,0.6)',
                border: '1px solid rgba(239,68,68,0.2)',
                padding: '6px 14px',
                borderRadius: '2px',
                cursor: 'pointer',
                background: 'transparent',
                letterSpacing: '0.04em',
                transition: 'all 150ms ease',
                opacity: deleting ? 0.5 : 1
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)' }}
            >{deleting ? 'deleting...' : 'delete'}</button>

            <button
              onClick={() => navigate(`/incidents/${id}/trace`)}
              style={{
                fontSize: '12px', ...mono,
                color: '#4A6FA5',
                border: '1px solid rgba(74,111,165,0.3)',
                padding: '6px 16px',
                borderRadius: '2px',
                cursor: 'pointer',
                background: 'rgba(74,111,165,0.06)',
                letterSpacing: '0.04em',
                transition: 'background 150ms ease, border-color 150ms ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,111,165,0.12)'; e.currentTarget.style.borderColor = 'rgba(74,111,165,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,111,165,0.06)'; e.currentTarget.style.borderColor = 'rgba(74,111,165,0.3)' }}
            >View Agent Trace →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', flex: 1, minHeight: 0 }}>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase', ...mono }}>Agent Steps</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', ...mono }}>{steps.length} steps</span>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {steps.length === 0 && (
                <div style={{ padding: '24px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono }}>No steps recorded.</div>
              )}
              {steps.map((step, i) => (
                <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', marginTop: '6px', flexShrink: 0, background: step.stepType === 'investigate' ? '#4A6FA5' : step.stepType === 'decide' ? '#eab308' : '#22c55e' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, ...sans }}>
                      {step.toolCalled && (
                        <span style={{ fontSize: '10px', ...mono, color: '#4A6FA5', background: 'rgba(74,111,165,0.1)', padding: '1px 5px', borderRadius: '2px', marginRight: '6px' }}>{step.toolCalled}</span>
                      )}
                      {step.toolInput ? JSON.stringify(step.toolInput).slice(0, 120) : step.agentReasoning ? step.agentReasoning.slice(0, 120) : 'Processing...'}
                    </div>
                    {step.toolOutput && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', ...mono, marginTop: '4px', lineHeight: 1.5 }}>
                        {JSON.stringify(step.toolOutput).slice(0, 150)}
                      </div>
                    )}
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', ...mono, marginTop: '3px' }}>
                      {formatTime(step.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase', ...mono }}>Post-mortem</span>
            </div>
            <div style={{ overflow: 'auto', flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!pm ? (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono }}>
                  {['investigating', 'fixing', 'verifying'].includes(incident.status)
                    ? 'Investigation in progress...'
                    : 'No post-mortem available.'}
                </div>
              ) : (
                <>
                  {pm.rootCause && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Root Cause</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, ...sans }}>{pm.rootCause}</div>
                    </div>
                  )}
                  {pm.confidence !== undefined && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Confidence</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: pm.confidence >= 0.75 ? '#22c55e' : '#eab308', borderRadius: '1px', width: `${pm.confidence * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '12px', color: pm.confidence >= 0.75 ? '#22c55e' : '#eab308', ...mono, fontWeight: 500 }}>{pm.confidence?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {pm.actionsTaken?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Actions Taken</div>
                      {pm.actionsTaken.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, ...sans }}>
                          <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</span>{a}
                        </div>
                      ))}
                    </div>
                  )}
                  {pm.preventionSteps?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Prevention</div>
                      {pm.preventionSteps.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, ...sans }}>
                          <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</span>{p}
                        </div>
                      ))}
                    </div>
                  )}
                  {pm.timeToResolve && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>Time to Resolve</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', ...mono }}>{pm.timeToResolve}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}