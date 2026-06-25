import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import InputField from '../../components/InputField'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'
import Stepper from '../../components/Stepper'
import ScanInput from '../../components/ScanInput'
import LiveTimer from '../../components/LiveTimer'

const STEPS = ['Select Order', 'Enter Details', 'Review & Submit']

function StageNav() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <SecondaryButton size="sm" onClick={() => navigate('/stage1/truck-arrival')}>← Truck Arrival</SecondaryButton>
      <SecondaryButton size="sm" onClick={() => navigate('/stage1/qa-inspection')}>QA Queue →</SecondaryButton>
    </div>
  )
}

export default function GrnCreation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch, addToast } = useStore()
  const prefill = location.state || {}

  const [step, setStep] = useState(0)
  const [selectedPO, setSelectedPO] = useState(null)
  const [poSearch, setPoSearch] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState(prefill.vehicleNumber || '')
  const [materialDetails, setMaterialDetails] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitTime, setSubmitTime] = useState(null)

  const filteredPOs = state.purchaseOrders.filter(po =>
    po.id.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.vendor.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.material.toLowerCase().includes(poSearch.toLowerCase())
  )

  const handleSelectPO = (po) => {
    setSelectedPO(po)
    const details = {}
    po.materials.forEach(m => {
      details[m.name] = { received: '', pallets: '', bags: '', expiry: '', dcNo: '', vendorLotNo: '' }
    })
    setMaterialDetails(details)
    setStep(1)
    addToast({ type: 'info', title: 'PO Selected', message: `${po.id} — ${po.vendor}` })
  }

  const handleGS1Scan = (val) => {
    if (!selectedPO) return false
    const updates = {}
    selectedPO.materials.forEach(m => {
      updates[m.name] = { ...materialDetails[m.name], received: String(m.ordered * 0.96 | 0), dcNo: 'DC-' + val.slice(0, 8), vendorLotNo: 'VL-' + val.slice(0, 6), expiry: '2025-12-31' }
    })
    setMaterialDetails(updates)
    addToast({ type: 'success', title: 'GS1 Decoded', message: '4 fields auto-filled from barcode' })
    return true
  }

  const getVariance = (mat, received) => {
    if (!received || !mat) return null
    const diff = ((Number(received) - mat.ordered) / mat.ordered) * 100
    return diff
  }

  const hasVariance = selectedPO?.materials.some(m => {
    const v = getVariance(m, materialDetails[m.name]?.received)
    return v !== null && Math.abs(v) > 3
  })

  const handleSubmit = () => {
    const grnId = `GRN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(state.lots.length + 1).padStart(3,'0')}`
    const firstMat = selectedPO.materials[0]
    const received = Number(materialDetails[firstMat.name]?.received) || firstMat.ordered
    dispatch({
      type: 'SUBMIT_GRN',
      payload: {
        grnId, vehicleNumber, vendor: selectedPO.vendor,
        material: firstMat.name, qty: received, unit: firstMat.unit,
        expiryDate: materialDetails[firstMat.name]?.expiry,
        poId: selectedPO.id,
      }
    })
    const lotId = `LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-00${state.lots.length + 1}`
    setSubmitTime(new Date())
    setSubmitted({ grnId, lotId, vendor: selectedPO.vendor, material: firstMat.name })
    addToast({ type: 'success', title: 'GRN Submitted', message: `${grnId} → ${lotId} created & sent to QA queue` })
    if (hasVariance) {
      dispatch({ type: 'RAISE_EXCEPTION', payload: { code: 'EX-GRN-01', type: 'VARIANCE', severity: 'MEDIUM', description: `Quantity variance on ${grnId} requires Store Manager approval.`, actor: 'Store Operator', stage: 1, lotId } })
      addToast({ type: 'warning', title: 'EX-GRN-01 Raised', message: 'Variance >3% — awaiting Store Manager approval', route: '/exceptions' })
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 640 }}>
        <StageNav />
        <Card accent accentColor="var(--gradient-cta)" className="animate-scale-in">
          <div style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>GRN Created Successfully</div>
              <div className="mono-id" style={{ fontSize: 16, marginBottom: 4 }}>{submitted.grnId}</div>
              <div className="mono-id gradient-text" style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{submitted.lotId}</div>
              <StatusBadge status="UNDER_INSPECTION" size="lg" />
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IQC Request</div>
                  <div style={{ fontSize: 14, color: '#10B981', fontWeight: 600 }}>✓ Auto-triggered</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Label Status</div>
                  <div style={{ fontSize: 14, color: '#5BC8D9', fontWeight: 600 }}>Zebra Printer 1</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Dock-to-Store SLA (4h)</div>
                {submitTime && <LiveTimer startTime={submitTime.toISOString()} slaMs={4 * 3600000} />}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PrimaryButton fullWidth size="lg" onClick={() => navigate('/stage1/qa-inspection')}>View in QA Queue →</PrimaryButton>
              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton fullWidth onClick={() => addToast({ type: 'info', message: 'GRN label sent to printer' })}>Print Now (GRN)</SecondaryButton>
                <SecondaryButton fullWidth onClick={() => addToast({ type: 'info', message: 'All pallet labels sent to printer' })}>Print All (Pallets)</SecondaryButton>
              </div>
              <SecondaryButton fullWidth onClick={() => { setSubmitted(null); setStep(0); setSelectedPO(null); setVehicleNumber('') }}>New GRN</SecondaryButton>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <StageNav />
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <Card accent>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Select Purchase Order</div>
              <InputField value={poSearch} onChange={e => setPoSearch(e.target.value)} placeholder="Search PO No., Vendor, or Material…" />
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredPOs.map(po => (
                  <div key={po.id} style={{
                    padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 8,
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.background = 'rgba(91,200,217,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 4, alignItems: 'center' }}>
                        <span className="mono-id" style={{ fontSize: 14 }}>{po.id}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{po.materials.length} material{po.materials.length > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-body)' }}>{po.vendor}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expected: {po.expectedDate}</div>
                    </div>
                    <button onClick={() => handleSelectPO(po)} style={{
                      background: 'var(--gradient-cta)', border: 'none', borderRadius: 6,
                      padding: '8px 16px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>
                      SELECT →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {step === 1 && selectedPO && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ padding: '12px 20px', background: 'rgba(91,200,217,0.04)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Selected PO: </span>
                  <span className="mono-id" style={{ fontSize: 14 }}>{selectedPO.id}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-body)', marginLeft: 12 }}>{selectedPO.vendor}</span>
                </div>
                <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Change PO</button>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>GS1 Barcode Scan</div>
                <ScanInput label="Scan GS1 Barcode (optional)" onScan={handleGS1Scan} placeholder="Scan or enter GS1 barcode…" />
              </div>
            </Card>

            {selectedPO.materials.map(mat => {
              const d = materialDetails[mat.name] || {}
              const variance = getVariance(mat, d.received)
              const isOver = variance !== null && Math.abs(variance) > 3
              return (
                <Card key={mat.name} accent={isOver} accentColor="#F59E0B">
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
                      {mat.name}
                      {isOver && (
                        <span style={{ marginLeft: 12, fontSize: 12, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '2px 10px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.3)' }}>
                          ⚠ VARIANCE {variance?.toFixed(1)}% — APPROVAL REQUIRED
                        </span>
                      )}
                      {variance !== null && !isOver && (
                        <span style={{ marginLeft: 12, fontSize: 12, background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 10px', borderRadius: 99 }}>
                          ✓ WITHIN ±3%
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <InputField label="Vendor Lot No." value={d.vendorLotNo || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], vendorLotNo: e.target.value } }))} autoFilled={!!d.vendorLotNo} />
                      <InputField label="DC / Challan No." value={d.dcNo || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], dcNo: e.target.value } }))} autoFilled={!!d.dcNo} />
                      <div>
                        <InputField label={`Received Qty (PO: ${mat.ordered} ${mat.unit})`} type="number" value={d.received || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], received: e.target.value } }))} placeholder={String(mat.ordered)} error={isOver ? 'Variance >3% — requires approval' : undefined} />
                      </div>
                      <InputField label="Expiry Date" type="date" value={d.expiry || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], expiry: e.target.value } }))} autoFilled={!!d.expiry} />
                      <InputField label="Pallet Count" type="number" value={d.pallets || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], pallets: e.target.value } }))} />
                      <InputField label="Bag Count" type="number" value={d.bags || ''} onChange={e => setMaterialDetails(prev => ({ ...prev, [mat.name]: { ...prev[mat.name], bags: e.target.value } }))} />
                    </div>
                  </div>
                </Card>
              )
            })}

            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Vehicle & Documents</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <InputField label="Vehicle Number" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} autoFilled={!!prefill.vehicleNumber} />
                  <InputField label="DC / Invoice No." value={''} onChange={() => {}} placeholder="INV-2024-XXXX" />
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <SecondaryButton onClick={() => setStep(0)}>← Back</SecondaryButton>
              <PrimaryButton onClick={() => setStep(2)}>Review & Submit →</PrimaryButton>
            </div>
          </div>
        )}

        {step === 2 && selectedPO && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card accent>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Review GRN</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    ['Purchase Order', selectedPO.id], ['Vendor', selectedPO.vendor],
                    ['Vehicle', vehicleNumber || '—'], ['Expected Date', selectedPO.expectedDate],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 14, color: v === '—' ? 'var(--text-muted)' : '#fff', fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {selectedPO.materials.map(mat => {
                  const d = materialDetails[mat.name] || {}
                  const variance = getVariance(mat, d.received)
                  return (
                    <div key={mat.name} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{mat.name}</span>
                        {variance !== null && Math.abs(variance) > 3 && (
                          <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 600 }}>⚠ VAR {variance?.toFixed(1)}%</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-body)' }}>
                        Ordered: {mat.ordered} {mat.unit} · Received: {d.received || '—'} {mat.unit}
                      </div>
                    </div>
                  )
                })}
                {hasVariance && (
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: 14, marginTop: 12 }}>
                    <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>⚠ Variance Exceeds ±3% Tolerance</div>
                    <div style={{ color: 'var(--text-body)', fontSize: 12, marginTop: 4 }}>Exception EX-GRN-01 will be raised. Requires Store Manager approval before lot can be created.</div>
                  </div>
                )}
              </div>
            </Card>
            <div style={{ display: 'flex', gap: 12 }}>
              <SecondaryButton onClick={() => setStep(1)}>← Edit Details</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} size="lg" style={{ background: 'var(--gradient-cta)', flex: 1 }}>SUBMIT GRN</PrimaryButton>
              <SecondaryButton onClick={() => addToast({ type: 'info', message: 'Draft saved' })}>Save as Draft</SecondaryButton>
            </div>
          </div>
        )}
      </div>

      {/* Live Summary Panel */}
      <div style={{ width: 280, flexShrink: 0, minWidth: 0 }}>
        <Card style={{ position: 'sticky', top: 0 }}>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>GRN Summary</div>
            {selectedPO ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Purchase Order</div>
                  <div className="mono-id" style={{ fontSize: 14 }}>{selectedPO.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vendor</div>
                  <div style={{ fontSize: 13, color: '#fff' }}>{selectedPO.vendor}</div>
                </div>
                {selectedPO.materials.map(mat => {
                  const d = materialDetails[mat.name] || {}
                  const pct = d.received ? Math.min((Number(d.received) / mat.ordered) * 100, 120) : 0
                  const isOver = pct > 103
                  const barColor = isOver ? '#EF4444' : pct > 97 ? '#10B981' : pct > 80 ? '#F59E0B' : '#5BC8D9'
                  return (
                    <div key={mat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{mat.name}</span>
                        <span style={{ fontSize: 11, color: barColor }}>{d.received ? `${d.received}/${mat.ordered}` : `—/${mat.ordered}`} {mat.unit}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vehicle</div>
                  <div className="mono-id" style={{ fontSize: 13 }}>{vehicleNumber || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Variance Flags</div>
                  <div style={{ fontSize: 14, color: hasVariance ? '#F59E0B' : '#10B981', fontWeight: 600 }}>
                    {hasVariance ? '⚠ Review Required' : '✓ Within Tolerance'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select a PO to view summary</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
