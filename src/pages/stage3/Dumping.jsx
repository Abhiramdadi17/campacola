import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import ScanInput from '../../components/ScanInput'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'

const BOM = [
  { material: 'Cola Concentrate 30X', required: 120, unit: 'KG', lotId: 'LOT-20240624-001' },
  { material: 'Refined Sugar S-30', required: 500, unit: 'KG', lotId: 'LOT-20240624-002' },
  { material: 'DM Water Grade A', required: 380, unit: 'Litres', lotId: null },
]

export default function Dumping() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useStore()
  const [scanned, setScanned] = useState({})
  const [completed, setCompleted] = useState(false)
  const [batchId, setBatchId] = useState(null)

  const handleScan = (val) => {
    const lot = state.lots.find(l => l.id === val || l.grnId === val)
    if (!lot) return false
    if (lot.status !== 'APPROVED' && lot.status !== 'AVAILABLE') { addToast({ type: 'error', title: 'Scan Failed', message: `${lot.id} is ${lot.status} — must be APPROVED` }); return false }
    const bomLine = BOM.find(b => b.lotId === lot.id || b.material === lot.material)
    if (!bomLine) { addToast({ type: 'error', title: 'Scan Failed', message: 'Lot not in BOM for this batch' }); return false }
    setScanned(s => ({ ...s, [bomLine.material]: { lot, dumped: bomLine.required } }))
    addToast({ type: 'success', title: 'Bag Scanned', message: `${lot.id} — ${lot.material} validated against BOM` })
    return true
  }

  const allScanned = BOM.every(b => scanned[b.material])

  const handleComplete = () => {
    const id = `BATCH-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(state.batches.length + 1).padStart(3,'0')}`
    setBatchId(id)
    setCompleted(true)
    addToast({ type: 'success', title: 'Batch Created', message: `${id} — Dumping complete` })
    dispatch({ type: 'RAISE_EXCEPTION', payload: { code: 'EX-DMP-01', type: 'INFO', severity: 'LOW', description: `Leftover material flagged on ${id}`, actor: 'System', stage: 3 } })
  }

  if (completed) {
    return (
      <div style={{ maxWidth: 600 }}>
        <Card accent accentColor="var(--gradient-cta)" className="animate-scale-in">
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>⚗️</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Dumping Complete</div>
            <div className="mono-id gradient-text" style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{batchId}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PrimaryButton fullWidth onClick={() => navigate('/stage4/primary-packing')}>Proceed to Primary Packing →</PrimaryButton>
              <SecondaryButton fullWidth onClick={() => { setCompleted(false); setScanned({}) }}>New Batch</SecondaryButton>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <SecondaryButton size="sm" onClick={() => navigate('/stage2/requisition')}>← Stage 2</SecondaryButton>
        <SecondaryButton size="sm" onClick={() => navigate('/stage4/primary-packing')}>Stage 4 →</SecondaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card accent>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Bag Scan Validation</div>
              <ScanInput label="Scan Bag / Lot ID" onScan={handleScan} placeholder="Scan bag barcode or enter Lot ID…" />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                System validates: lot exists · QC APPROVED · BOM match · not expired · not double-consumed
              </div>
            </div>
          </Card>

          {BOM.map(line => {
            const s = scanned[line.material]
            const pct = s ? (s.dumped / line.required) * 100 : 0
            const barColor = pct >= 100 ? '#10B981' : pct > 80 ? '#F59E0B' : 'var(--accent-cyan)'
            return (
              <Card key={line.material} accent={pct >= 100} accentColor="#10B981">
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{line.material}</div>
                      {s && <div className="mono-id" style={{ fontSize: 12 }}>{s.lot.id}</div>}
                    </div>
                    <StatusBadge status={s ? 'APPROVED' : 'PENDING'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>{s ? s.dumped : 0} / {line.required} {line.unit}</span>
                    <span style={{ color: barColor, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </Card>
            )
          })}

          <PrimaryButton fullWidth size="lg" disabled={!allScanned} onClick={handleComplete}>
            {allScanned ? 'Confirm Dump Complete →' : `${Object.keys(scanned).length}/${BOM.length} BOM Lines Scanned`}
          </PrimaryButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>BOM Reference</div>
              {BOM.map(line => (
                <div key={line.material} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{line.material}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{line.required} {line.unit}</div>
                  {line.lotId && <div className="mono-id" style={{ fontSize: 11 }}>{line.lotId}</div>}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Exceptions (EX-DMP)</div>
              {['EX-DMP-01: Leftover material', 'EX-DMP-02: BOM mismatch', 'EX-DMP-03: Expired lot', 'EX-DMP-04: Double scan', 'EX-DMP-05: Unaplanned material'].map((ex, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{ex}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
