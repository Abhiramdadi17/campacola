import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import StatusBadge from '../../components/StatusBadge'
import LiveTimer from '../../components/LiveTimer'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import InputField from '../../components/InputField'

const REJECTION_REASONS = ['Failed Microbiological Test', 'Physical Contamination', 'Wrong Material', 'Expired / Near Expiry', 'Packaging Damage', 'Other']
const FILTER_TABS = ['ALL', 'PENDING', 'HOLD', 'OVERDUE']

function StageNav() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <SecondaryButton size="sm" onClick={() => navigate('/stage1/grn/new')}>← GRN Creation</SecondaryButton>
      <SecondaryButton size="sm" onClick={() => navigate('/stage1/put-away')}>Put Away →</SecondaryButton>
    </div>
  )
}

export default function QaInspection() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useStore()
  const [selectedLotId, setSelectedLotId] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [decision, setDecision] = useState(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [reinspectionDate, setReinspectionDate] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const now = Date.now()
  const queueLots = state.lots.filter(l => {
    if (filter === 'ALL') return ['UNDER_QC', 'HOLD'].includes(l.status)
    if (filter === 'PENDING') return l.status === 'UNDER_QC'
    if (filter === 'HOLD') return l.status === 'HOLD'
    if (filter === 'OVERDUE') return l.status === 'UNDER_QC' && (now - new Date(l.arrivedAt).getTime()) > 4 * 3600000
    return true
  })

  const selectedLot = state.lots.find(l => l.id === selectedLotId) || queueLots[0]
  const pendingCount = state.lots.filter(l => l.status === 'UNDER_QC').length
  const isOverdue = selectedLot && (now - new Date(selectedLot.arrivedAt).getTime()) > 4 * 3600000

  const handleDecisionConfirm = () => {
    if (!selectedLot || !decision) return
    dispatch({ type: 'QA_DECISION', payload: { lotId: selectedLot.id, decision, rejectionReason, reinspectionDate } })
    const messages = {
      PASS: `${selectedLot.id} APPROVED — Available for issuance`,
      HOLD: `${selectedLot.id} placed on HOLD — Re-inspection scheduled`,
      REJECT: `${selectedLot.id} REJECTED — Return to vendor initiated`
    }
    addToast({ type: decision === 'PASS' ? 'success' : decision === 'HOLD' ? 'warning' : 'error', title: `QA ${decision}`, message: messages[decision], route: decision === 'REJECT' ? '/exceptions' : undefined })
    if (decision === 'PASS') {
      setTimeout(() => navigate('/stage1/put-away', { state: { lotId: selectedLot.id } }), 1500)
    }
    setShowConfirm(false)
    setDecision(null)
    setNotes('')
    setRejectionReason('')
    setSelectedLotId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <StageNav />
      <div style={{ display: 'flex', gap: 0, minHeight: 600, height: 'calc(100vh - 180px)' }}>
        {/* Queue Panel */}
        <div style={{ width: 280, flexShrink: 0, background: 'var(--bg-card)', borderRadius: '12px 0 0 12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Inspection Queue</span>
              {pendingCount > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{pendingCount}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: filter === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: filter === t ? '#fff' : 'var(--text-muted)',
                  border: 'none', letterSpacing: '0.4px',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {queueLots.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No lots in queue</div>
            )}
            {queueLots.map(lot => {
              const over = (now - new Date(lot.arrivedAt).getTime()) > 4 * 3600000
              const isSelected = lot.id === (selectedLot?.id)
              return (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLotId(lot.id)}
                  style={{
                    padding: '12px 12px', borderRadius: 8, margin: '4px 0',
                    cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : over ? '#EF4444' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(91,200,217,0.08)' : over ? 'rgba(239,68,68,0.04)' : 'var(--bg-elevated)',
                    borderLeft: `3px solid ${isSelected ? 'var(--accent-cyan)' : over ? '#EF4444' : 'var(--border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: over ? '#EF4444' : '#F59E0B', flexShrink: 0, animation: over ? 'timerPulse 1s infinite' : undefined }} />
                    <span className="mono-id" style={{ fontSize: 12 }}>{lot.id}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, marginBottom: 2 }}>{lot.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{lot.vendor} · {lot.qty} {lot.unit}</div>
                  <LiveTimer startTime={lot.arrivedAt} label="Waiting" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Disposition Workspace */}
        <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: '0 12px 12px 0', border: '1px solid var(--border)', borderLeft: 'none', overflow: 'auto' }}>
          {!selectedLot ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
              <div style={{ fontSize: 16 }}>Select a lot from the queue</div>
            </div>
          ) : (
            <div style={{ padding: 24 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selectedLot.material}</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="mono-id" style={{ fontSize: 14 }}>{selectedLot.id}</span>
                    <StatusBadge status={selectedLot.status} />
                    {isOverdue && <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>⚠ SLA BREACHED</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    {selectedLot.vendor} · {selectedLot.qty} {selectedLot.unit} · GRN: {selectedLot.grnId}
                  </div>
                </div>
                <LiveTimer startTime={selectedLot.arrivedAt} slaMs={4 * 3600000} label="QC SLA (4h)" />
              </div>

              {/* GRN Details */}
              <Card style={{ marginBottom: 20 }}>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>GRN Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    {[
                      ['GRN ID', selectedLot.grnId], ['Vendor', selectedLot.vendor],
                      ['Material', selectedLot.material], ['Quantity', `${selectedLot.qty} ${selectedLot.unit}`],
                      ['Vehicle', selectedLot.vehicleNumber || '—'], ['Expiry', selectedLot.expiryDate || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Decision Section */}
              <Card accent>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>QA Disposition</div>
                  <InputField label="Inspection Notes" as="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter inspection findings, test results, observations…" rows={3} />
                  {decision === 'REJECT' && (
                    <div style={{ marginTop: 14 }}>
                      <InputField label="Rejection Reason" as="select" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} options={REJECTION_REASONS} />
                    </div>
                  )}
                  {decision === 'HOLD' && (
                    <div style={{ marginTop: 14 }}>
                      <InputField label="Re-inspection Date" type="date" value={reinspectionDate} onChange={e => setReinspectionDate(e.target.value)} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    {[
                      { d: 'PASS', color: '#10B981', label: 'PASS' },
                      { d: 'HOLD', color: '#F59E0B', label: 'HOLD' },
                      { d: 'REJECT', color: '#EF4444', label: 'REJECT' },
                    ].map(({ d, color, label }) => (
                      <button
                        key={d}
                        onClick={() => setDecision(decision === d ? null : d)}
                        style={{
                          flex: 1, height: 52, border: `2px solid ${decision === d ? color : 'var(--border)'}`,
                          borderRadius: 10, background: decision === d ? color + '22' : 'var(--bg-elevated)',
                          color: decision === d ? color : 'var(--text-body)',
                          fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s',
                          boxShadow: decision === d ? `0 0 0 3px ${color}33` : 'none',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {decision && (
                    <div style={{ marginTop: 16 }}>
                      <PrimaryButton fullWidth size="lg" onClick={() => setShowConfirm(true)}>
                        Confirm {decision} →
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card className="animate-scale-in" style={{ width: 420, maxWidth: '90vw' }}>
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Confirm {decision}?
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: 20 }}>
                {decision === 'PASS' && `Lot ${selectedLot?.id} will be marked APPROVED and available for issuance. A Put Away task will be created.`}
                {decision === 'HOLD' && `Lot ${selectedLot?.id} will be placed on HOLD for re-inspection.`}
                {decision === 'REJECT' && `Lot ${selectedLot?.id} will be REJECTED. Inventory set to zero, return-to-vendor initiated. Exception EX-QC-02 will be raised.`}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton fullWidth onClick={() => setShowConfirm(false)}>Cancel</SecondaryButton>
                <PrimaryButton fullWidth onClick={handleDecisionConfirm} style={{ background: decision === 'PASS' ? '#10B981' : decision === 'HOLD' ? '#F59E0B' : '#EF4444' }}>
                  Confirm {decision}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
