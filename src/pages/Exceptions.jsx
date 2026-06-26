import React, { useState } from 'react'
import { useStore } from '../store/mockStore'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import PrimaryButton from '../components/PrimaryButton'
import SecondaryButton from '../components/SecondaryButton'
import InputField from '../components/InputField'
import {
  AlertTriangle, AlertCircle, CheckCircle2, Clock, ShieldAlert,
  User, Zap, BookOpen, ChevronDown, ChevronRight, XCircle,
  PackageX, Database, UserCheck,
} from 'lucide-react'

// ── BRD Exception Catalog ────────────────────────────────────────────────────
const EXCEPTION_CATALOG = {
  'EX-GRN-01': {
    name: 'Quantity Variance',
    trigger: 'Received qty variance > configured tolerance (±3% of PO qty)',
    systemAction: 'GRN placed on hold. Store Manager notified. Submission blocked.',
    requiredRole: 'Store Manager',
    severity: 'MEDIUM',
    stage: 'RM Receiving',
    resolutions: ['Approve Variance', 'Reject and Return to Vendor'],
    icon: AlertTriangle,
    color: '#F59E0B',
  },
  'EX-GRN-02': {
    name: 'Material Not in Master',
    trigger: 'Material code not found in Material Master',
    systemAction: "GRN submission blocked. Error shown: 'Material not configured – contact Admin'.",
    requiredRole: 'Admin',
    severity: 'HIGH',
    stage: 'RM Receiving',
    resolutions: ['Add Material to Master and retry'],
    icon: Database,
    color: '#EF4444',
  },
  'EX-QC-01': {
    name: 'QC SLA Breach',
    trigger: 'QC pending > 4 hours (configurable)',
    systemAction: 'Auto-escalation alert sent to Production Manager. Timer badge turns red on dashboard.',
    requiredRole: 'Production Manager',
    severity: 'HIGH',
    stage: 'QA Inspection',
    resolutions: ['Acknowledge', 'Reassign Inspector'],
    icon: Clock,
    color: '#EF4444',
  },
  'EX-QC-02': {
    name: 'Lot Rejected',
    trigger: 'Lot REJECTED — material in quarantine zone',
    systemAction: 'Store Manager alerted. Return-to-vendor workflow initiated. Inventory zeroed.',
    requiredRole: 'Store Manager',
    severity: 'HIGH',
    stage: 'QA Inspection',
    resolutions: ['Confirm Return', 'Raise Credit Note'],
    icon: PackageX,
    color: '#EF4444',
  },
}

// ── BRD Open Questions ───────────────────────────────────────────────────────
const BRD_NOTICES = [
  {
    id: 'OQ-01',
    title: 'PO Integration Method',
    body: 'Will Purchase Orders be manually created in DIGITAL, or is there a plan to integrate with SAP MM for automatic PO feed? This affects GRN screen design and PO search logic.',
    impact: 'GRN Creation · PO Search',
  },
  {
    id: 'OQ-02',
    title: 'IQC Rejection Reason Codes',
    body: 'Please confirm the list of IQC rejection reason codes to be configured in the system. Carbynetech will set these up in master data before UAT.',
    impact: 'QA Inspection · EX-QC-02',
  },
]

const SEVERITY_COLOR = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#5BC8D9' }
const SEVERITY_BG    = { HIGH: 'rgba(239,68,68,0.12)',  MEDIUM: 'rgba(245,158,11,0.12)', LOW: 'rgba(91,200,217,0.12)' }

const QC_INSPECTORS = ['Priya Sharma', 'Anil Menon', 'Sunita Rao', 'Deepak Nair']

const RTV_CHECKLIST = [
  'Physical separation of rejected material from store',
  'Red rejection tags applied on all pallets',
  'Material moved to quarantine zone',
  'Vendor notified via email / WhatsApp',
  'Delivery challan prepared for return',
  'Credit note initiated in ERP',
]

function RoleBadge({ role }) {
  const colors = {
    'Store Manager': '#10B981', 'Production Manager': '#F45B4A',
    'Admin': '#A78BFA', 'QA Supervisor': '#F59E0B',
  }
  const c = colors[role] || '#5BC8D9'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: `${c}18`, color: c, border: `1px solid ${c}44`,
    }}>
      <User size={9} /> {role}
    </span>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, fontFamily: mono ? 'Space Mono, monospace' : undefined }}>{value || '—'}</div>
    </div>
  )
}

