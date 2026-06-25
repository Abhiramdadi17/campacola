import React, { useState } from 'react'

export default function SecondaryButton({ children, onClick, disabled, fullWidth, size = 'md', type = 'button', danger = false }) {
  const [hovered, setHovered] = useState(false)
  const heights = { sm: 36, md: 44, lg: 52 }
  const pads = { sm: '0 16px', md: '0 24px', lg: '0 32px' }
  const fss = { sm: 13, md: 14, lg: 15 }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: heights[size], padding: pads[size],
        width: fullWidth ? '100%' : undefined,
        background: hovered ? (danger ? 'rgba(244,91,74,0.1)' : 'rgba(91,200,217,0.08)') : 'transparent',
        border: `1px solid ${danger ? 'rgba(244,91,74,0.4)' : 'rgba(91,200,217,0.3)'}`,
        borderRadius: 'var(--radius-btn)',
        color: danger ? 'var(--brand-red)' : 'var(--accent-cyan)',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: fss[size], fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
