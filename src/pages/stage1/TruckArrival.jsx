import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/mockStore'
import Card from '../../components/Card'
import InputField from '../../components/InputField'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import StatusBadge from '../../components/StatusBadge'

const GATES = ['Gate 1', 'Gate 2', 'Weighbridge Entry']

function StageNav() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <SecondaryButton size="sm" onClick={() => navigate('/stage8/fg-dispatch')}>← Stage 8</SecondaryButton>
      <SecondaryButton size="sm" onClick={() => navigate('/stage2/requisition')}>Stage 2 →</SecondaryButton>
    </div>
  )
}

export default function TruckArrival() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useStore()
  const [form, setForm] = useState({
    vehicleNumber: '', transporter: '', driver: '',
    arrivalDateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    gate: '', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.vehicleNumber) e.vehicleNumber = 'Vehicle number is required'
    else if (!/^[A-Za-z0-9]{6,12}$/.test(form.vehicleNumber.replace(/\s/g, ''))) e.vehicleNumber = 'Must be 6–12 alphanumeric characters'
    if (!form.transporter) e.transporter = 'Transporter is required'
    if (!form.driver) e.driver = 'Driver name is required'
    if (!form.gate) e.gate = 'Gate/Entry point is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const id = `ARR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-00${state.trucks.length + 1}`
    dispatch({ type: 'LOG_TRUCK', payload: { ...form, id } })
    addToast({ type: 'success', title: 'Arrival Logged', message: `Vehicle ${form.vehicleNumber} checked in at ${form.gate}` })
    setSubmitted({ id, ...form })
  }

  const reset = () => {
    setForm({ vehicleNumber: '', transporter: '', driver: '', arrivalDateTime: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), gate: '', notes: '' })
    setErrors({})
    setSubmitted(null)
  }

  if (submitted) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>
        <div>
          <StageNav />
          <Card accent accentColor="#10B981" className="animate-scale-in">
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Arrival Logged</div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '16px 24px', marginBottom: 24, display: 'inline-block' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.5px' }}>TRUCK ARRIVAL ID</div>
                <div className="mono-id gradient-text" style={{ fontSize: 24, fontWeight: 700 }}>{submitted.id}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28, textAlign: 'left' }}>
                {[
                  ['Vehicle', submitted.vehicleNumber],
                  ['Transporter', submitted.transporter],
                  ['Driver', submitted.driver],
                  ['Gate', submitted.gate],
                  ['Time', submitted.arrivalDateTime],
                  ['Status', 'Checked In'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <PrimaryButton fullWidth size="lg" onClick={() => navigate('/stage1/grn/new', { state: { vehicleNumber: submitted.vehicleNumber, truckId: submitted.id } })}>
                  Raise GRN →
                </PrimaryButton>
                <SecondaryButton fullWidth onClick={reset}>Log Another</SecondaryButton>
              </div>
            </div>
          </Card>
        </div>
        <RecentArrivalsPanel navigate={navigate} trucks={state.trucks} />
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>

      {/* Form column — fills available space */}
      <div>
        <StageNav />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: 'var(--accent-cyan)', borderRadius: 2 }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gate Guard · Log vehicle arrival at plant gate</span>
        </div>

        <Card accent>
          <div style={{ padding: '28px 32px' }}>

            {/* Row 1: Vehicle Number (full width — primary field) */}
            <div style={{ marginBottom: 20 }}>
              <InputField
                label="Vehicle Number"
                value={form.vehicleNumber}
                onChange={e => set('vehicleNumber', e.target.value.toUpperCase())}
                placeholder="e.g. MH12AB1234"
                required
                error={errors.vehicleNumber}
                hint="Match exactly as on transport document"
              />
            </div>

            {/* Row 2: Transporter + Driver (two columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <InputField
                label="Transporter"
                value={form.transporter}
                onChange={e => set('transporter', e.target.value)}
                placeholder="e.g. Blue Dart Logistics"
                required
                error={errors.transporter}
              />
              <InputField
                label="Driver Name"
                value={form.driver}
                onChange={e => set('driver', e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                error={errors.driver}
              />
            </div>

            {/* Row 3: Arrival Date + Gate (two columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <InputField
                label="Arrival Date & Time"
                value={form.arrivalDateTime}
                onChange={e => set('arrivalDateTime', e.target.value)}
                hint="🔒 Auto-filled from system clock"
                autoFilled
              />
              <InputField
                label="Gate / Entry Point"
                value={form.gate}
                onChange={e => set('gate', e.target.value)}
                as="select"
                options={GATES}
                required
                error={errors.gate}
              />
            </div>

            {/* Row 4: Notes (full width) */}
            <div style={{ marginBottom: 24 }}>
              <InputField
                label="Notes / Remarks"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                as="textarea"
                placeholder="Any remarks about vehicle condition, seals, document anomalies, etc."
              />
            </div>

            <PrimaryButton fullWidth size="lg" onClick={handleSubmit}>Log Arrival →</PrimaryButton>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <RecentArrivalsPanel navigate={navigate} trucks={state.trucks} />
    </div>
  )
}

function RecentArrivalsPanel({ trucks, navigate }) {
  const todayApproved = trucks.filter(t => t.grnRaised).length
  const todayPending = trucks.filter(t => !t.grnRaised).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Today's summary */}
      <Card>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Today's Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#7B9FFF' }}>{trucks.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Total</div>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>{todayApproved}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>GRN Done</div>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 6px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>{todayPending}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Pending</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent arrivals list */}
      <Card>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 16, background: 'var(--accent-cyan)', borderRadius: 2 }} />
            Recent Arrivals
          </div>
          {trucks.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No arrivals today</div>
          )}
          {trucks.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{
              padding: '12px 0',
              borderBottom: i < Math.min(trucks.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              animation: `fadeInUp 0.2s ease ${i * 40}ms both`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div className="mono-id" style={{ fontSize: 13 }}>{t.vehicleNumber}</div>
                <StatusBadge status={t.grnRaised ? 'APPROVED' : 'PENDING'} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-body)', marginBottom: 2 }}>{t.transporter}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t.arrivalTime} · {t.gate || 'Gate 1'}
              </div>
              {!t.grnRaised && (
                <button
                  onClick={() => navigate('/stage1/grn/new', { state: { vehicleNumber: t.vehicleNumber, truckId: t.id } })}
                  style={{ marginTop: 8, background: 'none', border: '1px solid rgba(91,200,217,0.3)', borderRadius: 6, padding: '4px 12px', color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,200,217,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  Raise GRN →
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Gate info reference */}
      <Card>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Gate Reference</div>
          {[
            { gate: 'Gate 1', label: 'Main Entry — Standard vehicles' },
            { gate: 'Gate 2', label: 'East Entry — Oversized loads' },
            { gate: 'Weighbridge', label: 'North Entry — Mandatory for bulk' },
          ].map(({ gate, label }) => (
            <div key={gate} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{gate}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
