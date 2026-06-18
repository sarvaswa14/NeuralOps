import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/api'
import { useSocket } from '../context/SocketContext'

const stepColor = (stepType) => {
  const map = {
    investigate: '#4A6FA5',
    decide: '#eab308',
    fix: '#22c55e',
    verify: '#22c55e',
    escalate: '#ef4444',
    observe: '#4A6FA5',
    hypothesize: '#eab308',
  }
  return map[stepType] || '#4A6FA5'
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

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

export default function AgentTrace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  const [incident, setIncident] = useState(null)
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    if (!socket) return
    socket.on('step:added', (step) => {
      if (String(step.incidentId) === String(id)) {
        setSteps(prev => [...prev, step])
      }
    })
    socket.on('incident:updated', (updated) => {
      if (String(updated._id) === String(id)) setIncident(updated)
    })
    return () => {
      socket.off('step:added')
      socket.off('incident:updated')
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

  if (loading) return (
    <Layout title="Agent Trace">
      <div style={{ padding: '32px 22px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Loading...</div>
    </Layout>
  )

  if (!incident) return (
    <Layout title="Agent Trace">
      <div style={{ padding: '32px 22px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Incident not found.</div>
    </Layout>
  )

  return (
    <Layout title="Agent Trace">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.015)',
          padding: '12px 18px', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              onClick={() => navigate(`/incidents/${id}`)}
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', ...mono, letterSpacing: '0.04em' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >← back</span>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', ...mono }}>{incident.anomalyType || 'Unknown'}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', ...mono }}>{steps.length} steps</span>
          </div>
          <span style={{
            fontSize: '11px', ...mono,
            color: incident.status === 'resolved' ? '#22c55e' : incident.status === 'escalated' ? '#ef4444' : '#eab308'
          }}>{incident.status}</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {steps.length === 0 && (
            <div style={{ padding: '32px 22px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>No steps recorded.</div>
          )}

          <div style={{ padding: '4px 0', position: 'relative' }}>
            {steps.map((step, i) => {
              const color = stepColor(step.stepType)
              const isLast = i === steps.length - 1
              return (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '0 22px 0 22px', marginBottom: isLast ? 0 : '2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '14px', boxShadow: `0 0 6px ${color}60` }} />
                    {!isLast && <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.06)', minHeight: '20px' }} />}
                  </div>

                  <div style={{
                    flex: 1, border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.012)',
                    padding: '12px 16px', marginBottom: '8px',
                    borderLeft: `2px solid ${color}40`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '9px', ...mono, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color, background: `${color}15`, padding: '2px 7px', borderRadius: '2px'
                      }}>{step.stepType}</span>
                      {step.toolCalled && (
                        <span style={{
                          fontSize: '11px', ...mono, color: '#4A6FA5',
                          background: 'rgba(74,111,165,0.1)', padding: '2px 7px', borderRadius: '2px'
                        }}>{step.toolCalled}</span>
                      )}
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', ...mono, marginLeft: 'auto' }}>{formatTime(step.timestamp)}</span>
                    </div>

                    {step.toolInput && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', ...mono, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Input</div>
                        <div style={{
                          fontSize: '12px', color: 'rgba(255,255,255,0.45)', ...mono,
                          background: 'rgba(255,255,255,0.03)', padding: '8px 10px',
                          borderRadius: '2px', lineHeight: 1.6, wordBreak: 'break-all'
                        }}>{JSON.stringify(step.toolInput)}</div>
                      </div>
                    )}

                    {step.toolOutput && (
                      <div style={{ marginBottom: step.agentReasoning ? '8px' : 0 }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', ...mono, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Output</div>
                        <div style={{
                          fontSize: '12px', color: 'rgba(255,255,255,0.38)', ...mono,
                          background: 'rgba(255,255,255,0.03)', padding: '8px 10px',
                          borderRadius: '2px', lineHeight: 1.6, wordBreak: 'break-all',
                          maxHeight: '120px', overflow: 'auto'
                        }}>{JSON.stringify(step.toolOutput).slice(0, 500)}{JSON.stringify(step.toolOutput).length > 500 ? '...' : ''}</div>
                      </div>
                    )}

                    {step.agentReasoning && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', ...mono, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Reasoning</div>
                        <div style={{
                          fontSize: '12px', color: 'rgba(255,255,255,0.5)', ...sans,
                          lineHeight: 1.7, maxHeight: '150px', overflow: 'auto'
                        }}>{step.agentReasoning}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}