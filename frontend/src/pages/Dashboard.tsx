import { useState } from 'react'
import { useFans } from '../hooks/useFans'
import type { Fan } from '../types'
import { FanCard } from '../components/FanCard'
import { SensorPanel } from '../components/SensorPanel'
import { TrendChart } from '../components/TrendChart'
import { AlertPanel } from '../components/AlertPanel'
import { ModelPanel } from '../components/ModelPanel'
import { KPIBar } from '../components/KPIBar'

export function Dashboard() {
  const { fans, alerts, models, loading, error } = useFans(5000)
  const [selectedFan, setSelectedFan] = useState<Fan | null>(null)

  const activeFan = selectedFan ?? fans.find(f => f.status === 'critical') ?? fans[0]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#888' }}>
        Loading fan data…
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#854F0B' }}>
          ⚠ {error}
        </div>
      )}

      <KPIBar fans={fans} alerts={alerts} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
        {/* Fan grid */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fan failure probability — click to inspect
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {fans.map(fan => (
              <FanCard
                key={fan.id}
                fan={fan}
                selected={activeFan?.id === fan.id}
                onClick={() => setSelectedFan(fan)}
              />
            ))}
          </div>
        </div>

        {/* Sensor detail panel */}
        {activeFan && <SensorPanel fan={activeFan} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {activeFan && <TrendChart fan={activeFan} />}
        <AlertPanel alerts={alerts} />
      </div>

      <ModelPanel models={models} />
    </div>
  )
}
