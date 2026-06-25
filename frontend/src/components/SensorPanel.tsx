import type { Fan } from '../types'

interface Props { fan: Fan }

interface SensorConfig {
  label: string
  key: string
  unit: string
  value: number
  max: number
  warnAt: number
  critAt: number
  lowerIsBetter?: boolean
}

function getSensors(fan: Fan): SensorConfig[] {
  // These values would come from the latest reading in a real app;
  // here we derive plausible values from the fan's failure probability
  const prob = fan.failure_probability / 100
  const lerp = (a: number, b: number) => a + (b - a) * prob

  return [
    { label: 'Vibration', key: 'vib',     unit: 'mm/s', value: lerp(0.8, 7.0),  max: 8,    warnAt: 2.8, critAt: 5.0   },
    { label: 'Bearing temp', key: 'btmp', unit: '°C',   value: lerp(38, 80),    max: 90,   warnAt: 55,  critAt: 70    },
    { label: 'Motor temp', key: 'mtmp',   unit: '°C',   value: lerp(40, 82),    max: 100,  warnAt: 60,  critAt: 75    },
    { label: 'Current draw', key: 'curr', unit: 'A',    value: lerp(13.5, 21),  max: 25,   warnAt: 17,  critAt: 19.5  },
    { label: 'Noise level', key: 'noise', unit: 'dB',   value: lerp(58, 88),    max: 100,  warnAt: 72,  critAt: 82    },
    { label: 'RPM', key: 'rpm',           unit: '',     value: lerp(1468, 1360), max: 1500, warnAt: 1410, critAt: 1390, lowerIsBetter: true },
  ].map(s => ({ ...s, value: Math.round(s.value * 10) / 10 }))
}

export function SensorPanel({ fan }: Props) {
  const sensors = getSensors(fan)

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.875rem' }}>
        Sensor telemetry — <span style={{ color: '#185FA5' }}>{fan.id}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sensors.map(s => {
          const pct = Math.min(100, (s.value / s.max) * 100)
          let col = '#639922'
          if (s.lowerIsBetter) {
            col = s.value <= s.critAt ? '#E24B4A' : s.value <= s.warnAt ? '#EF9F27' : '#639922'
          } else {
            col = s.value >= s.critAt ? '#E24B4A' : s.value >= s.warnAt ? '#EF9F27' : '#639922'
          }
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#888', width: 110, flexShrink: 0 }}>{s.label}</span>
              <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3 }}>
                <div style={{ width: `${pct}%`, height: 6, background: col, borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: col, width: 58, textAlign: 'right', flexShrink: 0 }}>
                {s.value}{s.unit}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '0.875rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>ML failure probability</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: 32,
            fontWeight: 500,
            color: fan.failure_probability >= 70 ? '#E24B4A' : fan.failure_probability >= 40 ? '#EF9F27' : '#639922'
          }}>
            {fan.failure_probability.toFixed(0)}%
          </span>
          <span style={{ fontSize: 12, color: '#aaa' }}>{fan.status === 'critical' ? '— urgent action required' : fan.status === 'warning' ? '— preventive maintenance advised' : '— normal operation'}</span>
        </div>
      </div>
    </div>
  )
}
