import React from 'react'
import { useKPIs } from '../store/mockStore'
import { Bell, Menu } from 'lucide-react'
import RoleSwitcher from './RoleSwitcher'

export default function TopBar({ title, breadcrumb, onMenuToggle }) {
  const kpis = useKPIs()

  return (
    <header style={{
      height: 'var(--topbar-height)', background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', flexShrink: 0, zIndex: 100,
    }}>
      <button
        onClick={onMenuToggle}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6, transition: 'color 0.15s',
        }}
        aria-label="Toggle sidebar"
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {breadcrumb && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {breadcrumb}
          </div>
        )}
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <button style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, width: 38, height: 38, cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'color 0.15s, border-color 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <Bell size={16} strokeWidth={1.75} />
          </button>
          {kpis.exceptionsOpen > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#EF4444', color: '#fff',
              fontSize: 10, fontWeight: 700, borderRadius: 99,
              padding: '1px 5px', lineHeight: 1.4,
              pointerEvents: 'none',
            }}>
              {kpis.exceptionsOpen}
            </span>
          )}
        </div>
        <RoleSwitcher />
      </div>
    </header>
  )
}
