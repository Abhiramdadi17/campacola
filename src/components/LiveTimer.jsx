import React, { useState, useEffect } from 'react'

export default function LiveTimer({ startTime, slaMs, label }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = startTime ? new Date(startTime).getTime() : Date.now()
    const tick = () => setElapsed(Date.now() - start)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const pct = slaMs ? Math.min((elapsed / slaMs) * 100, 100) : 0
  const over = slaMs && elapsed > slaMs

  const h = Math.floor(elapsed / 3600000)
  const m = Math.floor((elapsed % 3600000) / 60000)
  const s = Math.floor((elapsed % 60000) / 1000)
  const fmt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  const color = over ? '#EF4444' : pct > 75 ? '#F59E0B' : '#5BC8D9'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
      {label && <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>}
      <span style={{
        fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color,
        animation: over ? 'timerPulse 1s ease-in-out infinite' : undefined,
        transition: 'color 0.2s ease',
      }}>
        {fmt}
      </span>
      {slaMs && (
        <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 1s linear, background 0.2s ease' }} />
        </div>
      )}
    </div>
  )
}
