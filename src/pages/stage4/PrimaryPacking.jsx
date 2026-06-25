import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'
import ScanInput from '../../components/ScanInput'

export default function PrimaryPacking() {
  const navigate = useNavigate()
  const { state, addToast } = useStore()
  const [running, setRunning] = useState(true)
  const [pouches, setPouches] = useState(8420)
  const [rejects, setRejects] = useState(42)
  const [trayFill, setTrayFill] = useState(18)
  const [traysCompleted, setTraysCompleted] = useState(7)
  const [cwHistory, setCwHistory] = useState([
    { id: 'CW-001', weight: 20.02, status: 'PASS' }, { id: 'CW-002', weight: 19.98, status: 'PASS' },
    { id: 'CW-003', weight: 20.45, status: 'FAIL' }, { id: 'CW-004', weight: 20.01, status: 'PASS' },
  ])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setPouches(p => p + Math.floor(Math.random() * 3))
      if (Math.random() < 0.05) setRejects(r => r + 1)
    }, 2000)
    return () => clearInterval(id)
  }, [running])

  const batch = state.batches[0]
  const yieldPct = pouches > 0 ? (((pouches - rejects) / pouches) * 100).toFixed(1) : 0
  const TRAY_CAPACITY = 24

  const handleTrayScan = (val) => {
    setTrayFill(f => {
      const next = f + 1
      if (next >= TRAY_CAPACITY) {
        addToast({ type: 'success', title: 'TRAY FULL', message: `Tray ${val} closed — ${TRAY_CAPACITY} pouches` })
        setTraysCompleted(t => t + 1)
        return 0
      }
      return next
    })
    return true
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage3/dumping')}>← Stage 3</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage5/rework')}>Stage 5 →</SecondaryButton>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge status={running ? 'IN_PROGRESS' : 'HOLD'} />
          <PrimaryButton size="sm" onClick={() => setRunning(!running)}>{running ? '⏸ Pause Line' : '▶ Resume Line'}</PrimaryButton>
        </div>
      </div>

      {/* Live Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Pouches Filled', value: pouches.toLocaleString(), color: '#5BC8D9', pulse: running },
          { label: 'Rejects (CW)', value: rejects, color: '#EF4444' },
          { label: 'Yield %', value: `${yieldPct}%`, color: Number(yieldPct) >= 99 ? '#10B981' : '#F59E0B' },
          { label: 'Trays Closed', value: traysCompleted, color: '#10B981' },
        ].map(k => (
          <Card key={k.label} accent accentColor={k.color}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color, fontFamily: 'Space Mono', animation: k.pulse ? 'timerPulse 2s ease-in-out infinite' : undefined }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tray Fill */}
        <Card accent>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Tray Fill Status</div>
            <ScanInput label="Scan Pouch → Tray" onScan={handleTrayScan} placeholder="Scan pouch barcode…" />
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Tray fill: {trayFill}/{TRAY_CAPACITY}</span>
                <span style={{ color: trayFill >= TRAY_CAPACITY * 0.9 ? '#10B981' : 'var(--accent-cyan)' }}>{Math.round((trayFill / TRAY_CAPACITY) * 100)}%</span>
              </div>
              <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${(trayFill / TRAY_CAPACITY) * 100}%`, height: '100%',
                  background: trayFill >= TRAY_CAPACITY * 0.9 ? '#10B981' : 'var(--accent-cyan)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3, marginTop: 12 }}>
                {Array.from({ length: TRAY_CAPACITY }, (_, i) => (
                  <div key={i} style={{ height: 16, borderRadius: 3, background: i < trayFill ? 'var(--accent-cyan)' : 'var(--border)', transition: 'background 0.2s' }} />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Check Weigher */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Check Weigher Feed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {cwHistory.slice(-6).map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: entry.status === 'FAIL' ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)', borderRadius: 6 }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)' }}>{entry.id}</span>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 14, fontWeight: 600, color: '#fff' }}>{entry.weight}g</span>
                  <StatusBadge status={entry.status === 'PASS' ? 'APPROVED' : 'REJECTED'} />
                </div>
              ))}
            </div>
            <SecondaryButton fullWidth onClick={() => {
              const w = (19.8 + Math.random() * 0.6).toFixed(2)
              const pass = w >= 19.9 && w <= 20.1
              const entry = { id: `CW-${String(cwHistory.length + 1).padStart(3,'0')}`, weight: Number(w), status: pass ? 'PASS' : 'FAIL' }
              setCwHistory(h => [...h, entry])
              if (!pass) addToast({ type: 'error', title: 'CW FAIL', message: `${entry.id}: ${w}g — out of spec`, route: '/exceptions' })
            }}>Simulate CW Check</SecondaryButton>
          </div>
        </Card>
      </div>

      {/* Batch Summary */}
      {batch && (
        <Card accent accentColor="var(--gradient-cta)">
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Batch Summary</div>
                <div className="mono-id" style={{ fontSize: 16 }}>{batch.id}</div>
              </div>
              <PrimaryButton onClick={() => {
                if (Number(yieldPct) < 98) {
                  addToast({ type: 'warning', title: 'Yield Below Threshold', message: 'Manager approval required for closure', route: '/exceptions' })
                  return
                }
                addToast({ type: 'success', title: 'Batch Closed', message: `${batch.id} closed — ${yieldPct}% yield` })
                navigate('/stage5/rework')
              }}>Close Batch →</PrimaryButton>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
