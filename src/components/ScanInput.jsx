import React, { useState, useRef } from 'react'

export default function ScanInput({ onScan, placeholder = 'Scan barcode or enter ID…', label, disabled }) {
  const [value, setValue] = useState('')
  const [scanState, setScanState] = useState('idle') // idle | waiting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  const handleScan = () => {
    if (!value.trim()) return
    setScanState('waiting')
    setTimeout(() => {
      const result = onScan(value.trim())
      if (result === false) {
        setScanState('error')
        setErrorMsg('Scan failed — ID not found or invalid')
        setTimeout(() => setScanState('idle'), 2000)
      } else {
        setScanState('success')
        setTimeout(() => { setScanState('idle'); setValue('') }, 1500)
      }
    }, 400)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleScan() }

  const borderColors = {
    idle: 'var(--border-strong)',
    waiting: 'var(--accent-cyan)',
    success: '#10B981',
    error: '#EF4444',
  }

  const animations = {
    waiting: 'pulse-cyan 1.2s ease-in-out infinite',
    error: 'shake 0.3s ease',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1, animation: animations[scanState] }}>
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={disabled || scanState === 'waiting'}
            style={{
              width: '100%', height: 48,
              padding: '0 48px 0 14px',
              background: scanState === 'success' ? 'rgba(16,185,129,0.08)' : scanState === 'error' ? 'rgba(239,68,68,0.08)' : 'var(--input-bg)',
              border: `1px solid ${borderColors[scanState]}`,
              borderRadius: 8,
              color: 'var(--text-head)',
              fontFamily: 'Space Mono, monospace', fontSize: 14,
              outline: 'none', transition: 'border-color 0.15s, background 0.15s',
            }}
          />
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18,
            color: scanState === 'success' ? '#10B981' : scanState === 'error' ? '#EF4444' : 'var(--text-muted)',
          }}>
            {scanState === 'success' ? '✓' : scanState === 'error' ? '✗' : scanState === 'waiting' ? '⟳' : '⊡'}
          </span>
        </div>
        <button
          onClick={handleScan}
          disabled={!value.trim() || disabled || scanState === 'waiting'}
          style={{
            height: 48, padding: '0 20px',
            background: 'var(--bg-elevated)', border: '1px solid var(--accent-cyan)',
            borderRadius: 8, color: 'var(--accent-cyan)',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          Scan
        </button>
      </div>
      {scanState === 'success' && <span style={{ fontSize: 12, color: '#10B981' }}>✓ Scanned successfully</span>}
      {scanState === 'error' && <span style={{ fontSize: 12, color: '#EF4444' }}>{errorMsg}</span>}
    </div>
  )
}
