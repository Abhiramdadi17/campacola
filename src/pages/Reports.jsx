import React, { useState } from 'react'
import { useStore } from '../store/mockStore'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import PrimaryButton from '../components/PrimaryButton'
import SecondaryButton from '../components/SecondaryButton'
import StatusBadge from '../components/StatusBadge'

const REPORT_CARDS = [
  { id: 'batch-history', icon: '⚗️', label: 'Batch History', desc: 'All batches with yield, rejects, status' },
  { id: 'material-balance', icon: '⚖️', label: 'Material Balance', desc: 'Input vs output reconciliation' },
  { id: 'rejection-analysis', icon: '❌', label: 'Rejection Analysis', desc: 'QC rejections by vendor, material, reason' },
  { id: 'traceability', icon: '🔍', label: 'Traceability', desc: 'Lot-to-pallet genealogy audit' },
  { id: 'production', icon: '🏭', label: 'Production Summary', desc: 'Shift-wise output, efficiency, downtime' },
  { id: 'inventory', icon: '📦', label: 'Inventory Status', desc: 'Current stock, FEFO, expiry alerts' },
]

const REPORT_DATA = {
  'batch-history': {
    cols: [
      { key: 'id', label: 'Batch ID', mono: true },
      { key: 'material', label: 'Material' },
      { key: 'pouches', label: 'Pouches', align: 'right' },
      { key: 'rejects', label: 'Rejects', align: 'right' },
      { key: 'yield', label: 'Yield %', align: 'right', render: v => <span style={{ color: v >= 99 ? '#10B981' : '#F59E0B' }}>{v}%</span> },
      { key: 'status', label: 'Status', render: v => <StatusBadge status={v === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'APPROVED'} /> },
    ],
    rows: [
      { id: 'BATCH-20240624-001', material: 'Cola Mix', pouches: 8420, rejects: 42, yield: 99.5, status: 'IN_PROGRESS' },
      { id: 'BATCH-20240623-003', material: 'Cola Mix', pouches: 9100, rejects: 31, yield: 99.7, status: 'CLOSED' },
      { id: 'BATCH-20240623-002', material: 'Lemon Mix', pouches: 7800, rejects: 89, yield: 98.9, status: 'CLOSED' },
    ]
  },
  'rejection-analysis': {
    cols: [
      { key: 'lotId', label: 'Lot ID', mono: true },
      { key: 'vendor', label: 'Vendor' },
      { key: 'reason', label: 'Reason' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status="REJECTED" /> },
    ],
    rows: [
      { lotId: 'LOT-20240623-004', vendor: 'AquaPure Solutions', reason: 'Microbiological Test Failed', date: '23 Jun 2024', status: 'REJECTED' },
    ]
  },
  inventory: {
    cols: [
      { key: 'lotId', label: 'Lot ID', mono: true },
      { key: 'material', label: 'Material' },
      { key: 'qty', label: 'Qty' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', render: v => <StatusBadge status="APPROVED" /> },
    ],
    rows: [
      { lotId: 'LOT-20240624-001', material: 'Cola Concentrate 30X', qty: '480 KG', location: 'A-01/B-04', status: 'AVAILABLE' },
    ]
  },
}

export default function Reports() {
  const { state } = useStore()
  const [activeReport, setActiveReport] = useState(null)
  const [dateFrom, setDateFrom] = useState('2024-06-01')
  const [dateTo, setDateTo] = useState('2024-06-30')

  const reportData = REPORT_DATA[activeReport]

  if (activeReport) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SecondaryButton size="sm" onClick={() => setActiveReport(null)}>← All Reports</SecondaryButton>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {REPORT_CARDS.find(r => r.id === activeReport)?.label}
          </span>
        </div>
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontFamily: 'Space Grotesk', height: 38 }} />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontFamily: 'Space Grotesk', height: 38 }} />
              <PrimaryButton size="sm">Apply Filter</PrimaryButton>
              <SecondaryButton size="sm" style={{ marginLeft: 'auto' }}>Export CSV ↓</SecondaryButton>
            </div>
            {reportData ? (
              <DataTable columns={reportData.cols} data={reportData.rows} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No data available for selected filters</div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select a report to view</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {REPORT_CARDS.map(r => (
          <Card key={r.id} onClick={() => setActiveReport(r.id)} style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{r.desc}</div>
              <span style={{ fontSize: 13, color: 'var(--accent-cyan)', fontWeight: 600 }}>Open Report →</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
