import type { Fan, Alert } from '../types'

interface Props {
  fans: Fan[]
  alerts: Alert[]
}

export function KPIBar({ fans, alerts }: Props) {
  const critical = fans.filter(f => f.status === 'critical').length
  const warning  = fans.filter(f => f.status === 'warning').length
  const ok       = fans.filter(f => f.status === 'ok').length
  const unacked  = alerts.filter(a => !a.acknowledged).length

  const cards = [
    { label: 'Total fans', value: fans.length, sub: 'All online', color: '#185FA5', bg: '#E6F1FB' },
    { label: 'Critical',   value: critical,    sub: 'Immediate action', color: '#A32D2D', bg: '#FCEBEB' },
    { label: 'Warning',    value: warning,     sub: 'Monitor closely',  color: '#854F0B', bg: '#FAEEDA' },
    { label: 'Healthy',    value: ok,          sub: 'Normal operation', color: '#3B6D11', bg: '#EAF3DE' },
    { label: 'Open alerts',value: unacked,     sub: 'Unacknowledged',   color: '#533AB7', bg: '#EEEDFE' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{c.label}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: c.color, lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
