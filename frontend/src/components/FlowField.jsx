import { useEffect, useRef } from 'react'

export default function FlowField({ count = 1200, trail = 0.03, color = '#4A6FA5', speed = 0.85 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    let particles = []
    let rafId
    let mouse = { x: -1000, y: -1000 }

    function resize() {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
    }

    class Particle {
      constructor() { this.reset(true) }
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
        this.vx += Math.cos(angle) * 0.2 * speed
        this.vy += Math.sin(angle) * 0.2 * speed
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
        const alpha = (1 - Math.abs((this.age / this.life) - 0.5) * 2)
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillRect(this.x, this.y, 2.5, 2.5)
      }
    }

    function init() {
      particles = []
      for (let i = 0; i < count; i++) particles.push(new Particle())
    }

    function loop() {
      ctx.globalAlpha = 1
      ctx.fillStyle = `rgba(0,0,0,${trail})`
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

    const handleResize = () => { resize(); init() }

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
  }, [count, trail, color, speed])

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