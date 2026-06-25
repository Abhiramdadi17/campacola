import React from 'react'

export default function Stepper({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? 'var(--approved)' : active ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                border: `2px solid ${done ? 'var(--approved)' : active ? 'var(--accent-cyan)' : 'var(--border-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14,
                color: done || active ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease', flexShrink: 0,
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? '#fff' : done ? 'var(--approved)' : 'var(--text-muted)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, flex: 2, marginTop: -20,
                background: done ? 'var(--approved)' : 'var(--border)',
                transition: 'background 0.2s ease',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