// ── Type-specific Resolution Cards ──────────────────────────────────────────

function ExGrn01Resolution({ ex, onResolve, canResolve }) {
  const [comment, setComment] = useState('')
  const poQty = 500, received = 480
  const variance = ((received - poQty) / poQty * 100).toFixed(1)
  const pct = (received / poQty) * 100

  return (
    <Card accent accentColor="#F59E0B">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} style={{ color: '#F59E0B' }} /> Quantity Variance — Approval Required
        </div>

        {/* Variance visualization */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>PO Quantity</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Space Mono' }}>{poQty} <span style={{ fontSize: 12 }}>KG</span></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Received</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B', fontFamily: 'Space Mono' }}>{received} <span style={{ fontSize: 12 }}>KG</span></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Variance</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#EF4444', fontFamily: 'Space Mono' }}>{variance}%</div>
            </div>
          </div>

          {/* Tolerance bar */}
          <div style={{ position: 'relative', height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'visible', marginBottom: 6 }}>
            {/* Tolerance zone highlight */}
            <div style={{ position: 'absolute', left: '94%', width: '6%', height: '100%', background: 'rgba(245,158,11,0.25)', borderRadius: 5 }} />
            {/* Received fill */}
            <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #10B981, #F59E0B)`, borderRadius: 5 }} />
            {/* Tolerance markers */}
            {[97, 103].map(p => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -4, bottom: -4, width: 1, background: '#F59E0B', opacity: 0.6 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
            <span>0%</span>
            <span style={{ color: '#F59E0B' }}>±3% tolerance zone</span>
            <span>100%</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <InputField
            label="Manager Comment (required for approval or rejection)"
            as="textarea"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="State reason for approving or rejecting the variance…"
            rows={2}
          />
        </div>

        {!canResolve && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, marginBottom: 10, fontSize: 12, color: '#F59E0B' }}>
            <ShieldAlert size={13} /> Switch to <strong>Store Manager</strong> role to resolve this exception
          </div>
        )}

        {ex.status === 'OPEN' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <PrimaryButton
              disabled={!comment || !canResolve}
              onClick={() => onResolve(ex.id, `Variance approved by Store Manager. Comment: ${comment}`)}
              style={{ background: '#10B981', flex: 1 }}
            >
              APPROVE VARIANCE
            </PrimaryButton>
            <SecondaryButton
              disabled={!comment || !canResolve}
              onClick={() => onResolve(ex.id, `Variance rejected — Return to vendor. Comment: ${comment}`)}
            >
              REJECT — RETURN TO VENDOR
            </SecondaryButton>
          </div>
        )}
      </div>
    </Card>
  )
}

function ExGrn02Resolution({ ex, onResolve, canResolve }) {
  return (
    <Card accent accentColor="#EF4444">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={14} style={{ color: '#EF4444' }} /> Material Not in Master — GRN Blocked
        </div>

        {/* Error display */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>System Error Message</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)' }}>
            Material not configured — contact Admin
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <InfoRow label="Material Name" value={ex.material} />
          <InfoRow label="Material Code (attempted)" value={ex.materialCode} mono />
          <InfoRow label="Blocked GRN" value={ex.blockedGrnId} mono />
          <InfoRow label="Raised by" value={ex.actor} />
        </div>

        <div style={{ background: 'rgba(91,200,217,0.06)', border: '1px solid rgba(91,200,217,0.15)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Resolution path:</strong> Admin must add <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 3 }}>{ex.materialCode}</code> to the Material Master. Store Operator can then re-submit the blocked GRN.
          </div>
        </div>

        {!canResolve && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, marginBottom: 10, fontSize: 12, color: '#EF4444' }}>
            <ShieldAlert size={13} /> Switch to <strong>Admin</strong> role to resolve this exception
          </div>
        )}

        {ex.status === 'OPEN' && (
          <PrimaryButton
            fullWidth
            disabled={!canResolve}
            onClick={() => onResolve(ex.id, `${ex.materialCode} added to Material Master. GRN can be re-submitted.`)}
          >
            ADD TO MATERIAL MASTER & UNBLOCK GRN
          </PrimaryButton>
        )}
      </div>
    </Card>
  )
}

