import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import DataTable from '../../components/DataTable'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'
import ScanInput from '../../components/ScanInput'

const ISA_TRAYS = [
  { id: 'ISA-TRY-001', product: 'Campa Cola 200ml', batch: 'BATCH-20240624-001', pouches: 24, location: 'ISA-A-01', age: '2h 15m', status: 'AVAILABLE', fefo: 1 },
  { id: 'ISA-TRY-002', product: 'Campa Cola 200ml', batch: 'BATCH-20240624-001', pouches: 24, location: 'ISA-A-02', age: '2h 10m', status: 'AVAILABLE', fefo: 2 },
  { id: 'ISA-TRY-003', product: 'Campa Lemon 200ml', batch: 'BATCH-20240624-002', pouches: 18, location: 'ISA-B-01', age: '0h 45m', status: 'PARTIAL', fefo: 3 },
  { id: 'ISA-TRY-004', product: 'Campa Cola 200ml', batch: 'BATCH-20240624-001', pouches: 24, location: 'ISA-A-03', age: '1h 30m', status: 'ISSUED', fefo: 4 },
]

export default function IsaTray() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [trays, setTrays] = useState(ISA_TRAYS)
  const [rfidScanned, setRfidScanned] = useState(null)

  const handleRfid = (val) => {
    const tray = trays.find(t => t.id === val || val.includes(t.id.slice(-3)))
    if (tray) {
      setRfidScanned(tray)
      addToast({ type: 'success', title: 'RFID Received', message: `${tray.id} — ${tray.product}` })
      return true
    }
    return false
  }

  const handleIssue = (trayId) => {
    setTrays(t => t.map(tr => tr.id === trayId ? { ...tr, status: 'ISSUED' } : tr))
    addToast({ type: 'success', title: 'Tray Issued', message: `${trayId} → Secondary Packing` })
    navigate('/stage7/secondary-packing')
  }

  const cols = [
    { key: 'fefo', label: 'FEFO', align: 'center' },
    { key: 'id', label: 'Tray ID', mono: true },
    { key: 'product', label: 'Product' },
    { key: 'batch', label: 'Batch', mono: true },
    { key: 'pouches', label: 'Pouches', align: 'center' },
    { key: 'location', label: 'Location' },
    { key: 'age', label: 'Age' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v === 'AVAILABLE' ? 'APPROVED' : v === 'PARTIAL' ? 'PENDING' : 'IN_TRANSIT'} /> },
    { key: 'id', label: '', render: (_, row) => row.status !== 'ISSUED' ? (
      <button onClick={() => handleIssue(row.id)} style={{ background: 'rgba(91,200,217,0.1)', border: '1px solid rgba(91,200,217,0.3)', borderRadius: 6, padding: '4px 12px', color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Issue →</button>
    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Issued</span> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage5/rework')}>← Stage 5</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage7/secondary-packing')}>Stage 7 →</SecondaryButton>
        </div>
        <PrimaryButton size="sm" onClick={() => addToast({ type: 'info', message: 'RFID reader active — scan tray' })}>+ Receive Tray (RFID)</PrimaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Trays', value: trays.length, color: '#5BC8D9' },
          { label: 'Available', value: trays.filter(t => t.status === 'AVAILABLE').length, color: '#10B981' },
          { label: 'Partial', value: trays.filter(t => t.status === 'PARTIAL').length, color: '#F59E0B' },
          { label: 'Issued Today', value: trays.filter(t => t.status === 'ISSUED').length, color: '#A78BFA' },
        ].map(k => (
          <Card key={k.label} accent accentColor={k.color}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <Card accent>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>ISA Tray Inventory (FEFO Order)</div>
            <DataTable columns={cols} data={trays} />
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>RFID Receive</div>
              <ScanInput label="Scan RFID Tag" onScan={handleRfid} placeholder="Scan ISA tray RFID…" />
              {rfidScanned && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(91,200,217,0.08)', borderRadius: 8 }}>
                  <div className="mono-id" style={{ fontSize: 13 }}>{rfidScanned.id}</div>
                  <div style={{ fontSize: 13, color: '#fff' }}>{rfidScanned.product}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rfidScanned.pouches} pouches</div>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>FEFO Issuance Rule</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Trays issued to Secondary Packing in FEFO order. Oldest batch first. Partial trays prioritized over full.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
