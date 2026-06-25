import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import ScanInput from '../../components/ScanInput'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'

const WAREHOUSE_ZONES = [
  { zone: 'Zone A', code: 'A', label: 'Dry Goods', color: '#5BC8D9', locations: ['A-01', 'A-02', 'A-03', 'A-04'] },
  { zone: 'Zone B', code: 'B', label: 'Concentrates', color: '#A78BFA', locations: ['B-01', 'B-02', 'B-03'] },
  { zone: 'Zone C', code: 'C', label: 'Cold Store', color: '#F59E0B', locations: ['C-01', 'C-02'] },
]

const MOCK_LOCATIONS = {
  'A03B12': { display: 'A-03 / B-12', zone: 'Zone A — Dry Goods', capacity: '240 bags available' },
  'B01C04': { display: 'B-01 / C-04', zone: 'Zone B — Concentrates', capacity: '180 bags available' },
  'C02A08': { display: 'C-02 / A-08', zone: 'Zone C — Cold Store', capacity: '120 bags available' },
}

function Stepper({ value, onChange, min = 0, max = 999, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => onChange(Math.max(min, value - 1))} style={{
          width: 48, height: 48, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '8px 0 0 8px', color: '#fff', fontSize: 20, cursor: 'pointer',
        }}>−</button>
        <div style={{
          width: 72, height: 48, background: 'var(--input-bg)', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff',
        }}>
          {value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + 1))} style={{
          width: 48, height: 48, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '0 8px 8px 0', color: '#fff', fontSize: 20, cursor: 'pointer',
        }}>+</button>
      </div>
    </div>
  )
}

