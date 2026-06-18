import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

const FAILURE_MODES = [
  { key: 'HIGH_ERROR_RATE', label: 'High Error Rate', desc: 'Spikes error rate to 40-80%. Agent detects and restarts service.', color: '#ef4444' },
  { key: 'MEMORY_LEAK', label: 'Memory Leak', desc: 'Simulates gradual memory growth. Agent detects and restarts service.', color: '#eab308' },
  { key: 'SLOW_RESPONSE', label: 'Slow Response', desc: 'Response times spike to 8-12 seconds. Agent investigates latency.', color: '#f97316' },
  { key: 'HIGH_CPU', label: 'High CPU', desc: 'CPU usage elevated. Agent scales or restarts service.', color: '#a855f7' },
  { key: 'BAD_DEPLOY', label: 'Bad Deploy', desc: 'Simulates a broken deployment. Agent checks history and rolls back.', color: '#4A6FA5' },
  { key: 'DB_CORRUPTION', label: 'DB Corruption', desc: 'Returns corrupted data responses. Agent detects and escalates.', color: '#ec4899' },
]

export default function Demo() {
  const [active, setActive] = useState({})
  const [loading, setLoading] = useState({})
  const [healLoading, setHealLoading] = useState(false)

  const triggerFailure = async (mode) => {
    setLoading(prev => ({ ...prev, [mode]: true }))
    try {
      await api.post('/api/target/break', { mode })
      setActive(prev => ({ ...prev, [mode]: true }))
    } catch {}
    finally { setLoading(prev => ({ ...prev, [mode]: false })) }
  }

  const healAll = async () => {
    setHealLoading(true)
    try {
      await api.post('/api/target/heal')
      setActive({})
    } catch {}
    finally { setHealLoading(false) }
  }

  const anyActive = Object.values(active).some(Boolean)

  return (
    <Layout title="Demo Control">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', ...sans }}>Trigger failure modes to demo autonomous incident response.</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', ...mono }}>The agent will detect, investigate, and fix automatically — no human intervention.</span>
          </div>
          <button
            onClick={healAll}
            disabled={healLoading}
            style={{
              padding: '8px 24px', fontSize: '13px', ...mono,
              background: anyActive ? 'rgba(34,197,94,0.1)' : 'transparent',
              border: `1px solid ${anyActive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: anyActive ? '#22c55e' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.04em',
              transition: 'all 150ms ease', opacity: healLoading ? 0.6 : 1
            }}
          >{healLoading ? 'healing...' : '✓ heal all'}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', flex: 1, alignContent: 'start' }}>
          {FAILURE_MODES.map(({ key, label, desc, color }) => {
            const isActive = active[key]
            const isLoading = loading[key]
            return (
              <div
                key={key}
                style={{
                  border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                  background: isActive ? `${color}08` : 'rgba(255,255,255,0.015)',
                  padding: '20px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  transition: 'all 300ms ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: isActive ? color : 'rgba(255,255,255,0.7)', ...mono, fontWeight: 500, marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', ...mono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{key}</div>
                  </div>
                  {isActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: '10px', color, ...mono }}>active</span>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', ...sans, lineHeight: 1.6, flex: 1 }}>{desc}</div>

                <button
                  onClick={() => triggerFailure(key)}
                  disabled={isLoading || isActive}
                  style={{
                    padding: '8px', fontSize: '12px', ...mono,
                    background: isActive ? `${color}15` : 'transparent',
                    border: `1px solid ${isActive ? `${color}30` : 'rgba(255,255,255,0.12)'}`,
                    color: isActive ? color : 'rgba(255,255,255,0.4)',
                    cursor: isActive ? 'default' : 'pointer',
                    borderRadius: '2px', letterSpacing: '0.06em', textTransform: 'uppercase',
                    transition: 'all 150ms ease', opacity: isLoading ? 0.6 : 1
                  }}
                  onMouseEnter={e => { if (!isActive && !isLoading) { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}0a` } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' } }}
                >
                  {isLoading ? 'triggering...' : isActive ? '● running' : 'trigger'}
                </button>
              </div>
            )
          })}
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    </Layout>
  )
}