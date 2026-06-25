import React, { useEffect } from 'react'
import { useStore } from '../store/mockStore'
import { useNavigate } from 'react-router-dom'

const COLORS = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#5BC8D9' }

function ToastItem({ toast, onRemove }) {
  const navigate = useNavigate()
  useEffect(() => {
    const id = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(id)
  }, [toast.id, onRemove])

  const color = COLORS[toast.type] || COLORS.info

  return (
    <div
      className="animate-fade-in-up"
      style={{
        width: 320, background: 'var(--bg-elevated)',
        border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`,
        borderRadius: 10, padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: toast.route ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
      }}
      onClick={() => { if (toast.route) { navigate(toast.route); onRemove(toast.id) } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          {toast.title && <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 2 }}>{toast.title}</div>}
          <div style={{ color: 'var(--text-body)', fontSize: 13 }}>{toast.message}</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(toast.id) }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: color, animation: 'progressShrink 4s linear forwards' }} />
    </div>
  )
}

export default function ToastContainer() {
  const { state, removeToast } = useStore()
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
      {state.toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  )
}
