import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/mockStore'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import PrimaryButton from '../components/PrimaryButton'

const TRACE_DB = {
  'LOT-20240624-001': {
    type: 'Vendor Lot', id: 'LOT-20240624-001', material: 'Cola Concentrate 30X', vendor: 'Pepsico Ingredients Ltd',
    children: [{ type: 'Batch', id: 'BATCH-20240624-001', material: 'Cola Mix Batch', children: [
      { type: 'Carton', id: 'CTN-20240624-00001', material: '48 pouches', children: [
        { type: 'Pallet', id: 'PLT-20240624-001', material: '24 cartons · FG-A-01', children: [] }
      ]}
    ]}]
  },
  'BATCH-20240624-001': {
    type: 'Batch', id: 'BATCH-20240624-001', material: 'Cola Mix', vendor: 'Internal',
    children: [{ type: 'Carton', id: 'CTN-20240624-00001', material: '48 pouches', children: [
      { type: 'Pallet', id: 'PLT-20240624-001', material: '24 cartons', children: [] }
    ]}],
    parents: [{ type: 'Vendor Lot', id: 'LOT-20240624-001', material: 'Cola Concentrate 30X' }]
  },
}

const TYPE_ICONS = { 'Vendor Lot': '📦', Batch: '⚗️', Pouch: '🫙', Tray: '🗄️', Carton: '📦', Pallet: '📦' }
const TYPE_COLORS = { 'Vendor Lot': '#5BC8D9', Batch: '#A78BFA', Pouch: '#F59E0B', Tray: '#7B9FFF', Carton: '#10B981', Pallet: '#F45B4A' }

