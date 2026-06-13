import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/api'
import { useSocket } from '../context/SocketContext'

const EMPTY_SUMMARY = {
  openIncidents: 0,
  agentActionsToday: 0,
  resolutionRate: 0,
  meanRecoveryMs: 0,
}

function Sparkline({ points, color }) {
  if (!points || points.length < 2) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 100
  const h = 28
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function MetricCard({ label, value, delta, deltaType, sparkPoints, sparkColor, borderColor }) {
  return (
    <div style={{
      padding: '14px 16px 12px',
      border: `1px solid ${borderColor || 'rgba(255,255,255,0.07)'}`,
      background: 'rgba(255,255,255,0.015)',
    }}>
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: "'Geist Mono', monospace",
        marginBottom: '6px'
      }}>{label}</div>
      <div style={{
        fontSize: '26px',
        fontWeight: 300,
        lineHeight: 1,
        marginBottom: '4px',
        letterSpacing: '-0.02em',
        color: deltaType === 'crit' ? '#ef4444' : deltaType === 'warn' ? '#eab308' : '#fff',
        fontFamily: "'Geist', sans-serif"
      }}>{value}</div>
      <div style={{
        fontSize: '11px',
        fontFamily: "'Geist Mono', monospace",
        marginBottom: '8px',
        color: deltaType === 'crit' ? '#ef4444' : deltaType === 'warn' ? '#eab308' : deltaType === 'ok' ? '#22c55e' : 'rgba(255,255,255,0.25)'
      }}>{delta}</div>
      <Sparkline points={sparkPoints} color={sparkColor} />
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [incidents, setIncidents] = useState([])
  const [agentSteps, setAgentSteps] = useState([])
  const [activeIncident, setActiveIncident] = useState(null)
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [sparklines, setSparklines] = useState({
    errorRate: [], avgResponseTime: [], memoryUsage: [], cpuUsage: []
  })

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('incident:created', (incident) => {
      setIncidents(prev => [incident, ...prev].slice(0, 10))
      if (['investigating', 'fixing'].includes(incident.status)) setActiveIncident(incident)
    })
    socket.on('incident:updated', (incident) => {
      setIncidents(prev => prev.map(i => i._id === incident._id ? incident : i))
      if (['investigating', 'fixing'].includes(incident.status)) setActiveIncident(incident)
      else if (activeIncident?._id === incident._id) setActiveIncident(incident)
    })
    socket.on('step:added', (step) => {
      setAgentSteps(prev => [step, ...prev].slice(0, 20))
    })
    socket.on('metrics:updated', (data) => {
      setSparklines(prev => ({
        errorRate: [...(prev.errorRate || []), data.errorRate].slice(-20),
        avgResponseTime: [...(prev.avgResponseTime || []), data.avgResponseTime].slice(-20),
        memoryUsage: [...(prev.memoryUsage || []), data.memoryUsage].slice(-20),
        cpuUsage: [...(prev.cpuUsage || []), data.cpuUsage].slice(-20),
      }))
    })
    return () => {
      socket.off('incident:created')
      socket.off('incident:updated')
      socket.off('step:added')
      socket.off('metrics:updated')
    }
  }, [socket])

  const fetchAll = async () => {
    try {
      const [incRes, stepsRes, summaryRes] = await Promise.all([
        api.get('/api/incidents?limit=10'),
        api.get('/api/agent/steps/recent'),
        api.get('/api/incidents/summary'),
      ])
      setIncidents(incRes.data.incidents || [])
      setAgentSteps(stepsRes.data.steps || [])
      setSummary(summaryRes.data || EMPTY_SUMMARY)
      const active = (incRes.data.incidents || []).find(i => ['investigating', 'fixing'].includes(i.status))
      if (active) setActiveIncident(active)
    } catch {}
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    return `${Math.floor(m / 60)}h ago`
  }

  const formatMs = (ms) => {
    if (!ms) return '—'
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const statusColor = (status) => {
    const map = {
      investigating: { bg: 'rgba(234,179,8,0.1)', color: '#eab308' },
      escalated: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
      fixing: { bg: 'rgba(74,111,165,0.12)', color: '#4A6FA5' },
      resolved: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
      verifying: { bg: 'rgba(74,111,165,0.12)', color: '#4A6FA5' },
    }
    return map[status] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
  }

  const completedSteps = (activeIncident?.steps || []).filter(s => s.type !== 'thinking')
  const isActive = activeIncident && ['investigating', 'fixing', 'verifying'].includes(activeIncident.status)

  const panelHead = { fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }
  const th = { fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }

  return (
    <Layout title="Operations Center">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
          <MetricCard
            label="Open Incidents"
            value={summary.openIncidents}
            delta={summary.openIncidents > 0 ? `${summary.openIncidents} active` : 'all clear'}
            deltaType={summary.openIncidents > 1 ? 'crit' : summary.openIncidents === 1 ? 'warn' : 'ok'}
            sparkPoints={sparklines.errorRate}
            sparkColor={summary.openIncidents > 0 ? 'rgba(239,68,68,0.45)' : 'rgba(34,197,94,0.35)'}
            borderColor={summary.openIncidents > 1 ? 'rgba(239,68,68,0.28)' : summary.openIncidents === 1 ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.07)'}
          />
          <MetricCard
            label="Agent Actions"
            value={summary.agentActionsToday}
            delta="today"
            deltaType="ok"
            sparkPoints={sparklines.cpuUsage}
            sparkColor="rgba(74,111,165,0.45)"
          />
          <MetricCard
            label="Resolution Rate"
            value={summary.resolutionRate ? `${Math.round(summary.resolutionRate)}%` : '—'}
            delta="last 30 days"
            deltaType="ok"
            sparkPoints={sparklines.memoryUsage}
            sparkColor="rgba(34,197,94,0.4)"
          />
          <MetricCard
            label="Mean Recovery"
            value={formatMs(summary.meanRecoveryMs)}
            delta="avg resolution time"
            deltaType="warn"
            sparkPoints={sparklines.avgResponseTime}
            sparkColor="rgba(234,179,8,0.45)"
            borderColor={summary.meanRecoveryMs > 300000 ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.07)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', flex: 1, minHeight: 0 }}>

          {/* Incidents */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={panelHead}>Incidents</span>
              <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: summary.openIncidents > 0 ? '#ef4444' : '#22c55e' }}>
                {summary.openIncidents > 0 ? `${summary.openIncidents} active` : 'all clear'}
              </span>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 52px', padding: '6px 14px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Status', 'Incident', 'Time'].map(h => <div key={h} style={th}>{h}</div>)}
              </div>
              {incidents.length === 0 && (
                <div style={{ padding: '24px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Geist Mono', monospace" }}>No incidents</div>
              )}
              {incidents.map(inc => {
                const sc = statusColor(inc.status)
                return (
                  <div
                    key={inc._id}
                    onClick={() => navigate(`/incidents/${inc._id}`)}
                    style={{ display: 'grid', gridTemplateColumns: '90px 1fr 52px', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '2px', fontFamily: "'Geist Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase', display: 'inline-block', whiteSpace: 'nowrap', background: sc.bg, color: sc.color }}>{inc.status}</span>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Geist', sans-serif" }}>{inc.failureMode || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: "'Geist Mono', monospace" }}>{formatTime(inc.createdAt)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agent Activity */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={panelHead}>Agent Activity</span>
              <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: '#4A6FA5' }}>running</span>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {agentSteps.length === 0 && (
                <div style={{ padding: '24px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Geist Mono', monospace" }}>No recent activity</div>
              )}
              {agentSteps.map((step, i) => (
                <div key={i} style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, background: step.type === 'tool_result' ? '#22c55e' : step.type === 'error' ? '#ef4444' : '#4A6FA5' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.5, fontFamily: "'Geist', sans-serif" }}>
                      {step.toolName && (
                        <span style={{ fontSize: '10px', fontFamily: "'Geist Mono', monospace", color: '#4A6FA5', background: 'rgba(74,111,165,0.1)', padding: '1px 5px', borderRadius: '2px', marginRight: '5px' }}>{step.toolName}</span>
                      )}
                      {step.output ? String(step.output).slice(0, 80) : step.input ? String(step.input).slice(0, 80) : 'Processing...'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>{formatTime(step.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ border: `1px solid ${isActive ? 'rgba(74,111,165,0.25)' : 'rgba(255,255,255,0.07)'}`, background: isActive ? 'rgba(74,111,165,0.04)' : 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'border-color 300ms ease' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${isActive ? 'rgba(74,111,165,0.15)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ ...panelHead, color: isActive ? '#4A6FA5' : 'rgba(255,255,255,0.3)' }}>AI Summary</span>
              <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: isActive ? '#eab308' : '#22c55e' }}>
                {isActive ? '● investigating' : '● all clear'}
              </span>
            </div>
            <div style={{ padding: '14px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isActive ? (
                <>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: '5px' }}>Active Incident</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: "'Geist Mono', monospace" }}>
                      {activeIncident?.failureMode || 'Unknown'} — <span style={{ color: '#eab308' }}>{activeIncident?.status}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: '6px' }}>Investigation Progress</div>
                    {completedSteps.slice(0, 4).map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: '#22c55e', flexShrink: 0, marginTop: '1px' }}>✓</span>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, fontFamily: "'Geist', sans-serif" }}>{step.toolName || 'Processing'}</div>
                      </div>
                    ))}
                    {activeIncident.status === 'investigating' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", color: '#4A6FA5', flexShrink: 0, marginTop: '1px' }}>⟳</span>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, fontFamily: "'Geist', sans-serif" }}>Analyzing findings...</div>
                      </div>
                    )}
                  </div>
                  {activeIncident?.anomalyScore && (
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: '6px' }}>Anomaly Score</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#4A6FA5', borderRadius: '1px', width: `${activeIncident.anomalyScore * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#4A6FA5', fontFamily: "'Geist Mono', monospace", fontWeight: 500 }}>{activeIncident.anomalyScore.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: '5px' }}>Last Resolved</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Geist Mono', monospace" }}>
                      {incidents.find(i => i.status === 'resolved')?.failureMode || 'No incidents yet'}
                    </div>
                  </div>
                  {incidents.find(i => i.status === 'resolved')?.postMortem && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '3px' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: '5px' }}>Post-mortem</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: "'Geist', sans-serif" }}>
                        {incidents.find(i => i.status === 'resolved')?.postMortem?.rootCause?.slice(0, 120) || '—'}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontFamily: "'Geist Mono', monospace" }}>system nominal</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}