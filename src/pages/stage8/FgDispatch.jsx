import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import DataTable from '../../components/DataTable'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'

const FG_INVENTORY = [
  { id: 'PLT-20240624-001', sku: 'Campa Cola 200ml', cartons: 24, batch: 'BATCH-20240624-001', location: 'FG-A-01', status: 'IN_FG', qaPassed: true },
  { id: 'PLT-20240624-002', sku: 'Campa Lemon 200ml', cartons: 18, batch: 'BATCH-20240624-002', location: 'FG-B-03', status: 'IN_FG', qaPassed: true },
  { id: 'PLT-20240624-003', sku: 'Campa Cola 200ml', cartons: 24, batch: 'BATCH-20240624-001', location: 'FG-A-02', status: 'DISPATCHED', qaPassed: true },
]

const DISPATCH_ORDERS = [
  { id: 'DO-2024-001', customer: 'Metro Distributors', pallets: 2, skus: 'Campa Cola 200ml', status: 'READY' },
  { id: 'DO-2024-002', customer: 'Reliance Retail', pallets: 1, skus: 'Campa Lemon 200ml', status: 'PENDING' },
]

export default function FgDispatch() {
  const navigate = useNavigate()
  const { addToast } = useStore()
  const [inventory, setInventory] = useState(FG_INVENTORY)
  const [dispatching, setDispatching] = useState(null)

  const handleDispatch = (orderId) => {
    setInventory(inv => inv.map((p, i) => i < 2 ? { ...p, status: 'DISPATCHED' } : p))
    addToast({ type: 'success', title: 'Dispatch Confirmed', message: `${orderId} — Pallets dispatched` })
    setDispatching(null)
  }

  const cols = [
    { key: 'id', label: 'Pallet ID', mono: true },
    { key: 'sku', label: 'SKU' },
    { key: 'cartons', label: 'Cartons', align: 'center' },
    { key: 'batch', label: 'Batch', mono: true },
    { key: 'location', label: 'Location' },
    { key: 'qaPassed', label: 'QA', render: v => v ? <span style={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>✓ Passed</span> : <span style={{ color: '#EF4444' }}>✗ Fail</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v === 'IN_FG' ? 'APPROVED' : 'IN_TRANSIT'} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SecondaryButton size="sm" onClick={() => navigate('/stage7/secondary-packing')}>← Stage 7</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => navigate('/stage1/truck-arrival')}>Stage 1 (New Cycle) →</SecondaryButton>
        </div>
        <PrimaryButton onClick={() => addToast({ type: 'info', message: 'Dispatch order form opened' })}>+ New Dispatch Order</PrimaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Pallets in FG', value: inventory.filter(p => p.status === 'IN_FG').length, color: '#10B981' },
          { label: 'Pending Dispatch Orders', value: DISPATCH_ORDERS.length, color: '#F59E0B' },
          { label: 'Dispatched Today', value: inventory.filter(p => p.status === 'DISPATCHED').length, color: '#5BC8D9' },
        ].map(k => (
          <Card key={k.label} accent accentColor={k.color}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <Card accent>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>FG Warehouse Inventory</div>
            <DataTable columns={cols} data={inventory} />
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Dispatch Orders</div>
              {DISPATCH_ORDERS.map(order => (
                <div key={order.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="mono-id" style={{ fontSize: 13 }}>{order.id}</span>
                    <StatusBadge status={order.status === 'READY' ? 'APPROVED' : 'PENDING'} />
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>{order.customer}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{order.pallets} pallets · {order.skus}</div>
                  {order.status === 'READY' && (
                    <PrimaryButton size="sm" onClick={() => setDispatching(order)}>Dispatch Now →</PrimaryButton>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {dispatching && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card className="animate-scale-in" style={{ width: 400 }}>
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Confirm Dispatch</div>
              <div style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: 20 }}>
                Dispatch {dispatching.pallets} pallets to {dispatching.customer}?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <SecondaryButton fullWidth onClick={() => setDispatching(null)}>Cancel</SecondaryButton>
                <PrimaryButton fullWidth onClick={() => handleDispatch(dispatching.id)}>Confirm Dispatch</PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
