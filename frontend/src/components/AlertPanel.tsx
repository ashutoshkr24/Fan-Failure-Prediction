import type { Alert } from '../types'
import { alertApi } from '../services/api'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Props { alerts: Alert[] }

const SEVERITY_STYLE = {
  critical: { bg: '#FCEBEB', border: '#F7C1C1', icon: '🔴', color: '#A32D2D' },
  warning:  { bg: '#FAEEDA', border: '#FAC775', icon: '🟠', color: '#854F0B' },
  info:     { bg: '#E6F1FB', border: '#B5D4F4', icon: '🔵', color: '#185FA5' },
}

export function AlertPanel({ alerts }: Props) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const visible = alerts.filter(a => !dismissed.has(a.id)).slice(0, 5)

  async function ack(id: number) {
    try { await alertApi.acknowledge(id) } catch { /* demo mode */ }
    setDismissed(prev => new Set([...prev, id]))
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Active alerts</span>
        <span style={{ fontSize: 11, background: '#FCEBEB', color: '#A32D2D', padding: '2px 8px', borderRadius: 10 }}>
          {visible.length} open
        </span>
      </div>

      {visible.length === 0 && (
        <div style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '2rem 0' }}>
          No active alerts — all fans nominal
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map(alert => {
          const s = SEVERITY_STYLE[alert.severity]
          return (
            <div key={alert.id} style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0, fontSize: 14 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 500, lineHeight: 1.4 }}>{alert.fan_id} — {alert.sensor}</div>
                  <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4, marginTop: 2 }}>{alert.message}</div>
                  {alert.recommendation && (
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontStyle: 'italic' }}>{alert.recommendation}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: '#aaa' }}>
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                    <button
                      onClick={() => ack(alert.id)}
                      style={{ fontSize: 10, padding: '2px 8px', border: `0.5px solid ${s.border}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', color: s.color }}
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
