import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/api'
import { useSocket } from '../context/SocketContext'

const FILTERS = ['all', 'investigating', 'escalated', 'fixing', 'verifying', 'resolved']

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
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

const formatDuration = (start, end) => {
  if (!start) return '—'
  const ms = (end ? new Date(end) : new Date()) - new Date(start)
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

export default function Incidents() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [incidents, setIncidents] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('incident:created', (incident) => {
      setIncidents(prev => [incident, ...prev])
    })
    socket.on('incident:updated', (incident) => {
      setIncidents(prev => prev.map(i => i._id === incident._id ? incident : i))
    })
    return () => {
      socket.off('incident:created')
      socket.off('incident:updated')
    }
  }, [socket])

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/api/incidents?limit=100')
      setIncidents(res.data.incidents || [])
    } catch {}
    finally { setLoading(false) }
  }

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter)

  const th = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: "'Geist Mono', monospace"
  }

  return (
    <Layout title="Incidents">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: '0.06em',
                border: `1px solid ${filter === f ? '#4A6FA5' : 'rgba(255,255,255,0.1)'}`,
                background: filter === f ? 'rgba(74,111,165,0.08)' : 'transparent',
                color: filter === f ? '#4A6FA5' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                borderRadius: '2px',
                textTransform: 'uppercase',
                transition: 'all 150ms ease'
              }}
            >
              {f}
            </button>
          ))}
          <span style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.2)',
            fontFamily: "'Geist Mono', monospace"
          }}>
            {filtered.length} incident{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{
          flex: 1,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.015)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 90px 110px 90px 70px',
            padding: '9px 18px',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0
          }}>
            {['Status', 'Incident', 'Score', 'Detected', 'Duration', 'Action'].map(h => (
              <div key={h} style={th}>{h}</div>
            ))}
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Geist Mono', monospace" }}>
                Loading...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Geist Mono', monospace" }}>
                No incidents
              </div>
            )}
            {filtered.map(inc => {
              const sc = statusColor(inc.status)
              return (
                <div
                  key={inc._id}
                  onClick={() => navigate(`/incidents/${inc._id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 90px 110px 90px 70px',
                    padding: '11px 18px',
                    gap: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    fontFamily: "'Geist Mono', monospace",
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    background: sc.bg,
                    color: sc.color
                  }}>{inc.status}</span>

                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: "'Geist', sans-serif",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{inc.anomalyType || 'Unknown'}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      flex: 1,
                      height: '2px',
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: '1px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '1px',
                        width: `${(inc.anomalyScore || 0) * 100}%`,
                        background: inc.status === 'resolved' ? '#22c55e' : inc.anomalyScore > 0.8 ? '#ef4444' : '#eab308'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: "'Geist Mono', monospace",
                      color: 'rgba(255,255,255,0.35)',
                      flexShrink: 0
                    }}>{inc.anomalyScore?.toFixed(2) || '—'}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Geist Mono', monospace" }}>
                    {formatTime(inc.createdAt)}
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Geist Mono', monospace" }}>
                    {formatDuration(inc.createdAt, inc.resolvedAt)}
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Geist Mono', monospace" }}>
                    {inc.actionTaken || '—'}
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