import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/mockStore'
import { CheckCircle2, Circle, ChevronRight, X, Truck, ClipboardList, FlaskConical, MapPin } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'Truck Arrival', short: 'Truck', Icon: Truck,          path: '/stage1/truck-arrival',  journeyKey: 'truckId',  color: '#7B9FFF' },
  { n: 2, label: 'GRN Creation', short: 'GRN',   Icon: ClipboardList,  path: '/stage1/grn/new',        journeyKey: 'grnId',    color: '#5BC8D9' },
  { n: 3, label: 'QA Inspection',short: 'QA',    Icon: FlaskConical,   path: '/stage1/qa-inspection',  journeyKey: 'lotId',    color: '#F59E0B' },
  { n: 4, label: 'Put Away',     short: 'Store', Icon: MapPin,         path: '/stage1/put-away',       journeyKey: 'location', color: '#10B981' },
]

export default function WorkflowJourneyBanner({ currentStep }) {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const journey = state.activeJourney
  if (!journey) return null

  return (
    <div style={{
      marginBottom: 16, padding: '10px 16px',
      background: 'rgba(91,200,217,0.04)',
      border: '1px solid rgba(91,200,217,0.18)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 0,
    }}>
      {/* Label */}
      <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 16, flexShrink: 0 }}>
        Live Flow
      </div>

      {/* Steps */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 2 }}>
        {STEPS.map((step, i) => {
          const isDone = step.n < currentStep || (step.n === currentStep && journey.currentStep > currentStep)
          const isCurrent = step.n === currentStep
          const isPending = step.n > currentStep
          const idValue = journey[step.journeyKey]
          const color = isDone ? step.color : isCurrent ? step.color : 'var(--text-muted)'

          return (
            <React.Fragment key={step.n}>
              <div
                onClick={() => isDone && idValue && navigate(step.path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '4px 10px', borderRadius: 8, flexShrink: 0,
                  cursor: isDone && idValue ? 'pointer' : 'default',
                  background: isCurrent ? `${step.color}14` : 'transparent',
                  border: isCurrent ? `1px solid ${step.color}44` : '1px solid transparent',
                  transition: 'all 0.15s',
                  minWidth: 72,
                }}
                onMouseEnter={e => { if (isDone && idValue) e.currentTarget.style.background = `${step.color}20` }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; else e.currentTarget.style.background = `${step.color}14` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isDone
                    ? <CheckCircle2 size={13} style={{ color: step.color }} strokeWidth={2.5} />
                    : isCurrent
                      ? <step.Icon size={13} style={{ color: step.color }} strokeWidth={1.75} />
                      : <Circle size={13} style={{ color: 'var(--border-strong)' }} strokeWidth={1.5} />
                  }
                  <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color }}>
                    {step.short}
                  </span>
                </div>
                {idValue ? (
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: isDone || isCurrent ? color : 'var(--text-muted)', opacity: 0.8, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {idValue}
                  </span>
                ) : (
                  <span style={{ fontSize: 9, color: 'var(--border-strong)' }}>—</span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={12} style={{ color: step.n < currentStep ? step.color : 'var(--border-strong)', flexShrink: 0, margin: '0 2px' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Vehicle badge */}
      {journey.vehicleNumber && (
        <div style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: '#7B9FFF', background: 'rgba(123,159,255,0.1)', border: '1px solid rgba(123,159,255,0.25)', padding: '3px 10px', borderRadius: 99, marginLeft: 12, flexShrink: 0 }}>
          {journey.vehicleNumber}
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={() => dispatch({ type: 'CLEAR_JOURNEY' })}
        style={{
          marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 4,
          flexShrink: 0, transition: 'color 0.15s',
        }}
        title="Dismiss journey tracker"
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={14} />
      </button>
    </div>
  )
}
