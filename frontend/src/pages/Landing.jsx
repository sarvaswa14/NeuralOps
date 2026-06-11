import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function useScramble(ref, text) {
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let frame = 0
    let rafId
    const totalFrames = 100

    function scramble() {
      frame++
      const progress = frame / totalFrames
      let result = ''
      for (let i = 0; i < text.length; i++) {
        if (i < Math.floor(progress * text.length)) {
          result += text[i]
        } else {
          result += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      if (ref.current) ref.current.textContent = result
      if (frame < totalFrames) {
        rafId = requestAnimationFrame(scramble)
      } else {
        if (ref.current) ref.current.textContent = text
      }
    }

    rafId = requestAnimationFrame(scramble)
    return () => cancelAnimationFrame(rafId)
  }, [ref, text])
}

function FlowField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    let particles = []
    let rafId
    let mouse = { x: -1000, y: -1000 }

     const COLOR = '#4A6FA5'
      const COUNT = 1200
      const TRAIL = 0.1
      const SPEED = 0.85

    function resize() {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
    }

    class Particle {
      constructor() {
        this.reset(true)
      }
      reset(rand) {
        this.x = Math.random() * W
        this.y = rand ? Math.random() * H : Math.random() * H
        this.vx = 0
        this.vy = 0
        this.age = 0
        this.life = Math.random() * 200 + 100
      }
      update() {
        const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI
        this.vx += Math.cos(angle) * 0.2 * SPEED
        this.vy += Math.sin(angle) * 0.2 * SPEED

        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          const f = (140 - dist) / 140
          this.vx -= dx * f * 0.04
          this.vy -= dy * f * 0.04
        }

        this.x += this.vx
        this.y += this.vy
        this.vx *= 0.95
        this.vy *= 0.95
        this.age++

        if (this.age > this.life) this.reset(false)
        if (this.x < 0) this.x = W
        if (this.x > W) this.x = 0
        if (this.y < 0) this.y = H
        if (this.y > H) this.y = 0
      }
      draw() {
        const alpha = (1 - Math.abs((this.age / this.life) - 0.5) * 2) * 1.0
        ctx.globalAlpha = alpha
        ctx.fillStyle = COLOR
        ctx.fillRect(this.x, this.y, 2.5, 2.5)
      }
    }

    function init() {
      particles = []
      for (let i = 0; i < COUNT; i++) particles.push(new Particle())
    }

    function loop() {
      ctx.globalAlpha = 1
      ctx.fillStyle = `rgba(0,0,0,${TRAIL})`
      ctx.fillRect(0, 0, W, H)
      particles.forEach(p => { p.update(); p.draw() })
      rafId = requestAnimationFrame(loop)
    }

    const handleMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const handleResize = () => {
      resize()
      init()
    }

    resize()
    init()
    loop()

    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const logoRef = useRef(null)
  const scrambleText = 'NeuralOps'
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  useScramble(logoRef, scrambleText)

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

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
      fontFamily: "'Geist', system-ui, sans-serif"
    }}>
      <FlowField />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
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
              fontFamily: "'Geist Mono', monospace"
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
                fontFamily: "'Geist', sans-serif"
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
            marginBottom: '28px',
            fontFamily: "'Geist Mono', monospace"
          }}>
            Autonomous Incident Response
          </p>

          <h1 style={{
            fontSize: '56px',
            fontWeight: 300,
            color: '#fff',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            maxWidth: '600px',
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
            lineHeight: 1.8,
            maxWidth: '400px',
            marginBottom: '44px',
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
                padding: '11px 32px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: "'Geist', sans-serif"
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
                fontFamily: "'Geist', sans-serif"
              }}
            >
              Sign in →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}