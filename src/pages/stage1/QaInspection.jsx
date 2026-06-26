import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import StatusBadge from '../../components/StatusBadge'
import LiveTimer from '../../components/LiveTimer'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import InputField from '../../components/InputField'
import { Lock, Clock, FlaskConical, CheckCircle2, AlertTriangle, XCircle, Printer } from 'lucide-react'
import WorkflowJourneyBanner from '../../components/WorkflowJourneyBanner'

const HOLD_REASONS = [
  'Moisture Check Pending',
  'Supplier Certification Missing',
  'Lab Test Awaited',
  'Document Mismatch',
  'Awaiting COA Verification',
  'Inspector Unavailable',
  'Other',
]

const REJECTION_REASONS = [
  'Contamination',
  'Failed Moisture Test',
  'Failed Microbiological Test',
  'Physical Contamination',
  'Wrong Material',
  'Expired / Near Expiry',
  'Packaging Damage',
  'Failed pH / Brix Test',
  'Other',
]

// Map mock roles to inspector display names
const ROLE_INSPECTOR = {
  'Store Operator':     'Rajesh Kumar (Store)',
  'QA Supervisor':      'Priya Sharma (QA)',
  'Warehouse Manager':  'Amit Singh (WH)',
  'Store Manager':      'Vikram Patel (SM)',
}

const LABEL_CFG = {
  PASS:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  label: 'GREEN',  icon: CheckCircle2 },
  HOLD:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  label: 'YELLOW', icon: AlertTriangle },
  REJECT: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   label: 'RED',    icon: XCircle },
}

const FILTER_TABS = ['ALL', 'PENDING', 'HOLD', 'OVERDUE']

function ReadonlyField({ label, value, mono, dim }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        {label} <Lock size={8} style={{ opacity: 0.5 }} />
      </div>
      <div style={{
        height: 38, padding: '0 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
        borderRadius: 6, display: 'flex', alignItems: 'center',
        fontSize: 13, color: dim ? 'var(--text-muted)' : 'var(--accent-cyan)',
        fontFamily: mono ? 'Space Mono, monospace' : undefined,
        fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>—</span>}
      </div>
    </div>
  )
}

