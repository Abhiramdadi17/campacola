import React, { useState, useRef } from 'react'
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
import { Upload, X, FileText, Image, Lock, AlertTriangle, CheckCircle2, Scan } from 'lucide-react'
import WorkflowJourneyBanner from '../../components/WorkflowJourneyBanner'

const STEPS = ['Select Order', 'Enter Details', 'Review & Submit']

// Material Master — provides code, description, UOM for each material
const MATERIAL_MASTER = {
  'Cola Concentrate 30X': { code: 'MAT-001', description: 'Cola Concentrate 30X — Pepsico proprietary blend, Brix 65±2', uom: 'KG' },
  'Citric Acid':          { code: 'MAT-005', description: 'Citric Acid USP Grade — Food-grade acidulant, anhydrous', uom: 'KG' },
  'Refined Sugar S-30':   { code: 'MAT-002', description: 'Refined Sugar S-30 — Fine crystalline sucrose, 99.7% purity', uom: 'KG' },
  'DM Water Grade A':     { code: 'MAT-003', description: 'Demineralized Water Grade A — TDS <5 ppm, utility grade', uom: 'Litres' },
  'BOPP Film 30mic':      { code: 'MAT-004', description: 'BOPP Film 30 micron — Primary packaging film, food-contact safe', uom: 'Rolls' },
  'Poly Lam 25mic':       { code: 'MAT-006', description: 'Poly Laminate 25 micron — Secondary packaging, heat-sealable', uom: 'Rolls' },
}

function Field({ label, value, muted, mono, badge }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 13, color: muted ? 'var(--text-muted)' : '#fff', fontFamily: mono ? 'Space Mono, monospace' : undefined, fontWeight: 500 }}>
          {value || '—'}
        </div>
        {badge}
      </div>
    </div>
  )
}

