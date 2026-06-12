import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowField from '../components/FlowField'
import Logo from '../components/Logo'
export default function Landing() {
  const navigate = useNavigate()
  const logoRef = useRef(null)
  const canvasRef = useRef(null)
  const [entered, setEntered] = useState(false)
  const scrambleText = 'NeuralOps'
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  const triggerScramble = () => {
    let frame = 0
    const totalFrames = 100
    let rafId

    function run() {
      frame++
      const progress = frame / totalFrames
      let result = ''
      for (let i = 0; i < scrambleText.length; i++) {
        if (i < Math.floor(progress * scrambleText.length)) {
          result += scrambleText[i]
        } else {
          result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        }
      }
      if (logoRef.current) logoRef.current.textContent = result
      if (frame < totalFrames) {
        rafId = requestAnimationFrame(run)
      } else {
        if (logoRef.current) logoRef.current.textContent = scrambleText
      }
    }

    cancelAnimationFrame(rafId)
    frame = 0
    rafId = requestAnimationFrame(run)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setEntered(true)
      triggerScramble()
    }, 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
      fontFamily: "'Geist', system-ui, sans-serif"
    }}>
      <FlowField count={1200} trail={0.1} color='#4A6FA5' speed={0.85} />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 35% at 50% 48%, rgba(74,111,165,0.07) 0%, transparent 70%)'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'scale(0.98)',
        transition: 'opacity 700ms ease, transform 700ms ease'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
          zIndex: 9,
          pointerEvents: 'none'
        }} />

        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 52px',
        }}>
          <span
            ref={logoRef}
            onMouseEnter={triggerScramble}
            style={{
              color: '#fff',
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'default',
              fontFamily: "'Geist Mono', monospace",
              animation: 'float 7s ease-in-out infinite',
            }}
          >
            NeuralOps
          </span>

          <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
            <a href="#" style={{
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '14px',
              letterSpacing: '0.02em',
              fontFamily: "'Geist', sans-serif"
            }}>Docs</a>
            <a href="#" style={{
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '14px',
              letterSpacing: '0.02em',
              fontFamily: "'Geist', sans-serif"
            }}>Architecture</a>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.35)',
                color: 'rgba(255,255,255,0.85)',
                padding: '7px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: "'Geist', sans-serif",
                transition: 'border-color 150ms ease, color 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
              }}
            >
              Sign in
            </button>
          </div>
        </nav>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 52px'
        }}>
          <p style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.22)',
            textTransform: 'uppercase',
            marginBottom: '32px',
            fontFamily: "'Geist Mono', monospace"
          }}>
            Autonomous Incident Response
          </p>

          <h1 style={{
            fontSize: '64px',
            fontWeight: 300,
            color: '#fff',
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            marginBottom: '28px',
            maxWidth: '660px',
            fontFamily: "'Geist', sans-serif"
          }}>
            Your infrastructure.<br />
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>
              Watching itself.
            </span>
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.28)',
            lineHeight: 1.85,
            maxWidth: '400px',
            marginBottom: '52px',
            fontWeight: 300,
            fontFamily: "'Geist', sans-serif"
          }}>
            NeuralOps detects anomalies, runs the investigation,
            executes the fix, and writes the post-mortem.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: "'Geist', sans-serif",
                transition: 'transform 150ms ease, background 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.92)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = '#fff'
              }}
            >
              Get started
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.28)',
                fontSize: '14px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: "'Geist', sans-serif",
                transition: 'color 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
            >
              Sign in →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}