function WaitingBadge({ arrivedAt }) {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(arrivedAt).getTime())
  useEffect(() => {
    const t = setInterval(() => setElapsed(Date.now() - new Date(arrivedAt).getTime()), 30000)
    return () => clearInterval(t)
  }, [arrivedAt])
  const hours = elapsed / 3600000
  const color = hours > 4 ? '#EF4444' : hours > 2 ? '#F59E0B' : '#10B981'
  const h = Math.floor(hours)
  const m = Math.floor((hours % 1) * 60)
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
        Waiting Duration
      </div>
      <div style={{
        height: 38, padding: '0 12px', background: `${color}11`, border: `1px solid ${color}44`,
        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Clock size={13} style={{ color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{label}</span>
        {hours > 4 && <span style={{ fontSize: 10, color, marginLeft: 2 }}>SLA BREACHED</span>}
        {hours > 2 && hours <= 4 && <span style={{ fontSize: 10, color, marginLeft: 2 }}>APPROACHING</span>}
      </div>
      {(hours > 2) && (
        <div style={{ fontSize: 10, color, marginTop: 2 }}>
          {hours > 4 ? 'Exceeded 4h SLA — exception auto-raised' : 'Amber at 2h · red at 4h'}
        </div>
      )}
    </div>
  )
}

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
  const location = useLocation()
  const { state, dispatch, addToast } = useStore()
  // Auto-select lot when navigated from GRN success or from journey banner
  const prefillLotId = location.state?.lotId || null
  const [selectedLotId, setSelectedLotId] = useState(prefillLotId)
  const [filter, setFilter] = useState('ALL')
  const [decision, setDecision] = useState(null)
  const [notes, setNotes] = useState('')
  const [holdReason, setHoldReason] = useState('')
  const [holdReasonText, setHoldReasonText] = useState('')
  const [reinspectionDate, setReinspectionDate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionReasonText, setRejectionReasonText] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [inspectionTimestamp, setInspectionTimestamp] = useState(null)

  const now = Date.now()
  const inspectorName = ROLE_INSPECTOR[state.role] || state.role

  const queueLots = state.lots.filter(l => {
    if (filter === 'ALL')     return ['UNDER_QC', 'HOLD'].includes(l.status)
    if (filter === 'PENDING') return l.status === 'UNDER_QC'
    if (filter === 'HOLD')    return l.status === 'HOLD'
    if (filter === 'OVERDUE') return l.status === 'UNDER_QC' && (now - new Date(l.arrivedAt).getTime()) > 4 * 3600000
    return true
  })

  const selectedLot = state.lots.find(l => l.id === selectedLotId) || queueLots[0]
  const pendingCount = state.lots.filter(l => l.status === 'UNDER_QC').length
  const waitMs = selectedLot ? (now - new Date(selectedLot.arrivedAt).getTime()) : 0
  const isOverdue = waitMs > 4 * 3600000

  const resetForm = () => {
    setDecision(null); setNotes(''); setHoldReason(''); setHoldReasonText('')
    setRejectionReason(''); setRejectionReasonText(''); setReinspectionDate('')
    setShowConfirm(false); setInspectionTimestamp(null)
  }

  const handleSelectLot = (id) => { setSelectedLotId(id); resetForm() }

  const openConfirm = () => {
    setInspectionTimestamp(new Date())
    setShowConfirm(true)
  }

  const handleDecisionConfirm = () => {
    if (!selectedLot || !decision) return
    const finalHoldReason = holdReason === 'Other' ? holdReasonText : holdReason
    const finalRejectionReason = rejectionReason === 'Other' ? rejectionReasonText : rejectionReason
    dispatch({
      type: 'QA_DECISION',
      payload: {
        lotId: selectedLot.id, decision,
        holdReason: finalHoldReason,
        rejectionReason: finalRejectionReason,
        reinspectionDate,
        inspectorName,
      }
    })
    const messages = {
      PASS:   `${selectedLot.id} APPROVED — Available for put-away`,
      HOLD:   `${selectedLot.id} on HOLD — Re-inspection by ${reinspectionDate || 'TBD'}`,
      REJECT: `${selectedLot.id} REJECTED — Return to vendor initiated`,
    }
    addToast({
      type: decision === 'PASS' ? 'success' : decision === 'HOLD' ? 'warning' : 'error',
      title: `QA ${decision} · QC Label: ${LABEL_CFG[decision].label}`,
      message: messages[decision],
      route: decision === 'REJECT' ? '/exceptions' : undefined,
    })
    addToast({ type: 'info', message: `${LABEL_CFG[decision].label} QC label sent to Zebra/SATO printer` })
    dispatch({ type: 'SET_JOURNEY', payload: { qcDecision: decision, currentStep: decision === 'PASS' ? 3 : 3 } })
    if (decision === 'PASS') {
      setTimeout(() => navigate('/stage1/put-away', { state: { lotId: selectedLot.id } }), 1500)
    }
    setShowConfirm(false)
    resetForm()
    setSelectedLotId(null)
  }

  const labelCfg = decision ? LABEL_CFG[decision] : null
  const LabelIcon = labelCfg?.icon

  // Determine if form can be submitted
  const canSubmit = decision &&
    (decision !== 'HOLD'   || holdReason) &&
    (decision !== 'REJECT' || rejectionReason)

  const fmtTs = (iso) => iso
    ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <WorkflowJourneyBanner currentStep={3} />
      <StageNav />
      <div style={{ display: 'flex', gap: 0, minHeight: 600, height: 'calc(100vh - 180px)' }}>

        {/* ── Queue Panel ── */}
        <div style={{
          width: 280, flexShrink: 0, background: 'var(--bg-card)',
          borderRadius: '12px 0 0 12px', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FlaskConical size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Inspection Queue</span>
              {pendingCount > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99, animation: 'badgePop 0.3s ease' }}>
                  {pendingCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: filter === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: filter === t ? '#fff' : 'var(--text-muted)', border: 'none', letterSpacing: '0.4px',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
            {queueLots.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No lots in queue</div>
            )}
            {queueLots.map((lot, i) => {
              const over = (now - new Date(lot.arrivedAt).getTime()) > 4 * 3600000
              const amber = !over && (now - new Date(lot.arrivedAt).getTime()) > 2 * 3600000
              const isSelected = lot.id === selectedLot?.id
              const borderC = isSelected ? 'var(--accent-cyan)' : over ? '#EF4444' : amber ? '#F59E0B' : 'var(--border)'
              return (
                <div
                  key={lot.id}
                  onClick={() => handleSelectLot(lot.id)}
                  style={{
                    padding: '12px', borderRadius: 8, margin: '4px 0', cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: `1px solid ${borderC}`,
                    borderLeft: `3px solid ${borderC}`,
                    background: isSelected ? 'rgba(91,200,217,0.08)' : over ? 'rgba(239,68,68,0.04)' : amber ? 'rgba(245,158,11,0.04)' : 'var(--bg-elevated)',
                    animation: `fadeInUp 0.2s ease ${i * 40}ms both`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: over ? '#EF4444' : amber ? '#F59E0B' : '#F59E0B', flexShrink: 0, animation: over ? 'timerPulse 1s infinite' : undefined }} />
                    <span className="mono-id" style={{ fontSize: 12 }}>{lot.id}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, marginBottom: 1 }}>{lot.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{lot.vendor} · {lot.qty} {lot.unit}</div>
                  <LiveTimer startTime={lot.arrivedAt} label="Waiting" />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Disposition Workspace ── */}
        <div style={{
          flex: 1, background: 'var(--bg-page)',
          borderRadius: '0 12px 12px 0', border: '1px solid var(--border)',
          borderLeft: 'none', overflow: 'auto',
        }}>
          {!selectedLot ? (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
              <FlaskConical size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 16 }}>Select a lot from the queue to begin IQC</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>IQC Decision — IPC Station (QA Area)</div>
            </div>
          ) : (
            <div style={{ padding: 24 }}>

              {/* ── Lot ID Hero ── */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>MES Internal Lot ID</div>
                    <div className="mono-id gradient-text" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{selectedLot.id}</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={selectedLot.status} />
                      {isOverdue && (
                        <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <AlertTriangle size={11} /> SLA BREACHED
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GRN: {selectedLot.grnId}</span>
                    </div>
                  </div>
                  <LiveTimer startTime={selectedLot.arrivedAt} slaMs={4 * 3600000} label="QC SLA (4h)" />
                </div>
              </div>

              {/* ── GRN Reference Data ── */}
              <Card style={{ marginBottom: 16 }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 3, height: 14, background: 'var(--accent-cyan)', borderRadius: 2 }} />
                    GRN Reference Data
                  </div>

                  {/* Row 1: Material / Vendor + Received Qty */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        Material / Vendor <Lock size={8} style={{ opacity: 0.5 }} />
                      </div>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 6 }}>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{selectedLot.material}</div>
                        <div style={{ fontSize: 12, color: 'var(--accent-cyan)', marginTop: 1 }}>{selectedLot.vendor}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        Received Qty <Lock size={8} style={{ opacity: 0.5 }} />
                      </div>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 6, height: 55, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'Space Mono, monospace' }}>
                          {selectedLot.qty}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>{selectedLot.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Vendor Lot No. + GRN Timestamp + Waiting Duration */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <ReadonlyField label="Vendor Lot Number" value={selectedLot.vendorLotNo} mono />
                    <ReadonlyField
                      label="GRN Timestamp"
                      value={fmtTs(selectedLot.grnTimestamp || selectedLot.arrivedAt)}
                    />
                    <WaitingBadge arrivedAt={selectedLot.arrivedAt} />
                  </div>
                </div>
              </Card>

              {/* ── IQC Decision ── */}
              <Card accent style={{ marginBottom: 16 }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 3, height: 14, background: 'var(--gradient-cta)', borderRadius: 2 }} />
                      IQC Decision
                    </div>
                    <ReadonlyField label="Inspector Name" value={inspectorName} />
                  </div>

                  {/* Decision Radio Buttons */}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                    Inspection Decision * — select one
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {(['PASS', 'HOLD', 'REJECT']).map(d => {
                      const cfg = LABEL_CFG[d]
                      const DIcon = cfg.icon
                      const isActive = decision === d
                      return (
                        <button
                          key={d}
                          onClick={() => { setDecision(isActive ? null : d); if (!isActive) { setHoldReason(''); setRejectionReason('') } }}
                          style={{
                            padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                            border: `2px solid ${isActive ? cfg.color : 'var(--border)'}`,
                            background: isActive ? cfg.bg : 'var(--bg-elevated)',
                            transition: 'all 0.15s',
                            boxShadow: isActive ? `0 0 0 3px ${cfg.border}` : 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            fontFamily: 'Space Grotesk, sans-serif',
                          }}
                        >
                          <DIcon size={22} style={{ color: isActive ? cfg.color : 'var(--text-muted)' }} strokeWidth={isActive ? 2.25 : 1.75} />
                          <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? cfg.color : 'var(--text-body)', letterSpacing: '0.5px' }}>{d}</div>
                          <div style={{ fontSize: 10, color: isActive ? cfg.color : 'var(--text-muted)' }}>
                            QC Label: <strong>{cfg.label}</strong>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* HOLD: Hold Reason + Re-inspection Date */}
                  {decision === 'HOLD' && (
                    <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginBottom: 10 }}>HOLD Details</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <InputField
                          label="Hold Reason *"
                          as="select"
                          value={holdReason}
                          onChange={e => setHoldReason(e.target.value)}
                          options={HOLD_REASONS}
                        />
                        <InputField
                          label="Re-Inspection Date *"
                          type="date"
                          value={reinspectionDate}
                          onChange={e => setReinspectionDate(e.target.value)}
                          hint="System sends reminder on this date"
                        />
                      </div>
                      {holdReason === 'Other' && (
                        <div style={{ marginTop: 10 }}>
                          <InputField
                            label="Specify Hold Reason"
                            value={holdReasonText}
                            onChange={e => setHoldReasonText(e.target.value)}
                            placeholder="Describe hold reason…"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* REJECT: Rejection Reason Code */}
                  {decision === 'REJECT' && (
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', marginBottom: 10 }}>REJECTION Details</div>
                      <InputField
                        label="Rejection Reason Code *"
                        as="select"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        options={REJECTION_REASONS}
                        hint="Exception EX-QC-02 will be auto-raised on rejection"
                      />
                      {rejectionReason === 'Other' && (
                        <div style={{ marginTop: 10 }}>
                          <InputField
                            label="Specify Rejection Reason"
                            value={rejectionReasonText}
                            onChange={e => setRejectionReasonText(e.target.value)}
                            placeholder="Describe rejection reason…"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes (always visible) */}
                  <InputField
                    label="Inspection Notes / Observations"
                    as="textarea"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Record test results, observations, anomalies… (e.g. Brix 64.8, pH 3.2, COA verified)"
                    rows={3}
                  />

                  {/* Inspection Timestamp preview */}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={10} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Inspection Timestamp — auto-stamped at submission
                    </span>
                  </div>

                  {/* Submit */}
                  {decision && (
                    <div style={{ marginTop: 14 }}>
                      <PrimaryButton
                        fullWidth size="lg"
                        onClick={openConfirm}
                        style={{
                          background: labelCfg ? `linear-gradient(90deg, ${labelCfg.color}aa, ${labelCfg.color})` : 'var(--gradient-cta)',
                          opacity: canSubmit ? 1 : 0.5,
                        }}
                      >
                        {canSubmit ? `Confirm ${decision} →` : `Complete required fields to ${decision}`}
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              </Card>

            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Dialog ── */}
      {showConfirm && selectedLot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card className="animate-scale-in" style={{ width: 460, maxWidth: '92vw' }}>
            <div style={{ padding: 28 }}>

              {/* QC Label Color — prominent */}
              {labelCfg && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  background: labelCfg.bg, border: `1px solid ${labelCfg.border}`,
                  borderRadius: 10, marginBottom: 20,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: labelCfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {LabelIcon && <LabelIcon size={20} style={{ color: '#fff' }} strokeWidth={2.25} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: labelCfg.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>QC Label Colour</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: labelCfg.color, letterSpacing: '1px' }}>{labelCfg.label}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: labelCfg.color }}>
                    <Printer size={14} />
                    <span style={{ fontSize: 11 }}>Zebra/SATO</span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Confirm {decision}?
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-body)', marginBottom: 16, lineHeight: 1.5 }}>
                {decision === 'PASS'   && `Lot ${selectedLot.id} will be marked APPROVED. A put-away task will be created automatically.`}
                {decision === 'HOLD'   && `Lot ${selectedLot.id} will be placed on HOLD. Re-inspection reminder will be sent on ${reinspectionDate || 'TBD'}.`}
                {decision === 'REJECT' && `Lot ${selectedLot.id} will be REJECTED. Exception EX-QC-02 will be raised and return-to-vendor process initiated.`}
              </div>

              {/* Summary fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {[
                  ['Lot ID', selectedLot.id],
                  ['Vendor', selectedLot.vendor],
                  ['Inspector', inspectorName],
                  ['Inspection Timestamp', fmtTs(inspectionTimestamp?.toISOString())],
                  decision === 'HOLD' && ['Hold Reason', holdReason === 'Other' ? holdReasonText : holdReason],
                  decision === 'HOLD' && ['Re-Inspection By', reinspectionDate || '—'],
                  decision === 'REJECT' && ['Rejection Code', rejectionReason === 'Other' ? rejectionReasonText : rejectionReason],
                ].filter(Boolean).map(([k, v]) => v && (
                  <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 500, wordBreak: 'break-word' }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton fullWidth onClick={() => setShowConfirm(false)}>Cancel</SecondaryButton>
                <PrimaryButton
                  fullWidth
                  onClick={handleDecisionConfirm}
                  style={{ background: labelCfg ? labelCfg.color : undefined }}
                >
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
