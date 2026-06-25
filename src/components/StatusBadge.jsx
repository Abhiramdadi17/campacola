import React from 'react'

const STATUS_CONFIG = {
  PENDING:    { color: '#F59E0B', label: 'Pending' },
  HOLD:       { color: '#F59E0B', label: 'Hold' },
  APPROVED:   { color: '#10B981', label: 'Approved' },
  AVAILABLE:  { color: '#10B981', label: 'Available' },
  REJECTED:   { color: '#EF4444', label: 'Rejected' },
  UNDER_QC:   { color: '#5BC8D9', label: 'Under QC' },
  UNDER_INSPECTION: { color: '#5BC8D9', label: 'Under Inspection' },
  IN_TRANSIT: { color: '#7B9FFF', label: 'In Transit' },
  IN_PROGRESS:{ color: '#7B9FFF', label: 'In Progress' },
  OPEN:       { color: '#EF4444', label: 'Open' },
  RESOLVED:   { color: '#10B981', label: 'Resolved' },
  PARTIAL:    { color: '#F59E0B', label: 'Partial' },
  CLOSED:     { color: '#10B981', label: 'Closed' },
  IN_FG:      { color: '#10B981', label: 'In FG' },
  REWORKABLE: { color: '#F59E0B', label: 'Reworkable' },
  FEFO:       { color: '#5BC8D9', label: 'FEFO' },
  DRAFT:      { color: '#6B7280', label: 'Draft' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { color: '#6B7280', label: status }
  const px = size === 'lg' ? '8px 16px' : '4px 12px'
  const fs = size === 'lg' ? '12px' : '11px'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: px, borderRadius: 99,
      background: cfg.color + '26',
      border: `1px solid ${cfg.color}4D`,
      color: cfg.color, fontSize: fs,
      fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}
