import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'
import ScanInput from '../../components/ScanInput'

const STATIONS = [
  { id: 'STN-01', operator: 'Priya S.', pouchType: 'Campa Cola 200ml', pickStatus: 'CONFIRMED', cartonId: 'CTN-NEW-001', shiftCount: 34 },
  { id: 'STN-02', operator: 'Anil M.', pouchType: 'Campa Cola 200ml', pickStatus: 'PENDING', cartonId: null, shiftCount: 28 },
  { id: 'STN-03', operator: 'Ravi K.', pouchType: 'Campa Lemon 200ml', pickStatus: 'CONFIRMED', cartonId: 'CTN-NEW-002', shiftCount: 41 },
  { id: 'STN-04', operator: 'Sunita R.', pouchType: 'Campa Cola 200ml', pickStatus: 'PENDING', cartonId: null, shiftCount: 22 },
]

const PALLETS_MOCK = [
  { id: 'PLT-NEW-001', cartons: 12, sku: 'Campa Cola 200ml', status: 'BUILDING', batch: 'BATCH-20240624-001' },
]

export default function SecondaryPacking() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useStore()
  const [stations, setStations] = useState(STATIONS)
  const [pallets, setPallets] = useState(PALLETS_MOCK)
  const [tab, setTab] = useState('stations')
  const [cartonFill, setCartonFill] = useState(36)
  const CARTON_CAPACITY = 48

  const handlePickConfirm = (stnId) => {
    setStations(s => s.map(st => st.id === stnId ? { ...st, pickStatus: 'CONFIRMED', cartonId: `CTN-NEW-${String(Date.now()).slice(-4)}` } : st))
    addToast({ type: 'success', title: 'Pick Confirmed', message: `${stnId} — carton association set` })
  }

  const handleScan = (val) => {
    setCartonFill(f => {
      const next = f + 1
      if (next >= CARTON_CAPACITY) {
        addToast({ type: 'success', title: 'CARTON FULL', message: `${val} — Carton ID assigned, QR genealogy linked` })
        dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: `Carton sealed → Pallet PLT-NEW-001` } })
        return 0
      }
      return next
    })
    return true
  }

  const handlePalletClose = (palletId) => {
    const skus = new Set(stations.map(s => s.pouchType))
    if (skus.size > 1) {
      dispatch({ type: 'RAISE_EXCEPTION', payload: { code: 'EX-PLT', type: 'MIXED_SKU', severity: 'HIGH', description: 'Mixed SKU detected on pallet — single-SKU rule violated', actor: 'System', stage: 7 } })
      addToast({ type: 'error', title: 'EX-PLT Raised', message: 'Mixed SKU on pallet — exception raised', route: '/exceptions' })
    } else {
      setPallets(p => p.map(pl => pl.id === palletId ? { ...pl, status: 'CLOSED' } : pl))
      addToast({ type: 'success', title: 'Pallet Closed', message: `${palletId} → QA Inspection` })
      navigate('/stage8/fg-dispatch')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage6/isa')}>← Stage 6</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage8/fg-dispatch')}>Stage 8 →</SecondaryButton>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['stations', 'cartons', 'pallets'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: tab === t ? '#fff' : 'var(--text-muted)',
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      {tab === 'stations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {stations.map(stn => (
            <Card key={stn.id} accent={stn.pickStatus === 'CONFIRMED'} accentColor="#10B981">
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)' }}>{stn.id}</span>
                  <StatusBadge status={stn.pickStatus === 'CONFIRMED' ? 'APPROVED' : 'PENDING'} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{stn.operator}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{stn.pouchType}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, marginBottom: 12 }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Shift: </span><span style={{ color: '#fff', fontWeight: 600 }}>{stn.shiftCount}</span></div>
                  {stn.cartonId && <div><span style={{ color: 'var(--text-muted)' }}>Carton: </span><span className="mono-id" style={{ fontSize: 12 }}>{stn.cartonId}</span></div>}
                </div>
                {stn.pickStatus === 'PENDING' && (
                  <PrimaryButton size="sm" onClick={() => handlePickConfirm(stn.id)}>Confirm Pick</PrimaryButton>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'cartons' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <Card accent>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Active Carton Fill</div>
              <ScanInput label="Scan Pouch → Carton" onScan={handleScan} placeholder="Scan pouch barcode…" />
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fill: {cartonFill}/{CARTON_CAPACITY}</span>
                  <span style={{ color: cartonFill >= 44 ? '#10B981' : 'var(--accent-cyan)', fontWeight: 600 }}>{Math.round((cartonFill/CARTON_CAPACITY)*100)}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ width: `${(cartonFill/CARTON_CAPACITY)*100}%`, height: '100%', background: cartonFill >= 44 ? '#10B981' : 'var(--accent-cyan)', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                  {Array.from({ length: CARTON_CAPACITY }, (_, i) => (
                    <div key={i} style={{ height: 14, borderRadius: 2, background: i < cartonFill ? 'var(--accent-cyan)' : 'var(--border)' }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Recent Cartons</div>
              {state.cartons.map(c => (
                <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="mono-id" style={{ fontSize: 12 }}>{c.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.pouches} pouches · {c.batch}</div>
                  <StatusBadge status={c.status === 'CLOSED' ? 'APPROVED' : 'PENDING'} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'pallets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pallets.map(pallet => (
            <Card key={pallet.id} accent accentColor={pallet.status === 'CLOSED' ? '#10B981' : '#5BC8D9'}>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="mono-id" style={{ fontSize: 16, marginBottom: 4 }}>{pallet.id}</div>
                    <div style={{ fontSize: 14, color: '#fff' }}>{pallet.sku}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pallet.cartons} cartons · {pallet.batch}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <StatusBadge status={pallet.status === 'CLOSED' ? 'APPROVED' : 'IN_PROGRESS'} />
                    {pallet.status !== 'CLOSED' && (
                      <PrimaryButton size="sm" onClick={() => handlePalletClose(pallet.id)}>Close Pallet →</PrimaryButton>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