export default function PutAway() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch, addToast } = useStore()
  const prefill = location.state || {}

  const preselectedLot = prefill.lotId ? state.lots.find(l => l.id === prefill.lotId) : null
  const approvedLots = state.lots.filter(l => l.status === 'APPROVED' && !l.location)

  const [selectedLot, setSelectedLot] = useState(preselectedLot || approvedLots[0] || null)
  const [scannedLocation, setScannedLocation] = useState(null)
  const [pallets, setPallets] = useState(4)
  const [bagsPerPallet, setBagsPerPallet] = useState(25)
  const [done, setDone] = useState(false)

  const handleScan = (val) => {
    const key = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const found = MOCK_LOCATIONS[key] || (val.length >= 4 ? { display: val, zone: 'Zone A — General', capacity: '200 bags available' } : null)
    if (found) { setScannedLocation(found); return true }
    return false
  }

  const totalBags = pallets * bagsPerPallet

  const handleConfirm = () => {
    if (!selectedLot || !scannedLocation) return
    dispatch({
      type: 'CONFIRM_PUT_AWAY',
      payload: { lotId: selectedLot.id, location: scannedLocation.display, pallets, bags: totalBags }
    })
    addToast({ type: 'success', title: 'Inventory Updated', message: `${selectedLot.id} → ${scannedLocation.display} · AVAILABLE FOR ISSUANCE` })
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 440px' }}>
          <Card accent accentColor="#10B981" className="animate-scale-in">
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Inventory Updated</div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: 'var(--text-body)' }}>{selectedLot?.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)', margin: '4px 0' }}>{scannedLocation?.display}</div>
                <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>AVAILABLE FOR ISSUANCE</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryButton fullWidth onClick={() => navigate('/stage1/qa-inspection')}>Back to QA Queue</PrimaryButton>
                <SecondaryButton fullWidth onClick={() => navigate('/stage1/grn/new')}>New GRN</SecondaryButton>
                <SecondaryButton fullWidth onClick={() => navigate('/')}>Dashboard</SecondaryButton>
              </div>
            </div>
          </Card>
        </div>
        <SidePanel lots={approvedLots} navigate={navigate} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/* Main form column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage1/qa-inspection')}>← QA Queue</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage2/requisition')}>Stage 2 →</SecondaryButton>
        </div>

        {/* Lot Selection (if multiple approved and no preselect) */}
        {approvedLots.length > 1 && !preselectedLot && (
          <Card>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Select Approved Lot</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {approvedLots.map(lot => (
                  <div key={lot.id} onClick={() => setSelectedLot(lot)}
                    style={{ padding: '10px 14px', background: selectedLot?.id === lot.id ? 'rgba(91,200,217,0.1)' : 'var(--bg-elevated)', borderRadius: 8, border: `1px solid ${selectedLot?.id === lot.id ? 'var(--accent-cyan)' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="mono-id" style={{ fontSize: 13 }}>{lot.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lot.material} · {lot.qty} {lot.unit}</div>
                    </div>
                    <StatusBadge status="APPROVED" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Selected Lot Context */}
        {selectedLot && (
          <Card style={{ borderLeft: '3px solid #10B981' }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div className="mono-id" style={{ fontSize: 15, marginBottom: 4 }}>{selectedLot.id}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>{selectedLot.material}</div>
                </div>
                <StatusBadge status="APPROVED" size="lg" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  ['Vendor', selectedLot.vendor],
                  ['Quantity', `${selectedLot.qty} ${selectedLot.unit}`],
                  ['GRN', selectedLot.grnId || '—'],
                  ['Lot ID', selectedLot.id],
                  ['Expiry', selectedLot.expiryDate || '—'],
                  ['Bags', `${totalBags} planned`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Location Scan */}
        <Card>
          <div style={{ padding: 20 }}>
            <ScanInput label="Scan Aisle-Bay Location" onScan={handleScan} placeholder="e.g. A03B12 or scan QR…" />
            {scannedLocation && (
              <div className="animate-fade-in" style={{ marginTop: 14, padding: 16, background: 'rgba(91,200,217,0.08)', border: '1px solid rgba(91,200,217,0.3)', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 4 }}>{scannedLocation.display}</div>
                <div style={{ fontSize: 13, color: 'var(--text-body)', marginBottom: 2 }}>{scannedLocation.zone}</div>
                <div style={{ fontSize: 12, color: '#10B981' }}>✓ {scannedLocation.capacity}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Quantities */}
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Quantities</div>
            <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
              <Stepper label="Pallets" value={pallets} onChange={setPallets} min={1} />
              <Stepper label="Bags / Pallet" value={bagsPerPallet} onChange={setBagsPerPallet} min={1} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-elevated)', borderRadius: 8, padding: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Bags</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-cyan)' }}>{totalBags}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. Weight</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{selectedLot?.qty || 0} {selectedLot?.unit || 'KG'}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary before confirm */}
        {scannedLocation && selectedLot && (
          <Card accent accentColor="var(--gradient-cta)">
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Put Away Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  ['Lot', selectedLot.id], ['Material', selectedLot.material],
                  ['Location', scannedLocation.display], ['Pallets', String(pallets)],
                  ['Total Bags', String(totalBags)], ['Operator', 'Store Operator'],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryButton fullWidth size="xl" onClick={handleConfirm} disabled={!selectedLot || !scannedLocation}>
            CONFIRM PUT AWAY →
          </PrimaryButton>
          <SecondaryButton size="xl" onClick={() => addToast({ type: 'info', message: 'Pallet labels sent to printer' })}>🖨</SecondaryButton>
        </div>
      </div>

      {/* Right sidebar */}
      <SidePanel lots={approvedLots} navigate={navigate} selectedId={selectedLot?.id} onSelect={setSelectedLot} />
    </div>
  )
}

function SidePanel({ lots, navigate, selectedId, onSelect }) {
  return (
    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Awaiting Put Away */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 14, background: '#10B981', borderRadius: 2 }} />
            Awaiting Put Away
            {lots.length > 0 && <span style={{ marginLeft: 'auto', background: '#10B981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{lots.length}</span>}
          </div>
          {lots.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No lots pending put away</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              {lots.map(lot => (
                <div key={lot.id}
                  onClick={() => onSelect && onSelect(lot)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: selectedId === lot.id ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${selectedId === lot.id ? '#10B981' : 'var(--border)'}`,
                    borderLeft: `3px solid ${selectedId === lot.id ? '#10B981' : 'rgba(16,185,129,0.3)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="mono-id" style={{ fontSize: 12, marginBottom: 3 }}>{lot.id}</div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{lot.material}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lot.qty} {lot.unit} · {lot.vendor}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Warehouse Zone Map */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 14, background: 'var(--accent-cyan)', borderRadius: 2 }} />
            Warehouse Zones
          </div>
          {WAREHOUSE_ZONES.map(z => (
            <div key={z.zone} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{z.zone}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{z.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {z.locations.map(loc => (
                  <div key={loc} style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'Space Mono',
                    background: `${z.color}18`, color: z.color, border: `1px solid ${z.color}33`,
                  }}>{loc}</div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-elevated)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Scan format: <span style={{ fontFamily: 'Space Mono', color: 'var(--accent-cyan)' }}>ZnnBnn</span> (Zone + Aisle + Bay)
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Quick Links</div>
          {[
            { label: '← QA Queue', path: '/stage1/qa-inspection' },
            { label: 'Material Requisition →', path: '/stage2/requisition' },
            { label: 'View Inventory', path: '/' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
              background: 'none', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 6,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >{label}</button>
          ))}
        </div>
      </Card>
    </div>
  )
}
