import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/mockStore'

const ROLES = ['Gate Guard', 'Store Operator', 'QA Supervisor', 'Store Manager', 'Production Manager', 'ISA Operator', 'Secondary Pack Supervisor']

const ROLE_COLORS = {
  'Gate Guard': '#7B9FFF',
  'Store Operator': '#5BC8D9',
  'QA Supervisor': '#F59E0B',
  'Store Manager': '#10B981',
  'Production Manager': '#F45B4A',
  'ISA Operator': '#A78BFA',
  'Secondary Pack Supervisor': '#34D399',
}

export default function RoleSwitcher() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const color = ROLE_COLORS[state.role] || '#5BC8D9'
  const initials = state.role.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '4px 12px 4px 4px',
          background: 'var(--bg-elevated)', borderRadius: 99,
          border: '1px solid var(--border)',
          transition: 'border-color 0.15s',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, #203FF8)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>
          {initials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.4px' }}>ROLE</span>
          <span style={{ fontSize: 13, fontWeight: 600, color, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.role}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▼</span>
      </div>
      {open && (
        <div className="animate-scale-in" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden', minWidth: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Switch Role (Demo)
          </div>
          {ROLES.map(r => (
            <div
              key={r}
              onClick={() => { dispatch({ type: 'SET_ROLE', payload: r }); setOpen(false) }}
              style={{
                padding: '10px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: r === state.role ? ROLE_COLORS[r] : 'var(--text-body)',
                background: r === state.role ? 'rgba(91,200,217,0.08)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (r !== state.role) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (r !== state.role) e.currentTarget.style.background = 'transparent' }}
            >
              {r === state.role && <span style={{ color: ROLE_COLORS[r], fontSize: 10 }}>●</span>}
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
