import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'

const REWORK_BINS = [
  { id: 'RWK-BIN-01', batch: 'BATCH-20240624-001', pouches: 42, status: 'REWORKABLE', issue: 'CW underweight' },
  { id: 'RWK-BIN-02', batch: 'BATCH-20240624-001', pouches: 8, status: 'REJECTED', issue: 'Seal failure' },
]

const BALANCE = {
  bagsLoaded: 620, pouches: 8420, giveaway: 12.4, rejects: 50,
  target: 8482, variance: 62, variancePct: 0.73,
}

export default function Rework() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [decisions, setDecisions] = useState({})
  const [managerNote, setManagerNote] = useState('')
  const [balanceApproved, setBalanceApproved] = useState(false)

  const handleDecision = (binId, dec) => {
    setDecisions(d => ({ ...d, [binId]: dec }))
    addToast({ type: dec === 'REWORKABLE' ? 'success' : 'warning', title: `Bin ${dec}`, message: `${binId} — marked for ${dec === 'REWORKABLE' ? 're-introduction' : 'disposal'}` })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <SecondaryButton size="sm" onClick={() => navigate('/stage4/primary-packing')}>← Stage 4</SecondaryButton>
        <SecondaryButton size="sm" onClick={() => navigate('/stage6/isa')}>Stage 6 →</SecondaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Rework Bins */}
        <Card accent>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Rework Bin Inspection</div>
            {REWORK_BINS.map(bin => (
              <div key={bin.id} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, marginBottom: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono-id" style={{ fontSize: 13 }}>{bin.id}</span>
                  <StatusBadge status={decisions[bin.id] === 'REWORKABLE' ? 'REWORKABLE' : decisions[bin.id] === 'REJECTED' ? 'REJECTED' : 'PENDING'} />
                </div>
                <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>{bin.pouches} pouches — {bin.issue}</div>
                <div className="mono-id" style={{ fontSize: 11, marginBottom: 10 }}>{bin.batch}</div>
                {!decisions[bin.id] && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleDecision(bin.id, 'REWORKABLE')} style={{ flex: 1, padding: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 8, color: '#10B981', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>QA REWORKABLE</button>
                    <button onClick={() => handleDecision(bin.id, 'REJECTED')} style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#EF4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>REJECT</button>
                  </div>
                )}
                {decisions[bin.id] === 'REWORKABLE' && (
                  <div style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>
                    ✓ Rework Order: RWK-{bin.batch}-001 created — pouches flagged REWORK
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Material Balance */}
        <Card accent accentColor="#A78BFA">
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Material Balance Reconciliation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                ['Bags Loaded', `${BALANCE.bagsLoaded} KG`], ['Pouches Filled', BALANCE.pouches.toLocaleString()],
                ['Giveaway', `${BALANCE.giveaway} KG`], ['Rejects', BALANCE.rejects],
                ['Target Pouches', BALANCE.target.toLocaleString()], ['Variance', BALANCE.variance],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{
              padding: 14, borderRadius: 8,
              background: BALANCE.variancePct < 1 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${BALANCE.variancePct < 1 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BALANCE.variancePct < 1 ? '#10B981' : '#F59E0B' }}>
                Balance Variance: {BALANCE.variancePct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {BALANCE.variancePct < 1 ? 'Within ±1% tolerance — ready for sign-off' : 'Exceeds tolerance — manager approval required'}
              </div>
            </div>
            <textarea
              value={managerNote}
              onChange={e => setManagerNote(e.target.value)}
              placeholder="Manager sign-off note…"
              style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, resize: 'vertical', minHeight: 60 }}
            />
            <PrimaryButton fullWidth style={{ marginTop: 12 }} disabled={!managerNote || balanceApproved} onClick={() => {
              setBalanceApproved(true)
              addToast({ type: 'success', title: 'Balance Signed Off', message: 'Material reconciliation approved' })
            }}>
              {balanceApproved ? '✓ Balance Approved' : 'Manager Sign-Off'}
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  )
}
