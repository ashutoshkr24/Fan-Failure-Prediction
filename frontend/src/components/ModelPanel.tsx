import { useState } from 'react'
import type { ModelMetrics } from '../types'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface Props { models: ModelMetrics[] }

export function ModelPanel({ models }: Props) {
  const [selected, setSelected] = useState(0)
  const m = models[selected]

  if (!m) return null

  const radarData = [
    { metric: 'Accuracy',  value: m.accuracy },
    { metric: 'Precision', value: m.precision },
    { metric: 'Recall',    value: m.recall },
    { metric: 'F1',        value: m.f1_score },
    { metric: 'AUC-ROC',  value: m.auc_roc },
  ]

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>ML model performance</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {models.map((mod, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                border: selected === i ? '1.5px solid #185FA5' : '0.5px solid rgba(0,0,0,0.15)',
                background: selected === i ? '#E6F1FB' : 'transparent',
                color: selected === i ? '#185FA5' : '#888',
              }}
            >
              {mod.model_name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Accuracy',  value: m.accuracy },
            { label: 'Precision', value: m.precision },
            { label: 'Recall',    value: m.recall },
            { label: 'F1 score',  value: m.f1_score },
            { label: 'AUC-ROC',  value: m.auc_roc },
            { label: 'Features',  value: m.feature_count, unit: '' },
          ].map(s => (
            <div key={s.label} style={{ background: '#f8f8f8', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#222' }}>
                {s.unit === '' ? s.value : `${s.value.toFixed(1)}%`}
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,0,0,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#888' }} />
            <Radar name={m.model_name} dataKey="value" stroke="#185FA5" fill="#185FA5" fillOpacity={0.15} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '0.875rem', fontSize: 11, color: '#aaa', borderTop: '0.5px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem' }}>
        Trained on {m.training_samples.toLocaleString()} samples · {m.feature_count} features · last retrained {new Date(m.last_trained).toLocaleDateString()}
      </div>
    </div>
  )
}
