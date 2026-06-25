import { useState, useEffect, useCallback } from 'react'
import { fanApi, alertApi, modelApi } from '../services/api'
import type { Fan, Alert, ModelMetrics } from '../types'

export function useFans(pollMs = 5000) {
  const [fans, setFans] = useState<Fan[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [models, setModels] = useState<ModelMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [f, a, m] = await Promise.all([
        fanApi.list(),
        alertApi.list(),
        modelApi.metrics(),
      ])
      setFans(f)
      setAlerts(a)
      setModels(m)
      setError(null)
    } catch (e) {
      setError('API unreachable — showing demo data')
      // Inject demo data so the UI is always usable
      setFans(getDemoFans())
      setAlerts(getDemoAlerts())
      setModels(getDemoModels())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, pollMs)
    return () => clearInterval(interval)
  }, [fetchAll, pollMs])

  return { fans, alerts, models, loading, error, refresh: fetchAll }
}

// ── Demo data (used when backend is unreachable) ──────────────

function getDemoFans(): Fan[] {
  const configs = [
    { prob: 12, status: 'ok' as const },
    { prob: 38, status: 'ok' as const },
    { prob: 78, status: 'critical' as const },
    { prob: 9,  status: 'ok' as const },
    { prob: 55, status: 'warning' as const },
    { prob: 22, status: 'ok' as const },
    { prob: 6,  status: 'ok' as const },
    { prob: 48, status: 'warning' as const },
    { prob: 17, status: 'ok' as const },
  ]
  return configs.map((c, i) => ({
    id: `FAN-${String(i+1).padStart(2,'0')}`,
    name: `Exhaust Fan ${String(i+1).padStart(2,'0')}`,
    location: `Section ${String.fromCharCode(65 + Math.floor(i/3))}`,
    unit: 'Unit-3',
    model: 'Howden HF-22',
    rated_rpm: 1500,
    rated_power_kw: 22,
    status: c.status,
    failure_probability: c.prob,
    last_maintenance: '2026-05-15T08:00:00',
    next_maintenance: '2026-08-15T08:00:00',
    updated_at: new Date().toISOString(),
  }))
}

function getDemoAlerts(): Alert[] {
  return [
    { id: 1, fan_id: 'FAN-03', severity: 'critical', sensor: 'Vibration', message: 'FAN-03: Vibration exceeded critical threshold (5.6 mm/s > 5.0 mm/s)', recommendation: 'Inspect rotor balance and bearing condition.', value: 5.6, threshold: 5.0, acknowledged: false, resolved: false, created_at: new Date(Date.now()-2*60000).toISOString() },
    { id: 2, fan_id: 'FAN-05', severity: 'warning', sensor: 'Bearing temperature', message: 'FAN-05: Bearing temp exceeds warning threshold (63°C > 55°C)', recommendation: 'Check lubrication and bearing wear.', value: 63, threshold: 55, acknowledged: false, resolved: false, created_at: new Date(Date.now()-17*60000).toISOString() },
    { id: 3, fan_id: 'FAN-08', severity: 'warning', sensor: 'RPM', message: 'FAN-08: RPM below warning threshold (1408 < 1410)', recommendation: 'Check belt tension and motor coupling.', value: 1408, threshold: 1410, acknowledged: false, resolved: false, created_at: new Date(Date.now()-34*60000).toISOString() },
  ]
}

function getDemoModels(): ModelMetrics[] {
  return [
    { model_name: 'Random Forest Classifier', accuracy: 94.2, precision: 91.8, recall: 96.1, f1_score: 93.9, auc_roc: 97.4, last_trained: '2026-06-24T18:00:00', training_samples: 54210, feature_count: 9 },
    { model_name: 'LSTM Sequence Model', accuracy: 91.6, precision: 89.3, recall: 93.7, f1_score: 91.4, auc_roc: 95.8, last_trained: '2026-06-23T12:00:00', training_samples: 48000, feature_count: 9 },
    { model_name: 'Isolation Forest', accuracy: 88.5, precision: 85.1, recall: 90.2, f1_score: 87.5, auc_roc: 93.1, last_trained: '2026-06-24T18:00:00', training_samples: 54210, feature_count: 9 },
  ]
}