function ExQc01Resolution({ ex, onResolve, canResolve }) {
  const [selectedInspector, setSelectedInspector] = useState('')
  const elapsed = ex.elapsedMs || (Date.now() - new Date(ex.triggeredAt).getTime() + 4 * 3600000)
  const elapsedH = Math.floor(elapsed / 3600000)
  const elapsedM = Math.floor((elapsed % 3600000) / 60000)
  const overPct = Math.min((elapsed / (4 * 3600000)) * 100, 140)

  return (
    <Card accent accentColor="#EF4444">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} style={{ color: '#EF4444' }} /> QC SLA Breach — Auto-Escalation Active
        </div>

        {/* Elapsed timer */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Elapsed Wait Time</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 24, fontWeight: 700, color: '#EF4444' }}>{elapsedH}h {elapsedM}m</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>SLA Target</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--text-muted)' }}>4h 00m</div>
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${Math.min(overPct, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)', animation: 'timerPulse 1s infinite' }} />
          </div>
          <div style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={11} /> {Math.max(0, elapsedH - 4)}h {elapsedM}m over SLA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Option 1: Acknowledge */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Option 1 — Acknowledge
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Acknowledge the SLA breach. Current inspector retains the lot. Breach is logged.
            </div>
            {!canResolve && (
              <div style={{ fontSize: 11, color: '#F45B4A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldAlert size={11} /> Requires <strong>Production Manager</strong> role
              </div>
            )}
            <SecondaryButton
              disabled={!canResolve || ex.status !== 'OPEN'}
              onClick={() => onResolve(ex.id, 'SLA breach acknowledged by Production Manager. Inspector retained.')}
            >
              ACKNOWLEDGE BREACH
            </SecondaryButton>
          </div>

          {/* Option 2: Reassign Inspector */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={13} style={{ color: '#5BC8D9' }} /> Option 2 — Reassign Inspector
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Select an available QA inspector to take over the inspection.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {QC_INSPECTORS.map(name => (
                <div
                  key={name}
                  onClick={() => canResolve && setSelectedInspector(name)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 6,
                    border: `1px solid ${selectedInspector === name ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    background: selectedInspector === name ? 'rgba(91,200,217,0.08)' : 'transparent',
                    cursor: canResolve ? 'pointer' : 'default', transition: 'all 0.12s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span style={{ fontSize: 13, color: selectedInspector === name ? '#fff' : 'var(--text-body)' }}>{name}</span>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} title="Available" />
                </div>
              ))}
            </div>
            {!canResolve && (
              <div style={{ fontSize: 11, color: '#F45B4A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldAlert size={11} /> Requires <strong>Production Manager</strong> role
              </div>
            )}
            <PrimaryButton
              fullWidth
              disabled={!selectedInspector || !canResolve || ex.status !== 'OPEN'}
              onClick={() => onResolve(ex.id, `Reassigned to ${selectedInspector} by Production Manager`)}
            >
              {selectedInspector ? `REASSIGN TO ${selectedInspector.split(' ')[0].toUpperCase()}` : 'SELECT INSPECTOR ABOVE'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ExQc02Resolution({ ex, onResolve, canResolve }) {
  const [checklist, setChecklist] = useState({})
  const allChecked = Object.values(checklist).filter(Boolean).length === RTV_CHECKLIST.length

  return (
    <Card accent accentColor="#EF4444">
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PackageX size={14} style={{ color: '#EF4444' }} /> Return-to-Vendor Workflow
        </div>

        {/* Inventory zeroed badge */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 99, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
            <XCircle size={11} /> Inventory Zeroed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 99, fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
            <AlertTriangle size={11} /> Quarantine Zone
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
          Completion Checklist ({Object.values(checklist).filter(Boolean).length}/{RTV_CHECKLIST.length})
        </div>

        <div style={{ marginBottom: 14 }}>
          {RTV_CHECKLIST.map((item, i) => (
            <div
              key={i}
              onClick={() => setChecklist(c => ({ ...c, [i]: !c[i] }))}
              style={{
                display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${checklist[i] ? '#10B981' : 'var(--border-strong)'}`,
                background: checklist[i] ? '#10B981' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}>
                {checklist[i] && <CheckCircle2 size={12} style={{ color: '#fff' }} />}
              </div>
              <span style={{ fontSize: 13, color: checklist[i] ? '#fff' : 'var(--text-body)', textDecoration: checklist[i] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {!canResolve && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, marginBottom: 10, fontSize: 12, color: '#EF4444' }}>
            <ShieldAlert size={13} /> Switch to <strong>Store Manager</strong> role to resolve this exception
          </div>
        )}

        {!allChecked && canResolve && (
          <div style={{ fontSize: 12, color: '#F59E0B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={11} /> Complete all checklist items before confirming return
          </div>
        )}

        {ex.status === 'OPEN' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <PrimaryButton
              disabled={!allChecked || !canResolve}
              onClick={() => onResolve(ex.id, 'Return to vendor confirmed. Delivery challan issued.')}
              style={{ flex: 1, background: '#EF4444' }}
            >
              CONFIRM RETURN
            </PrimaryButton>
            <SecondaryButton
              disabled={!canResolve}
              onClick={() => onResolve(ex.id, 'Credit note raised and sent to vendor.')}
            >
              RAISE CREDIT NOTE
            </SecondaryButton>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Exception Detail Panel ────────────────────────────────────────────────────

function ExceptionDetail({ ex, onResolve, role }) {
  if (!ex) return null
  const catalog = EXCEPTION_CATALOG[ex.code]
  const CatIcon = catalog?.icon || AlertCircle
  const catColor = catalog?.color || SEVERITY_COLOR[ex.severity]
  const requiredRole = catalog?.requiredRole || 'Store Manager'
  const canResolve = role === requiredRole

  const resolutionProps = { ex, onResolve, canResolve }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 20px', background: `${catColor}08`, border: `1px solid ${catColor}22`, borderRadius: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: SEVERITY_BG[ex.severity], color: SEVERITY_COLOR[ex.severity],
              padding: '5px 14px', borderRadius: 4, fontSize: 14, fontWeight: 700,
              fontFamily: 'Space Mono', border: `1px solid ${SEVERITY_COLOR[ex.severity]}44`,
            }}>
              <CatIcon size={13} /> {ex.code}
            </span>
            <StatusBadge status={ex.status} />
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: SEVERITY_BG[ex.severity], color: SEVERITY_COLOR[ex.severity], fontWeight: 700 }}>
              {ex.severity}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Triggered</div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
              {new Date(ex.triggeredAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-body)', margin: '10px 0 6px', lineHeight: 1.5 }}>{ex.description}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {ex.lotId && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lot: <span style={{ fontFamily: 'Space Mono', color: 'var(--accent-cyan)' }}>{ex.lotId}</span></span>}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stage {ex.stage}: {catalog?.stage}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actor: {ex.actor}</span>
        </div>
      </div>

      {/* ── BRD: Trigger + System Action ── */}
      {catalog && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} /> Trigger Condition
              </div>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{catalog.trigger}</div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} /> System Action (Auto-Performed)
              </div>
              <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5, marginBottom: 8 }}>{catalog.systemAction}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Required Role:</span>
                <RoleBadge role={requiredRole} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Type-specific resolution ── */}
      {ex.code === 'EX-GRN-01' && <ExGrn01Resolution {...resolutionProps} />}
      {ex.code === 'EX-GRN-02' && <ExGrn02Resolution {...resolutionProps} />}
      {ex.code === 'EX-QC-01'  && <ExQc01Resolution  {...resolutionProps} />}
      {ex.code === 'EX-QC-02'  && <ExQc02Resolution  {...resolutionProps} />}

      {/* Fallback for unknown codes */}
      {!['EX-GRN-01','EX-GRN-02','EX-QC-01','EX-QC-02'].includes(ex.code) && ex.status === 'OPEN' && (
        <Card>
          <div style={{ padding: 16 }}>
            <PrimaryButton fullWidth onClick={() => onResolve(ex.id, 'Manually resolved')}>MARK AS RESOLVED</PrimaryButton>
          </div>
        </Card>
      )}

      {/* ── Activity Log ── */}
      <Card>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Activity Log</div>
          {[
            { time: ex.triggeredAt, text: `${ex.code} triggered — ${ex.description?.slice(0, 70)}`, color: SEVERITY_COLOR[ex.severity] },
            { time: new Date(new Date(ex.triggeredAt).getTime() + 2 * 60000).toISOString(), text: `${catalog?.requiredRole || 'Responsible user'} notified via system alert`, color: '#F59E0B' },
            ex.status === 'RESOLVED' && { time: new Date().toISOString(), text: 'Exception resolved', color: '#10B981' },
          ].filter(Boolean).map((ev, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingLeft: 16, position: 'relative', paddingBottom: 14 }}>
              <div style={{ position: 'absolute', left: 0, top: 6, width: 8, height: 8, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: 3, top: 14, width: 2, height: 'calc(100% - 8px)', background: 'var(--border)' }} />}
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-body)' }}>{ev.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(ev.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ── BRD Notices Panel ────────────────────────────────────────────────────────

function BrdNotices() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textAlign: 'left',
        }}
      >
        <BookOpen size={12} />
        BRD OPEN QUESTIONS
        <span style={{ marginLeft: 4, background: '#F59E0B22', color: '#F59E0B', fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>
          {BRD_NOTICES.length}
        </span>
        {expanded ? <ChevronDown size={12} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
      </button>
      {expanded && BRD_NOTICES.map(n => (
        <div key={n.id} style={{ margin: '4px 8px', padding: '10px 12px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 700, color: '#F59E0B' }}>{n.id}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{n.title}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 4 }}>{n.body}</div>
          <div style={{ fontSize: 10, color: '#F59E0B' }}>Impact: {n.impact}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Exceptions() {
  const { state, dispatch, addToast } = useStore()
  const [selectedId, setSelectedId] = useState(state.exceptions[0]?.id)
  const [statusFilter, setStatusFilter] = useState('OPEN')

  const filtered = state.exceptions.filter(e => statusFilter === 'ALL' || e.status === statusFilter)
  const selected = state.exceptions.find(e => e.id === selectedId)
  const openCount = state.exceptions.filter(e => e.status === 'OPEN').length

  const handleResolve = (id, resolution) => {
    dispatch({ type: 'RESOLVE_EXCEPTION', payload: { id, resolution } })
    addToast({ type: 'success', title: 'Exception Resolved', message: resolution })
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 148px)', minHeight: 600 }}>

      {/* ── Exception List ── */}
      <div style={{
        width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)', borderRadius: '12px 0 0 12px',
        border: '1px solid var(--border)', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 16px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ShieldAlert size={15} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Exception Center</span>
            {openCount > 0 && (
              <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>
                {openCount}
              </span>
            )}
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {filtered.map((ex, i) => {
            const catalog = EXCEPTION_CATALOG[ex.code]
            const CatIcon = catalog?.icon || AlertCircle
            const sc = SEVERITY_COLOR[ex.severity]
            const isSelected = ex.id === selectedId
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                style={{
                  padding: '12px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                  border: `1px solid ${isSelected ? sc : 'var(--border)'}`,
                  borderLeft: `3px solid ${sc}`,
                  background: isSelected ? `${sc}0d` : 'var(--bg-elevated)',
                  transition: 'all 0.15s',
                  animation: `fadeInUp 0.2s ease ${i * 40}ms both`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CatIcon size={12} style={{ color: sc, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700, color: sc }}>{ex.code}</span>
                  </div>
                  <StatusBadge status={ex.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-body)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {ex.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  {catalog?.requiredRole && <RoleBadge role={catalog.requiredRole} />}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(ex.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <CheckCircle2 size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>No {statusFilter.toLowerCase()} exceptions</div>
            </div>
          )}
        </div>

        <BrdNotices />
      </div>

      {/* ── Detail Panel ── */}
      <div style={{
        flex: 1, background: 'var(--bg-page)',
        borderRadius: '0 12px 12px 0', border: '1px solid var(--border)',
        borderLeft: 'none', overflow: 'auto', padding: 20,
      }}>
        {selected
          ? <ExceptionDetail ex={selected} onResolve={handleResolve} role={state.role} />
          : (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldAlert size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 16 }}>Select an exception to view details</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>All resolution actions are role-gated per BRD Section 4.1.4</div>
            </div>
          )
        }
      </div>
    </div>
  )
}
