import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'
import DataTable from '../../components/DataTable'
import ScanInput from '../../components/ScanInput'

const MOCK_REQS = [
  { id: 'REQ-20240624-001', order: 'PRD-ORD-0441', material: 'Cola Concentrate 30X', required: 120, unit: 'KG', pallets: 3, status: 'APPROVED', suggestedLot: 'LOT-20240624-001', fefo: true },
  { id: 'REQ-20240624-002', order: 'PRD-ORD-0441', material: 'Refined Sugar S-30', required: 500, unit: 'KG', pallets: 5, status: 'PENDING', suggestedLot: 'LOT-20240624-002', fefo: true },
]

export default function Requisition() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useStore()
  const [selected, setSelected] = useState(null)
  const [stagingLocation, setStagingLocation] = useState(null)
  const [shortfall, setShortfall] = useState(false)

  const approvedLots = state.lots.filter(l => l.status === 'APPROVED' || l.status === 'AVAILABLE')

  const handleApprove = (req) => {
    dispatch({ type: 'SUBMIT_REQUISITION', payload: { id: req.id } })
    addToast({ type: 'success', title: 'Requisition Approved', message: `${req.id} — Pick task assigned` })
  }

  const handleStagingScan = (val) => {
    setStagingLocation(val)
    addToast({ type: 'success', title: 'Staging Location Confirmed', message: `Material staged at ${val}` })
    return true
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage1/put-away')}>← Stage 1</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage3/dumping')}>Stage 3 →</SecondaryButton>
        </div>
        <PrimaryButton onClick={() => addToast({ type: 'info', message: 'New requisition form opened' })}>+ New Requisition</PrimaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { label: 'Open Requisitions', value: MOCK_REQS.length, color: '#5BC8D9' },
          { label: 'Available Lots (FEFO)', value: approvedLots.length, color: '#10B981' },
          { label: 'Shortfall Flags', value: shortfall ? 1 : 0, color: '#F59E0B' },
        ].map(kpi => (
          <Card key={kpi.label} accent accentColor={kpi.color}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{kpi.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card accent>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Material Requisitions</div>
              {MOCK_REQS.map(req => (
                <div key={req.id} style={{
                  padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, marginBottom: 10,
                  border: `1px solid ${selected?.id === req.id ? 'var(--accent-cyan)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }} onClick={() => setSelected(req)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span className="mono-id" style={{ fontSize: 13 }}>{req.id}</span>
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{req.order}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{req.material}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    <span>Required: {req.required} {req.unit}</span>
                    <span>Pallets: {req.pallets}</span>
                    {req.fefo && <span style={{ color: 'var(--accent-cyan)' }}>FEFO ✓</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', background: 'rgba(91,200,217,0.06)', borderRadius: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>FEFO Suggested:</span>
                    <span className="mono-id" style={{ fontSize: 12 }}>{req.suggestedLot}</span>
                  </div>
                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <PrimaryButton size="sm" onClick={() => handleApprove(req)}>Approve & Assign Pick Task</PrimaryButton>
                      <SecondaryButton size="sm" danger onClick={() => { setShortfall(true); addToast({ type: 'warning', title: 'Shortfall Flagged', message: `${req.material} insufficient`, route: '/exceptions' }) }}>Flag Shortfall</SecondaryButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {selected && (
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Staging Location Scan</div>
                <ScanInput label="Scan Staging Zone" onScan={handleStagingScan} placeholder="Scan or enter staging location…" />
                {stagingLocation && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8 }}>
                    <div style={{ color: '#10B981', fontWeight: 600 }}>✓ Staged at: {stagingLocation}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Approved Lots (FEFO)</div>
            {approvedLots.map(lot => (
              <div key={lot.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="mono-id" style={{ fontSize: 12, marginBottom: 2 }}>{lot.id}</div>
                <div style={{ fontSize: 13, color: '#fff' }}>{lot.material}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lot.qty} {lot.unit} · {lot.location || 'No location'}</div>
                {lot.expiryDate && <div style={{ fontSize: 11, color: '#F59E0B' }}>Exp: {lot.expiryDate}</div>}
              </div>
            ))}
            {approvedLots.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No approved lots available</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
