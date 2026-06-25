import React, { useState } from 'react'

export default function InputField({
  label, value, onChange, placeholder, type = 'text', required, disabled,
  error, hint, autoFilled, as = 'input', options = [], rows = 3,
}) {
  const [focused, setFocused] = useState(false)

  const borderColor = error ? '#EF4444' : autoFilled ? 'var(--accent-cyan)' : focused ? 'var(--accent-cyan)' : 'var(--border-strong)'
  const glow = error ? '0 0 0 3px rgba(239,68,68,0.15)' : focused || autoFilled ? '0 0 0 3px rgba(91,200,217,0.15)' : 'none'
  const bg = autoFilled ? 'rgba(91,200,217,0.04)' : 'var(--input-bg)'

  const sharedStyle = {
    width: '100%', background: bg,
    border: `1px solid ${borderColor}`,
    borderRadius: 8, color: 'var(--text-head)',
    fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 500,
    outline: 'none', transition: 'all 0.15s ease',
    boxShadow: glow,
    animation: error ? 'shake 0.3s ease' : undefined,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: 'var(--brand-red)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          value={value} onChange={onChange} placeholder={placeholder}
          rows={rows} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...sharedStyle, padding: '10px 14px', resize: 'vertical', minHeight: 80 }}
        />
      ) : as === 'select' ? (
        <select
          value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...sharedStyle, padding: '0 14px', height: 44, cursor: 'pointer' }}
        >
          <option value="">Select…</option>
          {options.map(o => (
            <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
          ))}
        </select>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type={type} value={value} onChange={onChange}
            placeholder={placeholder} disabled={disabled} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...sharedStyle, padding: '0 14px', height: 44 }}
          />
          {autoFilled && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontSize: 12 }}>✓</span>
          )}
        </div>
      )}
      {error && <span style={{ fontSize: 12, color: '#EF4444' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  )
}
