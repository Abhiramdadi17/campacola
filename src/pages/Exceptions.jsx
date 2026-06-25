import React, { useState } from 'react'
import { useStore } from '../store/mockStore'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import PrimaryButton from '../components/PrimaryButton'
import SecondaryButton from '../components/SecondaryButton'
import InputField from '../components/InputField'

const SEVERITY_COLOR = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#5BC8D9' }

function ExceptionDetail({ ex, onResolve, role }) {
  const [comment, setComment] = useState('')
  const [checklist, setChecklist] = useState({})

  if (!ex) return null

  const canApprove = role === 'Store Manager' || role === 'Production Manager'

  const CHECKLISTS = {
    'EX-QC-02': ['Physical separation of rejected material', 'Red rejection tags applied', 'Material moved to quarantine zone', 'Vendor notified via email', 'Credit note initiated in ERP'],
    'EX-GRN-01': [],
    'EX-QC-01': [],
  }
  const checks = CHECKLISTS[ex.code] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              background: SEVERITY_COLOR[ex.severity] + '22',
              color: SEVERITY_COLOR[ex.severity],
              padding: '4px 12px', borderRadius: 4, fontSize: 13, fontWeight: 700,
              fontFamily: 'Space Mono',
            }}>{ex.code}</span>
            <StatusBadge status={ex.status} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(ex.triggeredAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: 4 }}>{ex.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lot: {ex.lotId} · Stage: {ex.stage} · Actor: {ex.actor}</div>
        </div>
      </div>

      {ex.code === 'EX-GRN-01' && (
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Quantity Variance Approval</div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PO Qty</div><div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>500 KG</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Received</div><div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B' }}>480 KG</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Variance</div><div style={{ fontSize: 18, fontWeight: 700, color: '#EF4444' }}>−4.0%</div></div>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, width: '97%', height: '100%', background: 'rgba(16,185,129,0.3)' }} />
                <div style={{ position: 'absolute', left: '97%', width: '3%', height: '100%', background: 'rgba(245,158,11,0.5)', borderRight: '1px dashed #F59E0B' }} />
                <div style={{ position: 'absolute', left: 0, width: '96%', height: '100%', background: '#10B981' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>0%</span><span>±3% tolerance zone</span><span>100%</span>
              </div>
            </div>
            <InputField label="Manager Comment (required)" as="textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Reason for approval/rejection…" rows={2} />
            {ex.status === 'OPEN' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <PrimaryButton disabled={!comment || !canApprove} onClick={() => onResolve(ex.id, 'Variance approved by Store Manager')}>
                  {canApprove ? 'APPROVE VARIANCE' : 'Need Store Manager role'}
                </PrimaryButton>
                <SecondaryButton danger disabled={!comment} onClick={() => onResolve(ex.id, 'Variance rejected — Return to vendor')}>REJECT — RETURN</SecondaryButton>
              </div>
            )}
          </div>
        </Card>
      )}

      {ex.code === 'EX-QC-01' && (
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>QC SLA Breach — Action Required</div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ color: '#EF4444', fontWeight: 600, fontSize: 13 }}>SLA BREACHED — {'>'}4 hours waiting</div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: '118%', height: '100%', background: '#EF4444' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>4h 12m elapsed · Target: 4h 00m</div>
            </div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Available QA Inspectors</div>
            {['Priya Sharma', 'Anil Menon', 'Sunita Rao'].map(name => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{name}</span>
                <button onClick={() => onResolve(ex.id, `Assigned to ${name}`)} style={{ background: 'rgba(91,200,217,0.1)', border: '1px solid rgba(91,200,217,0.3)', borderRadius: 6, padding: '4px 14px', color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>ASSIGN</button>
              </div>
            ))}
            {ex.status === 'OPEN' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <PrimaryButton onClick={() => onResolve(ex.id, 'Acknowledged and assigned')}>ACKNOWLEDGE & ASSIGN</PrimaryButton>
                <SecondaryButton danger onClick={() => onResolve(ex.id, 'Escalated to QA Head')}>ESCALATE TO QA HEAD</SecondaryButton>
              </div>
            )}
          </div>
        </Card>
      )}

      {ex.code === 'EX-QC-02' && (
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Return to Vendor — Action Checklist</div>
            {CHECKLISTS['EX-QC-02'].map((item, i) => (
              <div key={i} onClick={() => setChecklist(c => ({ ...c, [i]: !c[i] }))}
                style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4, border: `2px solid ${checklist[i] ? '#10B981' : 'var(--border-strong)'}`,
                  background: checklist[i] ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', flexShrink: 0,
                }}>{checklist[i] ? '✓' : ''}</div>
                <span style={{ fontSize: 13, color: checklist[i] ? '#fff' : 'var(--text-body)', textDecoration: checklist[i] ? 'line-through' : 'none' }}>{item}</span>
              </div>
            ))}
            {ex.status === 'OPEN' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <PrimaryButton onClick={() => onResolve(ex.id, 'Return to vendor confirmed')}>CONFIRM RETURN</PrimaryButton>
                <SecondaryButton onClick={() => onResolve(ex.id, 'Credit note raised')}>RAISE CREDIT NOTE</SecondaryButton>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Activity Log</div>
          {[
            { time: ex.triggeredAt, text: `${ex.code} raised — ${ex.description?.slice(0,60)}`, color: SEVERITY_COLOR[ex.severity] },
            { time: new Date(Date.now() - 10 * 60000).toISOString(), text: `${ex.actor} notified via system alert`, color: '#F59E0B' },
            ex.status === 'RESOLVED' && { time: new Date().toISOString(), text: `Exception resolved`, color: '#10B981' },
          ].filter(Boolean).map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingLeft: 16, position: 'relative', paddingBottom: 14 }}>
              <div style={{ position: 'absolute', left: 0, top: 6, width: 8, height: 8, borderRadius: '50%', background: ev.color }} />
              <div style={{ position: 'absolute', left: 3, top: 14, width: 2, height: '100%', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-body)' }}>{ev.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(ev.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function Exceptions() {
  const { state, dispatch, addToast } = useStore()
  const [selectedId, setSelectedId] = useState(state.exceptions[0]?.id)
  const [statusFilter, setStatusFilter] = useState('OPEN')

  const filtered = state.exceptions.filter(e => statusFilter === 'ALL' || e.status === statusFilter)
  const selected = state.exceptions.find(e => e.id === selectedId)

  const handleResolve = (id, resolution) => {
    dispatch({ type: 'RESOLVE_EXCEPTION', payload: { id, resolution } })
    addToast({ type: 'success', title: 'Exception Resolved', message: resolution })
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 148px)', minHeight: 600 }}>
      {/* Exception List */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: '12px 0 0 12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
            Exception Center
            <span style={{ marginLeft: 8, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>
              {state.exceptions.filter(e => e.status === 'OPEN').length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['OPEN', 'RESOLVED', 'ALL'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: statusFilter === f ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                color: statusFilter === f ? '#fff' : 'var(--text-muted)', border: 'none',
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {filtered.map(ex => (
            <div key={ex.id} onClick={() => setSelectedId(ex.id)}
              style={{
                padding: '12px 14px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                border: `1px solid ${ex.id === selectedId ? SEVERITY_COLOR[ex.severity] : 'var(--border)'}`,
                background: ex.id === selectedId ? SEVERITY_COLOR[ex.severity] + '11' : 'var(--bg-elevated)',
                transition: 'all 0.15s',
                borderLeft: `3px solid ${SEVERITY_COLOR[ex.severity]}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700, color: SEVERITY_COLOR[ex.severity] }}>{ex.code}</span>
                <StatusBadge status={ex.status} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-body)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {ex.lotId} · {new Date(ex.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No exceptions</div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: '0 12px 12px 0', border: '1px solid var(--border)', borderLeft: 'none', overflow: 'auto', padding: 24 }}>
        {selected
          ? <ExceptionDetail ex={selected} onResolve={handleResolve} role={state.role} />
          : <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div><div>Select an exception</div></div>
        }
      </div>
    </div>
  )
}
