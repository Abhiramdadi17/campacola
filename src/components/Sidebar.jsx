import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore, useKPIs } from '../store/mockStore'
import {
  LayoutDashboard, Package, Truck, ClipboardList, FlaskConical, MapPin,
  PackagePlus, Layers, Factory, RefreshCw, Grid3X3, Package2, Tag,
  ScanSearch, AlertTriangle, BarChart2, Database, ChevronRight,
} from 'lucide-react'

const NAV = [
  { type: 'item', Icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { type: 'group', label: 'RECEIVING' },
  {
    type: 'item', Icon: Package, label: 'RM Receiving', path: '/stage1',
    children: [
      { Icon: Truck,          label: 'Truck Arrival',  path: '/stage1/truck-arrival' },
      { Icon: ClipboardList,  label: 'GRN Creation',   path: '/stage1/grn/new' },
      { Icon: FlaskConical,   label: 'QA Inspection',  path: '/stage1/qa-inspection', badge: 'qa' },
      { Icon: MapPin,         label: 'Put Away',        path: '/stage1/put-away' },
    ]
  },
  { type: 'group', label: 'PRODUCTION' },
  { type: 'item', Icon: PackagePlus,  label: 'Material Requisition',  path: '/stage2/requisition' },
  { type: 'item', Icon: Layers,       label: 'Dumping & Batching',    path: '/stage3/dumping' },
  { type: 'item', Icon: Factory,      label: 'Primary Packing',       path: '/stage4/primary-packing' },
  { type: 'item', Icon: RefreshCw,    label: 'CW Rework & Balance',   path: '/stage5/rework' },
  { type: 'item', Icon: Grid3X3,      label: 'ISA Tray Mgmt',        path: '/stage6/isa' },
  { type: 'item', Icon: Package2,     label: 'Secondary Packing',     path: '/stage7/secondary-packing' },
  { type: 'item', Icon: Tag,          label: 'FG & Dispatch',         path: '/stage8/fg-dispatch' },
  { type: 'group', label: 'ANALYTICS' },
  { type: 'item', Icon: ScanSearch,    label: 'Traceability',         path: '/traceability' },
  { type: 'item', Icon: AlertTriangle, label: 'Exception Center',     path: '/exceptions', badge: 'exceptions' },
  { type: 'item', Icon: BarChart2,     label: 'Reports',              path: '/reports' },
  { type: 'item', Icon: Database,      label: 'Master Data',          path: '/master-data' },
]

function NavItem({ item, depth = 0, kpis }) {
  const [expanded, setExpanded] = useState(true)

  if (item.type === 'group') {
    return (
      <div style={{ padding: '16px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>
        {item.label}
      </div>
    )
  }

  const badge = item.badge === 'exceptions' ? kpis.exceptionsOpen
    : item.badge === 'qa' ? kpis.lotsUnderQC : null

  if (item.children) {
    return (
      <div>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
            cursor: 'pointer', borderRadius: 6, margin: '1px 8px',
            color: 'var(--text-body)', transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <item.Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }} />
        </div>
        {expanded && (
          <div style={{ paddingLeft: 12 }}>
            {item.children.map(child => <NavItem key={child.path} item={child} depth={1} kpis={kpis} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: `9px ${depth > 0 ? 14 : 16}px`,
        margin: '1px 8px',
        textDecoration: 'none', borderRadius: 6,
        background: isActive ? 'rgba(91,200,217,0.08)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-body)',
        fontWeight: isActive ? 600 : 400,
        fontSize: depth > 0 ? 13 : 14,
        transition: 'all 0.1s',
        borderLeft: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
      })}
    >
      {({ isActive }) => (
        <>
          <item.Icon
            size={depth > 0 ? 14 : 16}
            strokeWidth={isActive ? 2.25 : 1.75}
            style={{ flexShrink: 0, color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', marginLeft: depth > 0 ? 4 : 0 }}
          />
          <span style={{ flex: 1 }}>{item.label}</span>
          {badge > 0 && (
            <span style={{
              background: item.badge === 'exceptions' ? '#EF4444' : '#F59E0B',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '1px 7px', borderRadius: 99,
              minWidth: 20, textAlign: 'center',
              animation: 'badgePop 0.3s ease',
            }}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed }) {
  const kpis = useKPIs()

  return (
    <aside style={{
      width: collapsed ? 0 : 'var(--sidebar-width)',
      minWidth: collapsed ? 0 : 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto', overflowX: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
    }}>
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--gradient-cta)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>R</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>RCPL Campa Cola</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Track & Trace Suite</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, paddingBottom: 24, paddingTop: 8 }}>
        {NAV.map((item, i) => <NavItem key={item.path || item.label + i} item={item} kpis={kpis} />)}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
        BRD v3.1 · CarbyneTech
      </div>
    </aside>
  )
}
