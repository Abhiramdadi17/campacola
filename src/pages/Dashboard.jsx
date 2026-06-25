import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, useKPIs } from '../store/mockStore'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import LiveTimer from '../components/LiveTimer'
import {
  Truck, ClipboardList, FlaskConical, CheckCircle2, AlertTriangle, Package,
  PackagePlus, Layers, Factory, RefreshCw, Grid3X3, Package2, Tag,
} from 'lucide-react'

const STAGE_NAV = [
  { n: 1, label: 'RM Receiving',  path: '/stage1/truck-arrival',       Icon: Truck },
  { n: 2, label: 'Requisition',   path: '/stage2/requisition',         Icon: PackagePlus },
  { n: 3, label: 'Dumping',       path: '/stage3/dumping',             Icon: Layers },
  { n: 4, label: 'Primary Pack',  path: '/stage4/primary-packing',     Icon: Factory },
  { n: 5, label: 'Rework',        path: '/stage5/rework',              Icon: RefreshCw },
  { n: 6, label: 'ISA Trays',     path: '/stage6/isa',                 Icon: Grid3X3 },
  { n: 7, label: 'Sec. Pack',     path: '/stage7/secondary-packing',   Icon: Package2 },
  { n: 8, label: 'FG Disp.',      path: '/stage8/fg-dispatch',         Icon: Tag },
]

function KPICard({ label, value, sublabel, color, Icon, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)', cursor: onClick ? 'pointer' : undefined,
        transform: hov && onClick ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.15s', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ padding: '18px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <Icon size={20} strokeWidth={1.75} style={{ color }} />
          {sublabel && <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{sublabel}</span>}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: color || '#fff', lineHeight: 1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{label}</div>
      </div>
    </div>
  )
}

function ActivityItem({ event, navigate }) {
  const typeColors = {
    LOT_APPROVED: '#10B981', GRN_SUBMITTED: '#5BC8D9', EXCEPTION: '#EF4444',
    TRUCK_ARRIVED: '#7B9FFF', BATCH_STARTED: '#A78BFA', PUT_AWAY: '#10B981',
  }
  const color = typeColors[event.type] || 'var(--text-muted)'
  const rel = Math.floor((Date.now() - new Date(event.time).getTime()) / 60000)
  const relStr = rel < 1 ? 'just now' : rel < 60 ? `${rel}m ago` : `${Math.floor(rel / 60)}h ago`

  return (
    <div
      onClick={() => event.route && navigate(event.route)}
      style={{
        display: 'flex', gap: 10, padding: '9px 4px',
        borderBottom: '1px solid var(--border)',
        cursor: event.route ? 'pointer' : undefined,
        transition: 'background 0.1s', margin: '0 -4px',
        borderRadius: 4,
      }}
      onMouseEnter={e => { if (event.route) e.currentTarget.style.background = 'rgba(91,200,217,0.04)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: 'var(--text-body)', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {event.text}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{relStr}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { state } = useStore()
  const kpis = useKPIs()

  const overdueLots = state.lots.filter(l =>
    l.status === 'UNDER_QC' && (Date.now() - new Date(l.arrivedAt).getTime()) > 3 * 3600000
  )

  const stageCounts = {
    1: state.lots.filter(l => l.stage === 1).length,
    2: 2, 3: state.batches.length, 4: state.batches.filter(b => b.status === 'IN_PROGRESS').length,
    5: 1, 6: 12, 7: state.cartons.length, 8: state.pallets.length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
        <KPICard Icon={Truck}          label="Trucks Logged"    value={kpis.trucksToday}    color="#7B9FFF" sublabel="Today"         onClick={() => navigate('/stage1/truck-arrival')} />
        <KPICard Icon={ClipboardList}  label="GRNs Raised"      value={kpis.grnsToday}      color="#5BC8D9" sublabel="Today"         onClick={() => navigate('/stage1/grn/new')} />
        <KPICard Icon={FlaskConical}   label="Lots Under QC"    value={kpis.lotsUnderQC}    color="#F59E0B" sublabel="Live"          onClick={() => navigate('/stage1/qa-inspection')} />
        <KPICard Icon={CheckCircle2}   label="Lots Approved"    value={kpis.lotsApproved}   color="#10B981" sublabel="Today"         onClick={() => navigate('/stage1/qa-inspection')} />
        <KPICard Icon={AlertTriangle}  label="Exceptions Open"  value={kpis.exceptionsOpen} color="#EF4444" sublabel="Action Needed" onClick={() => navigate('/exceptions')} />
        <KPICard Icon={Package}        label="Inventory Items"  value={kpis.inventoryItems} color="#A78BFA" sublabel="Available"     onClick={() => navigate('/stage2/requisition')} />
      </div>

      {/* Main content: left column + right activity feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Value Chain Rail */}
          <Card accent>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Value Chain Progress</div>
              <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
                {STAGE_NAV.map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div
                      onClick={() => navigate(s.path)}
                      style={{
                        flex: '0 0 auto', width: 88, padding: '10px 6px',
                        background: 'var(--bg-elevated)', borderRadius: 8,
                        cursor: 'pointer', textAlign: 'center',
                        border: '1px solid var(--border)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,200,217,0.08)'; e.currentTarget.style.borderColor = 'var(--accent-cyan)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <s.Icon size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)', marginBottom: 3 }} />
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>S{s.n}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-cyan)', lineHeight: 1 }}>{stageCounts[s.n] || 0}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
                    </div>
                    {i < STAGE_NAV.length - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>›</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>

          {/* QC SLA Strip */}
          {overdueLots.length > 0 && (
            <Card accent accentColor="#F59E0B">
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>⏱️</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>QC SLA Monitor</span>
                  <span style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {overdueLots.length} Approaching Breach
                  </span>
                </div>
                {overdueLots.map(lot => (
                  <div key={lot.id} onClick={() => navigate('/stage1/qa-inspection')}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="mono-id" style={{ fontSize: 12 }}>{lot.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lot.material}</div>
                    </div>
                    <LiveTimer startTime={lot.arrivedAt} slaMs={4 * 3600000} label="Waiting" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Exception Snapshot */}
          <Card accent accentColor="#EF4444">
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Open Exceptions</span>
                <button onClick={() => navigate('/exceptions')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>View All →</button>
              </div>
              {state.exceptions.filter(e => e.status === 'OPEN').slice(0, 4).map(ex => (
                <div key={ex.id} onClick={() => navigate('/exceptions')}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <span style={{
                    background: ex.severity === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: ex.severity === 'HIGH' ? '#EF4444' : '#F59E0B',
                    padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    fontFamily: 'Space Mono', flexShrink: 0, marginTop: 1,
                  }}>
                    {ex.code}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.4, wordBreak: 'break-word' }}>{ex.description?.slice(0, 80)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {ex.lotId} · {new Date(ex.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <StatusBadge status="OPEN" />
                </div>
              ))}
              {state.exceptions.filter(e => e.status === 'OPEN').length === 0 && (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>✅ No open exceptions</div>
              )}
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card style={{ minWidth: 0 }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Recent Activity</div>
            {state.activity.slice(0, 15).map(ev => (
              <ActivityItem key={ev.id} event={ev} navigate={navigate} />
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}
