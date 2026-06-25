import React, { useState } from 'react'

export default function PrimaryButton({ children, onClick, disabled, fullWidth, size = 'md', type = 'button', style = {} }) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  const heights = { sm: 36, md: 44, lg: 52, xl: 56 }
  const pads = { sm: '0 16px', md: '0 24px', lg: '0 32px', xl: '0 40px' }
  const fss = { sm: 13, md: 14, lg: 15, xl: 16 }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: heights[size], padding: pads[size],
        width: fullWidth ? '100%' : undefined,
        background: hovered ? 'var(--gradient-cta)' : 'var(--bg-elevated)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 'var(--radius-btn)',
        color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
        fontSize: fss[size], fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transform: active ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