function TraceNode({ node, depth = 0, expanded, onToggle }) {
  const hasChildren = node.children?.length > 0
  const color = TYPE_COLORS[node.type] || '#5BC8D9'
  const isExp = expanded[node.id]

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: depth === 0 ? 'var(--bg-elevated)' : 'var(--bg-card)',
        borderRadius: 10, marginBottom: 6,
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        cursor: hasChildren ? 'pointer' : undefined,
        transition: 'all 0.15s',
      }} onClick={() => hasChildren && onToggle(node.id)}>
        <span style={{ fontSize: 18 }}>{TYPE_ICONS[node.type] || '📦'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{node.type}</span>
          </div>
          <div className="mono-id" style={{ fontSize: 14, fontWeight: 700 }}>{node.id}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{node.material} {node.vendor ? `· ${node.vendor}` : ''}</div>
        </div>
        {hasChildren && <span style={{ color: 'var(--text-muted)', fontSize: 12, transition: 'transform 0.2s', transform: isExp ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>}
      </div>
      {isExp && node.children?.map(child => (
        <div key={child.id} style={{ position: 'relative', marginLeft: 16, paddingLeft: 8, borderLeft: `1px solid ${color}33` }}>
          <TraceNode node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
        </div>
      ))}
    </div>
  )
}

export default function Traceability() {
  const { state } = useStore()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [direction, setDirection] = useState('forward')
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(false)

  const recentLots = state.lots.slice(0, 4)
  const recentBatches = state.batches.slice(0, 3)

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => {
      const found = TRACE_DB[query.trim().toUpperCase()] || TRACE_DB[Object.keys(TRACE_DB).find(k => k.includes(query.trim().toUpperCase()) || query.trim().toUpperCase().includes(k.slice(-3))) || '']
      setResult(found || { type: 'Not Found', id: query, material: 'No genealogy data found for this ID', children: [] })
      setExpanded({ [found?.id]: true })
      setLoading(false)
    }, 600)
  }

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))
  const expandAll = () => {
    if (!result) return
    const ids = {}
    const collect = (n) => { ids[n.id] = true; n.children?.forEach(collect) }
    collect(result)
    setExpanded(ids)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card accent accentColor="var(--gradient-cta)">
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Genealogy Search</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Enter any ID: Vendor Lot · Batch · Pouch · Tray · Carton · Pallet
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. LOT-20240624-001 or BATCH-20240624-001"
              style={{
                flex: 1, height: 48, padding: '0 16px', background: 'var(--input-bg)',
                border: '1px solid var(--border-strong)', borderRadius: 8,
                color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 14, outline: 'none',
              }}
            />
            <PrimaryButton onClick={handleSearch} size="lg" disabled={!query.trim()}>
              {loading ? '⟳ Searching…' : '🔍 Trace'}
            </PrimaryButton>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {['Try: LOT-20240624-001', 'Try: BATCH-20240624-001'].map(ex => (
              <button key={ex} onClick={() => { setQuery(ex.replace('Try: ', '')); }} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 99,
                padding: '4px 12px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              }}>{ex}</button>
            ))}
          </div>
        </div>
      </Card>

      {result && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Genealogy Tree</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['forward', 'backward'].map(d => (
                  <button key={d} onClick={() => setDirection(d)} style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: direction === d ? 'var(--accent-cyan)' : 'var(--bg-elevated)', color: direction === d ? '#fff' : 'var(--text-muted)',
                  }}>{d === 'forward' ? '→ Forward' : '← Backward'}</button>
                ))}
              </div>
            </div>
            <button onClick={expandAll} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Expand All</button>
          </div>

          {direction === 'backward' && result.parents && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>← Upstream Sources</div>
              {result.parents.map(p => (
                <div key={p.id} style={{ padding: '10px 16px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid rgba(91,200,217,0.2)', borderLeft: '3px solid var(--accent-cyan)', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 2 }}>{p.type}</div>
                  <div className="mono-id" style={{ fontSize: 14 }}>{p.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.material}</div>
                </div>
              ))}
              <div style={{ height: 2, background: 'var(--border)', margin: '12px 0' }} />
            </div>
          )}

          <TraceNode node={result} expanded={expanded} onToggle={toggleExpand} />

          <Card style={{ marginTop: 16 }}>
            <div style={{ padding: 16, display: 'flex', gap: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trace completed in &lt;1s · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              <button style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }}>Export PDF →</button>
            </div>
          </Card>
        </div>
      )}

      {!result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
          {/* Left: ID type guide + recent lots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* ID format guide */}
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Traceable ID Formats</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { type: 'Vendor Lot', fmt: 'LOT-YYYYMMDD-NNN', ex: 'LOT-20240624-001', color: '#5BC8D9', icon: '📦', desc: 'Raw material receipt from vendor' },
                    { type: 'Batch', fmt: 'BATCH-YYYYMMDD-NNN', ex: 'BATCH-20240624-001', color: '#A78BFA', icon: '⚗️', desc: 'Production mix batch' },
                    { type: 'Carton', fmt: 'CTN-YYYYMMDD-NNNNN', ex: 'CTN-20240624-00001', color: '#10B981', icon: '📦', desc: 'Secondary packed carton' },
                    { type: 'Tray', fmt: 'ISA-TRY-NNN', ex: 'ISA-TRY-001', color: '#7B9FFF', icon: '🗄️', desc: 'ISA tray from primary packing' },
                    { type: 'Pallet', fmt: 'PLT-YYYYMMDD-NNN', ex: 'PLT-20240624-001', color: '#F45B4A', icon: '📦', desc: 'FG warehouse pallet' },
                    { type: 'GRN', fmt: 'GRN-YYYYMMDD-NNN', ex: 'GRN-20240624-001', color: '#F59E0B', icon: '📋', desc: 'Goods receipt note' },
                  ].map(({ type, fmt, ex, color, icon, desc }) => (
                    <div key={type} onClick={() => { setQuery(ex); }}
                      style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, cursor: 'pointer', border: `1px solid ${color}22`, borderLeft: `3px solid ${color}`, transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = `${color}08`}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{type}</span>
                      </div>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{fmt}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-body)' }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Lots */}
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Recent Vendor Lots</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {recentLots.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>No lots yet</div>
                  ) : recentLots.map((lot, i) => (
                    <div key={lot.id}
                      onClick={() => { setQuery(lot.id); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentLots.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,200,217,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 2 }}>
                          <span className="mono-id" style={{ fontSize: 13 }}>{lot.id}</span>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: TYPE_COLORS['Vendor Lot'] + '22', color: TYPE_COLORS['Vendor Lot'], fontWeight: 600 }}>LOT</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lot.material} · {lot.vendor}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lot.qty} {lot.unit}</div>
                        <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>Trace →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Batches */}
            {recentBatches.length > 0 && (
              <Card>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Recent Batches</div>
                  {recentBatches.map((batch, i) => (
                    <div key={batch.id}
                      onClick={() => { setQuery(batch.id); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentBatches.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 2 }}>
                          <span className="mono-id" style={{ fontSize: 13 }}>{batch.id}</span>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: TYPE_COLORS['Batch'] + '22', color: TYPE_COLORS['Batch'], fontWeight: 600 }}>BATCH</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{batch.product} · {batch.status}</div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>Trace →</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: How to use + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>How to Trace</div>
                {[
                  { step: '1', text: 'Enter any ID — lot, batch, carton, tray, or pallet' },
                  { step: '2', text: 'System finds all related records across the value chain' },
                  { step: '3', text: 'Expand nodes to see upstream and downstream links' },
                  { step: '4', text: 'Export the full genealogy report as PDF' },
                ].map(({ step, text }) => (
                  <div key={step} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(91,200,217,0.15)', border: '1px solid rgba(91,200,217,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', flexShrink: 0 }}>{step}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5, paddingTop: 3 }}>{text}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Traceability Stats</div>
                {[
                  { label: 'Total Lots', value: state.lots.length, color: '#5BC8D9' },
                  { label: 'Active Batches', value: state.batches.length, color: '#A78BFA' },
                  { label: 'Cartons Tagged', value: state.cartons.length, color: '#10B981' },
                  { label: 'Pallets in FG', value: state.pallets.length, color: '#F45B4A' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Quick Trace</div>
                {['LOT-20240624-001', 'BATCH-20240624-001'].map(id => (
                  <button key={id} onClick={() => setQuery(id)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--accent-cyan)', fontSize: 11, fontFamily: 'Space Mono', cursor: 'pointer' }}>
                    {id}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
