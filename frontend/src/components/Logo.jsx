import { useEffect, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const TEXT = 'NeuralOps'
const FRAMES = 100

export default function Logo({ size = 22, onClick }) {
  const ref = useRef(null)

  const runScramble = () => {
    let frame = 0
    let rafId

    function run() {
      frame++
      const progress = frame / FRAMES
      let result = ''
      for (let i = 0; i < TEXT.length; i++) {
        if (i < Math.floor(progress * TEXT.length)) {
          result += TEXT[i]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }
      if (ref.current) ref.current.textContent = result
      if (frame < FRAMES) {
        rafId = requestAnimationFrame(run)
      } else {
        if (ref.current) ref.current.textContent = TEXT
      }
    }

    cancelAnimationFrame(rafId)
    frame = 0
    rafId = requestAnimationFrame(run)
  }

  useEffect(() => { runScramble() }, [])

  return (
    <span
      ref={ref}
      onMouseEnter={runScramble}
      onClick={onClick}
      style={{
        color: '#fff',
        fontSize: `${size}px`,
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: "'Geist Mono', monospace",
        transition: 'letter-spacing 200ms ease, text-shadow 200ms ease',
        display: 'inline-block',
      }}
      onMouseOver={e => {
        e.currentTarget.style.letterSpacing = '0.09em'
        e.currentTarget.style.textShadow = '0 0 20px rgba(74,111,165,0.4)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.letterSpacing = '0.06em'
        e.currentTarget.style.textShadow = 'none'
      }}
    >
      NeuralOps
    </span>
  )
}