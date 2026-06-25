import type { Fan } from '../types'

interface Props {
  fan: Fan
  selected: boolean
  onClick: () => void
}

function probColor(p: number) {
  if (p >= 70) return '#E24B4A'
  if (p >= 40) return '#EF9F27'
  return '#639922'
}

const STATUS_LABELS = { ok: 'OK', warning: 'Warning', critical: 'Critical', offline: 'Offline' }
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ok:       { bg: '#EAF3DE', color: '#3B6D11' },
  warning:  { bg: '#FAEEDA', color: '#854F0B' },
  critical: { bg: '#FCEBEB', color: '#A32D2D' },
  offline:  { bg: '#F1EFE8', color: '#5F5E5A' },
}

export function FanCard({ fan, selected, onClick }: Props) {
  const col = probColor(fan.failure_probability)
  const ss = STATUS_STYLE[fan.status]

  return (
    <div
      onClick={onClick}
      style={{
        border: selected ? '1.5px solid #185FA5' : '0.5px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        background: selected ? '#F0F6FD' : '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{fan.id}</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 500, background: ss.bg, color: ss.color }}>
          {STATUS_LABELS[fan.status]}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: col }}>{fan.failure_probability.toFixed(0)}%</div>
      <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6 }}>failure probability</div>
      <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2 }}>
        <div style={{ height: 3, width: `${fan.failure_probability}%`, background: col, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}
