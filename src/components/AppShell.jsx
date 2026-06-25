import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ToastContainer from './Toast'

const ROUTE_META = {
  '/': { title: 'Dashboard', breadcrumb: 'Home' },
  '/stage1/truck-arrival': { title: 'Truck Arrival Log', breadcrumb: 'Stage 1 · RM Receiving / Truck Arrival' },
  '/stage1/grn/new': { title: 'GRN Creation', breadcrumb: 'Stage 1 · RM Receiving / GRN Creation' },
  '/stage1/qa-inspection': { title: 'QA Inspection Queue', breadcrumb: 'Stage 1 · RM Receiving / QA Inspection' },
  '/stage1/put-away': { title: 'Put Away', breadcrumb: 'Stage 1 · RM Receiving / Put Away' },
  '/stage2/requisition': { title: 'Material Requisition', breadcrumb: 'Stage 2 · Material Requisition' },
  '/stage3/dumping': { title: 'Dumping & Batching', breadcrumb: 'Stage 3 · Dumping & Batching' },
  '/stage4/primary-packing': { title: 'Primary Packing', breadcrumb: 'Stage 4 · Primary Packing (Rovema)' },
  '/stage5/rework': { title: 'CW Rework & Balance', breadcrumb: 'Stage 5 · CW Rework & Material Balance' },
  '/stage6/isa': { title: 'ISA Tray Management', breadcrumb: 'Stage 6 · ISA Tray Management' },
  '/stage7/secondary-packing': { title: 'Secondary Packing', breadcrumb: 'Stage 7 · Secondary Packing (Cartoning)' },
  '/stage8/fg-dispatch': { title: 'FG Posting & Dispatch', breadcrumb: 'Stage 8 · FG Posting & Dispatch' },
  '/traceability': { title: 'Traceability Search', breadcrumb: 'Traceability' },
  '/exceptions': { title: 'Exception Center', breadcrumb: 'Exception Center' },
  '/reports': { title: 'Reports', breadcrumb: 'Reports' },
  '/master-data': { title: 'Master Data', breadcrumb: 'Master Data' },
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const meta = ROUTE_META[location.pathname] || { title: 'RCPL Track & Trace', breadcrumb: '' }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)', overflow: 'hidden' }}>
      <Sidebar collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar title={meta.title} breadcrumb={meta.breadcrumb} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main
          key={location.pathname}
          className="animate-fade-in-up"
          style={{
            flex: 1, overflow: 'auto',
            padding: '24px 28px',
            background: 'var(--bg-page)',
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
