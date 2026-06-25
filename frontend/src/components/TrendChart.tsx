import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Fan } from '../types'

interface Props { fan: Fan }

function generateTrend(prob: number, points = 24) {
  const data = []
  let current = Math.max(0, prob - prob * 0.5)
  for (let i = 0; i < points; i++) {
    const drift = (i / points) * prob * 0.55
    const noise = (Math.random() - 0.48) * 6
    current = Math.max(0, Math.min(100, current + drift / points + noise))
    const h = new Date(Date.now() - (points - i) * 3 * 3600000)
    data.push({
      time: `${h.getHours().toString().padStart(2,'0')}:00`,
      probability: Math.round(current),
    })
  }
  return data
}

function probColor(p: number) {
  if (p >= 70) return '#E24B4A'
  if (p >= 40) return '#EF9F27'
  return '#639922'
}

export function TrendChart({ fan }: Props) {
  const data = useMemo(() => generateTrend(fan.failure_probability), [fan.id])
  const col = probColor(fan.failure_probability)

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Failure probability trend — {fan.id}</span>
        <span style={{ fontSize: 11, color: '#aaa' }}>72 h window</span>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 11, color: '#888', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: col, display: 'inline-block' }} /> {fan.id}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 2, background: '#EF9F27', display: 'inline-block' }} /> Warning 40%
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 2, background: '#E24B4A', display: 'inline-block' }} /> Critical 70%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Failure prob']}
            contentStyle={{ fontSize: 12, border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 6 }}
          />
          <ReferenceLine y={70} stroke="#E24B4A" strokeDasharray="4 2" strokeWidth={1} />
          <ReferenceLine y={40} stroke="#EF9F27" strokeDasharray="4 2" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="probability"
            stroke={col}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: col }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
