import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'

const levelColor = (level) => {
  const map = {
    info: { color: '#4A6FA5', bg: 'rgba(74,111,165,0.1)' },
    warn: { color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    error: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    fatal: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  }
  return map[level] || { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' }
}

const formatTime = (ts) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const mono = { fontFamily: "'Geist Mono', monospace" }

const LEVELS = ['all', 'info', 'warn', 'error', 'fatal']

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/logs?limit=200')
      setLogs(res.data.logs || res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const filtered = logs.filter(l => {
    if (level !== 'all' && l.level !== level) return false
    if (search && !l.message?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const th = { fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', ...mono }

  return (
    <Layout title="Logs">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  ...mono,
                  letterSpacing: '0.06em',
                  border: `1px solid ${level === l ? '#4A6FA5' : 'rgba(255,255,255,0.1)'}`,
                  background: level === l ? 'rgba(74,111,165,0.08)' : 'transparent',
                  color: level === l ? '#4A6FA5' : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  textTransform: 'uppercase',
                  transition: 'all 150ms ease'
                }}
              >{l}</button>
            ))}
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search logs..."
            style={{
              flex: 1,
              padding: '6px 12px',
              fontSize: '12px',
              ...mono,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: '2px',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(74,111,165,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />

          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', ...mono, flexShrink: 0 }}>
            {filtered.length} entries
          </span>

          <button
            onClick={fetchLogs}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              ...mono,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              borderRadius: '2px',
              letterSpacing: '0.04em',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,111,165,0.4)'; e.currentTarget.style.color = '#4A6FA5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >refresh</button>
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
            gridTemplateColumns: '70px 160px 1fr 100px',
            padding: '8px 18px',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0
          }}>
            {['Level', 'Time', 'Message', 'Service'].map(h => <div key={h} style={th}>{h}</div>)}
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>Loading...</div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: '32px 18px', fontSize: '13px', color: 'rgba(255,255,255,0.2)', ...mono }}>No logs found.</div>
            )}
            {filtered.map((log, i) => {
              const lc = levelColor(log.level)
              const isExpanded = expanded === i
              return (
                <div
                  key={i}
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 160px 1fr 100px',
                    padding: '9px 18px',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '2px',
                      ...mono, letterSpacing: '0.05em', textTransform: 'uppercase',
                      display: 'inline-block', whiteSpace: 'nowrap',
                      background: lc.bg, color: lc.color
                    }}>{log.level}</span>

                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', ...mono }}>{formatTime(log.timestamp)}</div>

                    <div style={{
                      fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'unset' : 'ellipsis',
                      fontFamily: "'Geist', sans-serif"
                    }}>{log.message}</div>

                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', ...mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.service}</div>
                  </div>

                  {isExpanded && log.metadata && (
                    <div style={{
                      padding: '0 18px 12px 18px',
                      fontSize: '11px', color: 'rgba(255,255,255,0.3)', ...mono,
                      background: 'rgba(255,255,255,0.02)',
                      lineHeight: 1.6, wordBreak: 'break-all'
                    }}>
                      {JSON.stringify(log.metadata, null, 2)}
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