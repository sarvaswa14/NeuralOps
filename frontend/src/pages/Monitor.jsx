import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useSocket } from '../context/SocketContext'

const mono = { fontFamily: "'Geist Mono', monospace" }
const sans = { fontFamily: "'Geist', sans-serif" }

function LiveChart({ points, color, height = 80 }) {
  if (!points || points.length < 2) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', ...mono }}>collecting data...</span>
    </div>
  )
  const max = Math.max(...points, 1)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 300
  const h = height
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  }).join(' ')
  const area = `${pts} ${w},${h} 0,${h}`

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={area} fill={`${color}10`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function MetricCard({ label, value, unit, status }) {
  const color = status === 'crit' ? '#ef4444' : status === 'warn' ? '#eab308' : '#fff'
  const subColor = status === 'crit' ? '#ef4444' : status === 'warn' ? '#eab308' : '#22c55e'
  const subText = status === 'crit' ? '↑ critical' : status === 'warn' ? '↑ elevated' : '↓ normal'
  return (
    <div style={{ border: `1px solid ${status === 'crit' ? 'rgba(239,68,68,0.2)' : status === 'warn' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.07)'}`, background: 'rgba(255,255,255,0.015)', padding: '14px 16px' }}>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 300, color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px', ...sans }}>
        {value}<span style={{ fontSize: '16px', opacity: 0.7 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '11px', color: subColor, ...mono }}>{subText}</div>
    </div>
  )
}

export default function Monitor() {
  const socket = useSocket()
  const [metrics, setMetrics] = useState({
    errorRate: [], avgResponseTime: [], memory: [], cpu: []
  })
  const [latest, setLatest] = useState(null)
  const metricsRef = useRef(metrics)
  metricsRef.current = metrics

  useEffect(() => {
    fetchLatest()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('metrics:updated', (data) => {
      setLatest(data)
      setMetrics(prev => ({
        errorRate: [...prev.errorRate, data.errorRate].slice(-30),
        avgResponseTime: [...prev.avgResponseTime, data.avgResponseTime].slice(-30),
        memory: [...prev.memory, data.memoryUsage ?? data.memory].slice(-30),
        cpu: [...prev.cpu, data.cpuUsage ?? data.cpu].slice(-30),
      }))
    })
    return () => socket.off('metrics:updated')
  }, [socket])

  const fetchLatest = async () => {
    try {
      const res = await api.get('/api/metrics/latest')
      if (res.data) {
        setLatest(res.data)
        setMetrics({
          errorRate: [res.data.errorRate],
          avgResponseTime: [res.data.avgResponseTime],
          memory: [res.data.memory || res.data.memoryUsage],
          cpu: [res.data.cpu || res.data.cpuUsage],
        })
      }
    } catch {}
  }

  const getStatus = (metric, value) => {
    if (metric === 'errorRate') return value > 10 ? 'crit' : value > 3 ? 'warn' : 'ok'
    if (metric === 'avgResponseTime') return value > 2000 ? 'crit' : value > 500 ? 'warn' : 'ok'
    if (metric === 'memory') return value > 800 ? 'crit' : value > 500 ? 'warn' : 'ok'
    if (metric === 'cpu') return value > 80 ? 'crit' : value > 60 ? 'warn' : 'ok'
    return 'ok'
  }

  const chartConfig = [
    { key: 'errorRate', label: 'Error Rate', unit: '%', color: '#ef4444' },
    { key: 'avgResponseTime', label: 'Response Time', unit: 'ms', color: '#4A6FA5' },
    { key: 'memory', label: 'Memory Usage', unit: 'MB', color: '#eab308' },
    { key: 'cpu', label: 'CPU Usage', unit: '%', color: '#22c55e' },
  ]

  return (
    <Layout title="Live Monitor">
      <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
          {chartConfig.map(({ key, label, unit }) => {
            const val = latest?.[key] ?? latest?.[key === 'memory' ? 'memoryUsage' : key === 'cpu' ? 'cpuUsage' : key]
            return (
              <MetricCard
                key={key}
                label={label}
                value={val != null ? (Number.isInteger(val) ? val : val.toFixed(1)) : '—'}
                unit={val != null ? unit : ''}
                status={val != null ? getStatus(key, val) : 'ok'}
              />
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', flex: 1, minHeight: 0 }}>
          {chartConfig.map(({ key, label, unit, color }) => {
            const pts = metrics[key]
            const lastVal = pts.length > 0 ? pts[pts.length - 1] : null
            return (
              <div key={key} style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', ...mono }}>{label}</span>
                  <span style={{ fontSize: '13px', color, ...mono, fontWeight: 500 }}>
                    {lastVal != null ? `${Number.isInteger(lastVal) ? lastVal : lastVal.toFixed(1)}${unit}` : '—'}
                  </span>
                </div>
                <div style={{ flex: 1, padding: '8px 0 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <LiveChart points={pts} color={color} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}