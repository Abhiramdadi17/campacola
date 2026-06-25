import React, { useState } from 'react'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import PrimaryButton from '../components/PrimaryButton'
import StatusBadge from '../components/StatusBadge'

const TABS = ['Materials', 'Recipes/BOM', 'Assets', 'Users (RBAC)', 'Tolerances', 'Rejection Codes']

const MATERIALS = [
  { id: 'MAT-001', name: 'Cola Concentrate 30X', category: 'Raw Material', unit: 'KG', shelf: '18 months', active: true },
  { id: 'MAT-002', name: 'Refined Sugar S-30', category: 'Raw Material', unit: 'KG', shelf: '24 months', active: true },
  { id: 'MAT-003', name: 'DM Water Grade A', category: 'Utility', unit: 'Litres', shelf: 'N/A', active: true },
  { id: 'MAT-004', name: 'BOPP Film 30mic', category: 'Packaging', unit: 'Rolls', shelf: '12 months', active: true },
]

const USERS = [
  { id: 'USR-001', name: 'Rajesh Gupta', role: 'Store Manager', email: 'r.gupta@rcpl.in', status: 'APPROVED' },
  { id: 'USR-002', name: 'Priya Sharma', role: 'QA Supervisor', email: 'p.sharma@rcpl.in', status: 'APPROVED' },
  { id: 'USR-003', name: 'Anil Kumar', role: 'Gate Guard', email: 'a.kumar@rcpl.in', status: 'APPROVED' },
  { id: 'USR-004', name: 'Sunita Rao', role: 'Store Operator', email: 's.rao@rcpl.in', status: 'APPROVED' },
]

const TOLERANCES = [
  { parameter: 'GRN Quantity Variance', lower: '-3%', upper: '+3%', approval: 'Store Manager', code: 'EX-GRN-01' },
  { parameter: 'Batch Yield', lower: '98%', upper: '102%', approval: 'Production Manager', code: 'EX-PPK-02' },
  { parameter: 'QC SLA', lower: '', upper: '4 hours', approval: 'Production Manager', code: 'EX-QC-01' },
  { parameter: 'Material Balance', lower: '-1%', upper: '+1%', approval: 'Production Manager', code: 'EX-RWK-01' },
]

const REJECTION_CODES = [
  { code: 'REJ-01', description: 'Failed Microbiological Test', stage: 'QC', action: 'Return to Vendor' },
  { code: 'REJ-02', description: 'Physical Contamination', stage: 'QC', action: 'Destroy' },
  { code: 'REJ-03', description: 'Wrong Material', stage: 'QC', action: 'Return to Vendor' },
  { code: 'REJ-04', description: 'CW Out of Spec', stage: 'Primary Pack', action: 'Rework' },
  { code: 'REJ-05', description: 'Seal Failure', stage: 'Primary Pack', action: 'Destroy' },
]

export default function MasterData() {
  const [tab, setTab] = useState('Materials')

  const materialCols = [
    { key: 'id', label: 'ID', mono: true }, { key: 'name', label: 'Material Name' },
    { key: 'category', label: 'Category' }, { key: 'unit', label: 'Unit' },
    { key: 'shelf', label: 'Shelf Life' },
    { key: 'active', label: 'Status', render: v => <StatusBadge status={v ? 'APPROVED' : 'REJECTED'} /> },
  ]

  const userCols = [
    { key: 'id', label: 'ID', mono: true }, { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' }, { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  const tolCols = [
    { key: 'parameter', label: 'Parameter', wrap: true }, { key: 'lower', label: 'Lower' },
    { key: 'upper', label: 'Upper' }, { key: 'approval', label: 'Approval Role' },
    { key: 'code', label: 'Exception', mono: true },
  ]

  const rejCols = [
    { key: 'code', label: 'Code', mono: true }, { key: 'description', label: 'Description', wrap: true },
    { key: 'stage', label: 'Stage' }, { key: 'action', label: 'Default Action' },
  ]

  const bomRows = [
    { id: 'BOM-001', product: 'Campa Cola 200ml', material: 'Cola Concentrate 30X', qty: '0.5 KG / 1000 pouches', unit: 'KG' },
    { id: 'BOM-002', product: 'Campa Cola 200ml', material: 'Refined Sugar S-30', qty: '80 KG / 1000 pouches', unit: 'KG' },
  ]

  const bomCols = [
    { key: 'id', label: 'BOM ID', mono: true }, { key: 'product', label: 'Product' },
    { key: 'material', label: 'Material' }, { key: 'qty', label: 'Quantity' },
  ]

  const assetRows = [
    { id: 'AST-001', name: 'Rovema Packing Machine #1', type: 'Packing Line', location: 'Hall A', status: 'APPROVED' },
    { id: 'AST-002', name: 'Check Weigher CW-01', type: 'Check Weigher', location: 'Hall A', status: 'APPROVED' },
    { id: 'AST-003', name: 'Zebra Printer #1', type: 'Label Printer', location: 'Store', status: 'APPROVED' },
  ]

  const assetCols = [
    { key: 'id', label: 'Asset ID', mono: true }, { key: 'name', label: 'Asset Name' },
    { key: 'type', label: 'Type' }, { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
  ]

  const renderTable = () => {
    switch (tab) {
      case 'Materials': return <DataTable columns={materialCols} data={MATERIALS} />
      case 'Recipes/BOM': return <DataTable columns={bomCols} data={bomRows} />
      case 'Assets': return <DataTable columns={assetCols} data={assetRows} />
      case 'Users (RBAC)': return <DataTable columns={userCols} data={USERS} />
      case 'Tolerances': return <DataTable columns={tolCols} data={TOLERANCES} />
      case 'Rejection Codes': return <DataTable columns={rejCols} data={REJECTION_CODES} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: tab === t ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
            color: tab === t ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      <Card accent>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{tab}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Search…" style={{ height: 36, padding: '0 12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', fontFamily: 'Space Grotesk', fontSize: 13, width: 200 }} />
              <PrimaryButton size="sm">+ Add {tab.split(' ')[0]}</PrimaryButton>
            </div>
          </div>
          {renderTable()}
        </div>
      </Card>
    </div>
  )
}
