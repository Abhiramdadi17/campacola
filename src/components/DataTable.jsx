import React from 'react'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data' }) {
  return (
    <div style={{ overflow: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '12px 16px', textAlign: col.align || 'left',
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                letterSpacing: '0.6px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                borderBottom: '1px solid var(--border)',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background 0.1s',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(91,200,217,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '12px 16px', textAlign: col.align || 'left',
                  color: col.mono ? 'var(--accent-cyan)' : 'var(--text-body)',
                  fontFamily: col.mono ? 'Space Mono, monospace' : undefined,
                  fontSize: 13, whiteSpace: col.wrap ? undefined : 'nowrap',
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