function ReadonlyField({ label, value, hint }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <Lock size={9} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
      </div>
      <div style={{
        height: 40, padding: '0 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        borderRadius: 6, display: 'flex', alignItems: 'center',
        fontSize: 13, color: 'var(--accent-cyan)', fontWeight: 500,
      }}>
        {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>Auto-populated</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

function AttachmentUpload({ attachments, onChange, addToast }) {
  const fileRef = useRef()

  const handleFiles = (files) => {
    const next = [...attachments]
    for (const file of Array.from(files)) {
      if (next.length >= 5) { addToast({ type: 'warning', message: 'Maximum 5 attachments allowed' }); break }
      if (file.size > 10 * 1024 * 1024) { addToast({ type: 'error', message: `${file.name} exceeds 10 MB limit` }); continue }
      if (!file.type.match(/pdf|image/)) { addToast({ type: 'warning', message: `${file.name}: Only PDF or image files accepted` }); continue }
      next.push({ name: file.name, size: file.size, type: file.type, id: Date.now() + Math.random() })
    }
    onChange(next)
  }

  const remove = (id) => onChange(attachments.filter(f => f.id !== id))

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${attachments.length >= 5 ? 'var(--border)' : 'rgba(91,200,217,0.3)'}`,
          borderRadius: 8, padding: '20px 16px', textAlign: 'center',
          cursor: attachments.length >= 5 ? 'not-allowed' : 'pointer',
          background: 'rgba(91,200,217,0.02)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (attachments.length < 5) e.currentTarget.style.borderColor = 'rgba(91,200,217,0.6)' }}
        onMouseLeave={e => { if (attachments.length < 5) e.currentTarget.style.borderColor = 'rgba(91,200,217,0.3)' }}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,image/*" style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />
        <Upload size={22} style={{ color: 'var(--accent-cyan)', marginBottom: 8 }} />
        <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>
          {attachments.length >= 5 ? 'Maximum files reached' : 'Drop files here or click to browse'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          COA · Delivery Challan · Test Report · PDF or image · Max 5 files · 10 MB each
        </div>
      </div>

      {attachments.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attachments.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)',
            }}>
              {f.type.includes('pdf')
                ? <FileText size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                : <Image size={14} style={{ color: '#5BC8D9', flexShrink: 0 }} />
              }
              <span style={{ flex: 1, fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtSize(f.size)}</span>
              <button onClick={() => remove(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            {attachments.length}/5 files attached
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10))
  const [remarks, setRemarks] = useState('')
  const [attachments, setAttachments] = useState([])
  const [materialDetails, setMaterialDetails] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitTime, setSubmitTime] = useState(null)
  const [scanOverrides, setScanOverrides] = useState({})

  const filteredPOs = state.purchaseOrders.filter(po =>
    po.id.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.vendor.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.material.toLowerCase().includes(poSearch.toLowerCase())
  )

  const handleSelectPO = (po) => {
    setSelectedPO(po)
    const details = {}
    po.materials.forEach(m => {
      const master = MATERIAL_MASTER[m.name] || {}
      details[m.name] = {
        received: '', pallets: '', bags: '', expiry: '',
        dcNo: '', vendorLotNo: '',
        materialCode: master.code || '',
        uom: m.unit || master.uom || 'KG',
      }
    })
    setMaterialDetails(details)
    setStep(1)
    addToast({ type: 'info', title: 'PO Selected', message: `${po.id} — ${po.vendor}` })
  }

  const handleGS1Scan = (val) => {
    if (!selectedPO) return false
    const updates = {}
    selectedPO.materials.forEach(m => {
      updates[m.name] = {
        ...materialDetails[m.name],
        received: String(m.ordered * 0.96 | 0),
        dcNo: 'DC-' + val.slice(0, 8),
        vendorLotNo: 'VL-' + val.slice(0, 6),
        expiry: '2025-12-31',
      }
    })
    setMaterialDetails(updates)
    addToast({ type: 'success', title: 'GS1 Decoded', message: '5 fields auto-filled from barcode scan' })
    return true
  }

  const handleMatCodeScan = (matName, val) => {
    setScanOverrides(prev => ({ ...prev, [matName]: val }))
    addToast({ type: 'info', message: `Material code overridden: ${val}` })
    return true
  }

  const setMatField = (matName, field, value) =>
    setMaterialDetails(prev => ({ ...prev, [matName]: { ...prev[matName], [field]: value } }))

  const getVariance = (mat, received) => {
    if (!received || !mat) return null
    return ((Number(received) - mat.ordered) / mat.ordered) * 100
  }

  const hasVariance = selectedPO?.materials.some(m => {
    const v = getVariance(m, materialDetails[m.name]?.received)
    return v !== null && Math.abs(v) > 3
  })

  const previewLotId = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-00${state.lots.length + 1}`

  const handleSubmit = () => {
    const now = new Date()
    const grnId = `GRN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(state.lots.length + 1).padStart(3, '0')}`
    const firstMat = selectedPO.materials[0]
    const received = Number(materialDetails[firstMat.name]?.received) || firstMat.ordered
    dispatch({
      type: 'SUBMIT_GRN',
      payload: {
        grnId, vehicleNumber, vendor: selectedPO.vendor,
        material: firstMat.name, qty: received, unit: firstMat.unit,
        expiryDate: materialDetails[firstMat.name]?.expiry,
        poId: selectedPO.id, deliveryDate, remarks,
        attachmentCount: attachments.length,
        dcNo: materialDetails[firstMat.name]?.dcNo,
        vendorLotNo: materialDetails[firstMat.name]?.vendorLotNo,
      }
    })
    const lotId = `LOT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-00${state.lots.length + 1}`
    setSubmitTime(now)
    setSubmitted({ grnId, lotId, vendor: selectedPO.vendor, material: firstMat.name })
    dispatch({ type: 'SET_JOURNEY', payload: { grnId, lotId, currentStep: 2 } })
    addToast({ type: 'success', title: 'GRN Submitted', message: `${grnId} → ${lotId} sent to QA queue` })
    if (hasVariance) {
      dispatch({ type: 'RAISE_EXCEPTION', payload: { code: 'EX-GRN-01', type: 'VARIANCE', severity: 'MEDIUM', description: `Quantity variance on ${grnId} requires Store Manager approval.`, actor: 'Store Operator', stage: 1, lotId } })
      addToast({ type: 'warning', title: 'EX-GRN-01 Raised', message: 'Variance >3% — awaiting Store Manager approval', route: '/exceptions' })
    }
  }

  if (submitted) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}>
        <div>
          <WorkflowJourneyBanner currentStep={2} />
          <StageNav />
          <Card accent accentColor="var(--gradient-cta)" className="animate-scale-in">
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>GRN Created Successfully</div>
                <div className="mono-id" style={{ fontSize: 15, marginBottom: 4, color: 'var(--text-muted)' }}>{submitted.grnId}</div>
                <div className="mono-id gradient-text" style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{submitted.lotId}</div>
                <StatusBadge status="UNDER_INSPECTION" size="lg" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  ['Material', submitted.material],
                  ['Vendor', submitted.vendor],
                  ['Delivery Date', deliveryDate],
                  ['Receipt Time', submitTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
                  ['Attachments', `${attachments.length} file${attachments.length !== 1 ? 's' : ''}`],
                  ['IQC Status', 'Auto-triggered ✓'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Dock-to-Store SLA (4h)</div>
                {submitTime && <LiveTimer startTime={submitTime.toISOString()} slaMs={4 * 3600000} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryButton fullWidth size="lg" onClick={() => navigate('/stage1/qa-inspection', { state: { lotId: submitted?.lotId } })}>View in QA Queue →</PrimaryButton>
                <div style={{ display: 'flex', gap: 10 }}>
                  <SecondaryButton fullWidth onClick={() => addToast({ type: 'info', message: 'GRN label sent to Zebra Printer 1' })}>Print GRN Label</SecondaryButton>
                  <SecondaryButton fullWidth onClick={() => addToast({ type: 'info', message: 'All pallet labels queued for printing' })}>Print Pallet Labels</SecondaryButton>
                </div>
                <SecondaryButton fullWidth onClick={() => { setSubmitted(null); setStep(0); setSelectedPO(null); setVehicleNumber(''); setRemarks(''); setAttachments([]) }}>
                  + New GRN
                </SecondaryButton>
              </div>
            </div>
          </Card>
        </div>
        <Card style={{ position: 'sticky', top: 0 }}>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>QR Label Preview</div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, marginBottom: 8 }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} style={{ height: 8, background: Math.random() > 0.5 ? '#000' : '#fff', border: '0.5px solid #eee' }} />
                ))}
              </div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#000', fontWeight: 700 }}>{submitted.lotId}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              MES Internal Lot ID · Primary traceability anchor
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <WorkflowJourneyBanner currentStep={2} />
        <StageNav />
        <Stepper steps={STEPS} current={step} />

        {/* ── STEP 0: Select Purchase Order ── */}
        {step === 0 && (
          <Card accent>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Select Purchase Order</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Choose from open POs or Inter-Plant Transfer Orders. Vendor and material details auto-populate on selection.</div>
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
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{po.materials.length} line{po.materials.length > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-body)', marginBottom: 2 }}>{po.vendor}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Expected: {po.expectedDate}</span>
                        <span>·</span>
                        <span>{po.materials.map(m => `${m.name} (${m.ordered} ${m.unit})`).join(', ')}</span>
                      </div>
                    </div>
                    <button onClick={() => handleSelectPO(po)} style={{
                      background: 'var(--gradient-cta)', border: 'none', borderRadius: 6,
                      padding: '8px 16px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0,
                    }}>
                      SELECT →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 1: Enter Details ── */}
        {step === 1 && selectedPO && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* PO Header */}
            <Card>
              <div style={{ padding: '12px 20px', background: 'rgba(91,200,217,0.04)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PO / Reference</div>
                    <div className="mono-id" style={{ fontSize: 14 }}>{selectedPO.id}</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor Name</div>
                    <div style={{ fontSize: 13, color: 'var(--accent-cyan)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={10} style={{ opacity: 0.6 }} />{selectedPO.vendor}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected</div>
                    <div style={{ fontSize: 13, color: '#fff' }}>{selectedPO.expectedDate}</div>
                  </div>
                </div>
                <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Change PO</button>
              </div>
            </Card>

            {/* GS1 Barcode Scan */}
            <Card>
              <div style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>GS1 Barcode Auto-Fill</div>
                <ScanInput label="" onScan={handleGS1Scan} placeholder="Scan GS1 barcode to auto-fill Qty, DC No., Vendor Lot No., Expiry…" />
              </div>
            </Card>

            {/* Per-Material Detail Cards */}
            {selectedPO.materials.map(mat => {
              const d = materialDetails[mat.name] || {}
              const master = MATERIAL_MASTER[mat.name] || {}
              const variance = getVariance(mat, d.received)
              const isOver = variance !== null && Math.abs(variance) > 3
              const matCode = scanOverrides[mat.name] || d.materialCode || master.code || '—'

              return (
                <Card key={mat.name} accent={isOver} accentColor="#F59E0B">
                  <div style={{ padding: 20 }}>
                    {/* Material header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{mat.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{master.description || 'Material description from master'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isOver && <span style={{ fontSize: 11, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 600 }}>⚠ VAR {variance?.toFixed(1)}%</span>}
                        {variance !== null && !isOver && <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>✓ ±3%</span>}
                      </div>
                    </div>

                    {/* Row 1: Material Code (scannable) + UOM (read-only) + Material Description */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          Material Code
                          <span style={{ fontSize: 10, color: 'rgba(91,200,217,0.6)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Scan size={9} /> scannable
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{
                            flex: 1, height: 40, padding: '0 12px', background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${scanOverrides[mat.name] ? 'rgba(91,200,217,0.5)' : 'var(--border)'}`,
                            borderRadius: 6, display: 'flex', alignItems: 'center',
                            fontFamily: 'Space Mono, monospace', fontSize: 13,
                            color: scanOverrides[mat.name] ? 'var(--accent-cyan)' : 'rgba(91,200,217,0.7)',
                          }}>
                            {matCode}
                          </div>
                          <button
                            title="Override by scanning vendor barcode"
                            onClick={() => handleMatCodeScan(mat.name, `VEND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)}
                            style={{ width: 40, height: 40, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
                          >
                            <Scan size={14} />
                          </button>
                        </div>
                        {scanOverrides[mat.name] && <div style={{ fontSize: 10, color: 'var(--accent-cyan)', marginTop: 2 }}>Overridden by vendor scan</div>}
                      </div>
                      <ReadonlyField label="UOM" value={d.uom || mat.unit} hint="From Material Master" />
                      <ReadonlyField
                        label="Material Description"
                        value={master.description ? master.description.slice(0, 32) + (master.description.length > 32 ? '…' : '') : undefined}
                      />
                    </div>

                    {/* Row 2: Vendor Lot No. + DC / Challan No. */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <InputField
                        label="Vendor Lot Number *"
                        value={d.vendorLotNo || ''}
                        onChange={e => setMatField(mat.name, 'vendorLotNo', e.target.value)}
                        placeholder="e.g. VL-2024-A001"
                        autoFilled={!!d.vendorLotNo}
                        hint="Printed on bag/pallet — must be unique per vendor"
                      />
                      <InputField
                        label="Delivery Challan Number *"
                        value={d.dcNo || ''}
                        onChange={e => setMatField(mat.name, 'dcNo', e.target.value)}
                        placeholder="e.g. DC-20240624-001"
                        autoFilled={!!d.dcNo}
                        hint="DC number from vendor invoice"
                      />
                    </div>

                    {/* Row 3: Received Qty + Pallet Count + Bag/Container Count */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <InputField
                          label={`Received Quantity * (PO: ${mat.ordered} ${mat.unit})`}
                          type="number"
                          value={d.received || ''}
                          onChange={e => setMatField(mat.name, 'received', e.target.value)}
                          placeholder={String(mat.ordered)}
                          error={isOver ? 'Variance >3% — requires approval' : undefined}
                          autoFilled={!!d.received}
                        />
                        {variance !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            {isOver
                              ? <AlertTriangle size={11} style={{ color: '#F59E0B' }} />
                              : <CheckCircle2 size={11} style={{ color: '#10B981' }} />
                            }
                            <span style={{ fontSize: 11, color: isOver ? '#F59E0B' : '#10B981' }}>
                              {variance > 0 ? '+' : ''}{variance.toFixed(2)}% vs PO
                            </span>
                          </div>
                        )}
                      </div>
                      <InputField
                        label="Pallet Count *"
                        type="number"
                        value={d.pallets || ''}
                        onChange={e => setMatField(mat.name, 'pallets', e.target.value)}
                        placeholder="e.g. 4"
                        hint="Physical pallets received"
                      />
                      <InputField
                        label="Bag / Container Count *"
                        type="number"
                        value={d.bags || ''}
                        onChange={e => setMatField(mat.name, 'bags', e.target.value)}
                        placeholder="e.g. 100"
                        hint="Individual bags or containers"
                      />
                    </div>

                    {/* Row 4: Expiry Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                      <InputField
                        label="Expiry Date *"
                        type="date"
                        value={d.expiry || ''}
                        onChange={e => setMatField(mat.name, 'expiry', e.target.value)}
                        autoFilled={!!d.expiry}
                        hint="From Certificate of Analysis (COA)"
                      />
                      {/* Tolerance bar */}
                      {d.received && (
                        <div style={{ paddingTop: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                            <span>Quantity vs PO tolerance (±3%)</span>
                            <span style={{ color: isOver ? '#F59E0B' : '#10B981' }}>{d.received}/{mat.ordered} {mat.unit}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min((Number(d.received) / mat.ordered) * 100, 100)}%`, height: '100%', background: isOver ? '#F59E0B' : '#10B981', transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}

            {/* Delivery & Transport */}
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Delivery & Transport</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <InputField
                    label="Vehicle / Truck Number *"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH12AB1234"
                    autoFilled={!!prefill.vehicleNumber}
                    hint="Transport vehicle registration"
                  />
                  <InputField
                    label="Delivery Date *"
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    hint="Defaults to today — change for back-dated receipts"
                  />
                  <ReadonlyField
                    label="Receipt Time"
                    value={new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' (approx.)'}
                    hint="Auto-stamped at GRN submission"
                  />
                </div>
              </div>
            </Card>

            {/* Remarks & Documents */}
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Remarks & Documents</div>
                <div style={{ marginBottom: 16 }}>
                  <InputField
                    label="Remarks"
                    as="textarea"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="e.g. outer packaging damaged, inner intact; seal tampered on pallet 3; short-shipment on 2 bags…"
                    hint="Free text — optional"
                  />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Document Attachments
                </div>
                <AttachmentUpload attachments={attachments} onChange={setAttachments} addToast={addToast} />
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <SecondaryButton onClick={() => setStep(0)}>← Back</SecondaryButton>
              <PrimaryButton onClick={() => setStep(2)}>Review & Submit →</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review & Submit ── */}
        {step === 2 && selectedPO && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card accent>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Review GRN</div>

                {/* PO & Transport */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <Field label="Purchase Order" value={selectedPO.id} mono />
                  <Field label="Vendor" value={selectedPO.vendor} />
                  <Field label="Vehicle" value={vehicleNumber} mono muted={!vehicleNumber} />
                  <Field label="Delivery Date" value={deliveryDate} />
                </div>

                {/* Per-material review rows */}
                {selectedPO.materials.map(mat => {
                  const d = materialDetails[mat.name] || {}
                  const variance = getVariance(mat, d.received)
                  const isOver = variance !== null && Math.abs(variance) > 3
                  return (
                    <div key={mat.name} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{mat.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{MATERIAL_MASTER[mat.name]?.code} · {d.uom || mat.unit}</div>
                        </div>
                        {isOver
                          ? <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 600 }}>⚠ VAR {variance?.toFixed(1)}%</span>
                          : variance !== null && <span style={{ color: '#10B981', fontSize: 12 }}>✓ Within ±3%</span>
                        }
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        <Field label="Ordered" value={`${mat.ordered} ${mat.unit}`} muted />
                        <Field label="Received" value={d.received ? `${d.received} ${mat.unit}` : undefined} muted={!d.received} />
                        <Field label="Pallets" value={d.pallets} muted={!d.pallets} />
                        <Field label="Bags" value={d.bags} muted={!d.bags} />
                        <Field label="Vendor Lot No." value={d.vendorLotNo} mono muted={!d.vendorLotNo} />
                        <Field label="DC No." value={d.dcNo} mono muted={!d.dcNo} />
                        <Field label="Expiry" value={d.expiry} muted={!d.expiry} />
                      </div>
                    </div>
                  )
                })}

                {/* Remarks */}
                {remarks && (
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Remarks</div>
                    <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>{remarks}</div>
                  </div>
                )}

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Attachments ({attachments.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {attachments.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4 }}>
                          {f.type.includes('pdf') ? <FileText size={11} style={{ color: '#EF4444' }} /> : <Image size={11} style={{ color: '#5BC8D9' }} />}
                          <span style={{ fontSize: 11, color: 'var(--text-body)' }}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MES Lot ID preview */}
                <div style={{ background: 'rgba(91,200,217,0.06)', border: '1px solid rgba(91,200,217,0.2)', borderRadius: 8, padding: '14px 16px', marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>MES Internal Lot ID (will be generated)</div>
                  <div className="mono-id gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>{previewLotId}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Format: LOT-YYYYMMDD-NNN · Printed on QR label · Primary traceability anchor</div>
                </div>

                {hasVariance && (
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: 14, marginTop: 12 }}>
                    <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>⚠ Quantity Variance Exceeds ±3% Tolerance</div>
                    <div style={{ color: 'var(--text-body)', fontSize: 12, marginTop: 4 }}>Exception EX-GRN-01 will be raised automatically. Lot will remain in QA queue until Store Manager approves the variance.</div>
                  </div>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 12 }}>
              <SecondaryButton onClick={() => setStep(1)}>← Edit Details</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} size="lg" style={{ background: 'var(--gradient-cta)', flex: 1 }}>SUBMIT GRN</PrimaryButton>
              <SecondaryButton onClick={() => addToast({ type: 'info', message: 'Draft saved' })}>Save Draft</SecondaryButton>
            </div>
          </div>
        )}
      </div>

      {/* Live Summary Panel */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <Card style={{ position: 'sticky', top: 0 }}>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>GRN Summary</div>
            {selectedPO ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PO / Reference</div>
                  <div className="mono-id" style={{ fontSize: 13 }}>{selectedPO.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor</div>
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
                        <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{mat.name.split(' ').slice(0, 2).join(' ')}</span>
                        <span style={{ fontSize: 11, color: barColor }}>{d.received || '—'}/{mat.ordered} {mat.unit}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })}
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle</div>
                  <div className="mono-id" style={{ fontSize: 13 }}>{vehicleNumber || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachments</div>
                  <div style={{ fontSize: 13, color: attachments.length > 0 ? '#10B981' : 'var(--text-muted)' }}>
                    {attachments.length > 0 ? `${attachments.length} file${attachments.length > 1 ? 's' : ''}` : 'None yet'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variance</div>
                  <div style={{ fontSize: 13, color: hasVariance ? '#F59E0B' : '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasVariance ? <><AlertTriangle size={12} /> Review Required</> : <><CheckCircle2 size={12} /> Within Tolerance</>}
                  </div>
                </div>
                {step === 2 && (
                  <div style={{ background: 'rgba(91,200,217,0.06)', border: '1px solid rgba(91,200,217,0.15)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>MES Lot ID Preview</div>
                    <div className="mono-id" style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>{previewLotId}</div>
                  </div>
                )}
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
