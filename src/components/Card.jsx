import React from 'react'

export default function Card({ children, className = '', accent = false, accentColor = 'var(--gradient-cta)', style = {}, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border)',
        position: 'relative',
        minWidth: 0,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      className={className}
    >
      {accent && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, borderRadius: '12px 12px 0 0' }} />
      )}
      {children}
    </div>
  )
}
